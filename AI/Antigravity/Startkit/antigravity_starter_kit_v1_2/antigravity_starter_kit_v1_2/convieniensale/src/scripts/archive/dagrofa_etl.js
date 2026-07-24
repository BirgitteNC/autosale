import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function authenticate() {
   // Prøv at logge ind
   let { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@meny.dk',
      password: 'SuperSecretPassword123!'
   });
   
   if (error) {
      // Hvis brugeren ikke findes, opret den
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
         email: 'test@meny.dk',
         password: 'SuperSecretPassword123!'
      });
      if (signUpErr) console.warn("SignUp warning:", signUpErr.message);
      
      // Prøv at logge ind igen
      const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({
         email: 'test@meny.dk',
         password: 'SuperSecretPassword123!'
      });
      if (retryErr) throw retryErr;
   }
   console.log("🔐 Authentificeret som admin for at bypass RLS.");
}

function parseMaengde(maengdeStr) {
   if (!maengdeStr) return { amount: null, unit: null, text: 'Efter behov' };
   
   const lower = maengdeStr.toLowerCase();
   if (lower.includes('behov') || lower.includes('tilpasset')) {
       return { amount: null, unit: null, text: maengdeStr };
   }
   
   // Håndter brøker: "1/2 tsk"
   const fracMatch = maengdeStr.match(/^(\d+)\/(\d+)\s*(.*)$/);
   if (fracMatch) {
       let amount = parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
       let unit = fracMatch[3].trim();
       return { amount, unit, text: maengdeStr };
   }

   // Håndter decimaltal og heltal: "1.5 kg", "2 dåser", "0,5"
   const match = maengdeStr.match(/^([\d.,]+)\s*(.*)$/);
   if (match) {
       let numStr = match[1].replace(',', '.');
       let amount = parseFloat(numStr);
       let unit = match[2].trim();
       return { amount, unit, text: maengdeStr };
   }

   // Fallback
   return { amount: null, unit: null, text: maengdeStr };
}

async function runETL() {
  console.log("🚀 Starter Dagrofa ETL Pipeline (SQL Generation Mode)...");

  // 1. SLET AL GAMMEL DATA
  console.log("1️⃣  Rydder op i eksisterende opskrifter i Supabase...");
  // Hent alle IDs
  const { data: oldRecipes, error: fetchErr } = await supabase.from('recipes').select('id');
  if (fetchErr) throw fetchErr;
  
  if (oldRecipes && oldRecipes.length > 0) {
     const oldIds = oldRecipes.map(r => r.id);
     // Batch delete
     for (let i = 0; i < oldIds.length; i += 100) {
        const chunk = oldIds.slice(i, i + 100);
        const { error: delErr } = await supabase.from('recipes').delete().in('id', chunk);
        if (delErr) throw delErr;
     }
     console.log(`✅ Slettede ${oldRecipes.length} gamle opskrifter.`);
  } else {
     console.log("✅ Ingen gamle opskrifter at slette.");
  }

  // 2. HENT INGREDIENSER (REFERENCE)
  console.log("2️⃣  Henter officielle råvarer fra Supabase...");
  const { data: ingredients, error: ingErr } = await supabase.from('ingredients').select('id, navn, kategori');
  if (ingErr) throw ingErr;

  // Byg ordbog (med lidt fuzzy rules for kritisk mapping)
  const ingMap = ingredients.map(ing => {
    let searchTerms = [ing.navn.toLowerCase()];
    if (ing.navn.toLowerCase().includes('oksekød')) searchTerms.push('oksekød');
    if (ing.navn.toLowerCase().includes('kartofler') || ing.navn.toLowerCase().includes('kartoffel')) {
        searchTerms.push('kartofler', 'kartoffel', 'bagekartofler');
    }
    if (ing.navn.toLowerCase().includes('løg')) searchTerms.push('rødløg', 'hvidløg', 'forårsløg');
    if (ing.navn.toLowerCase().includes('mælk')) searchTerms.push('mælk', 'kærnemælk', 'sødmælk');
    if (ing.navn.toLowerCase().includes('tomat')) searchTerms.push('tomater', 'tomat', 'tomatpuré', 'tomatpure');
    return { ...ing, searchTerms };
  });

  // 3. LÆS LOKALE DAGROFA DATA
  console.log("3️⃣  Læser scraped_meny_recipes.json...");
  const dataPath = '../datasets/scraped_meny_recipes.json';
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let recipesToInsert = [];
  let noMatchCount = 0;

  for (const r of rawData) {
     // Transform Ingredienser
     let parsedIngredients = [];
     let mappedCount = 0;
     
     for (const ingText of r.ingredients) {
        const lowerText = ingText.toLowerCase();
        let matchedId = null;
        
        // Find match
        for (const ing of ingMap) {
           if (ing.searchTerms.some(term => lowerText.includes(term))) {
              matchedId = ing.id;
              break;
           }
        }
        
        if (matchedId) mappedCount++;
        
        const parsed = parseMaengde(ingText);
        parsedIngredients.push({
           raavare_id: matchedId, // Kan være null, hvis der ikke er et internt match (f.eks. "2 spsk olivenolie" hvis vi mangler olivenolie)
           amount: parsed.amount,
           unit: parsed.unit,
           text: parsed.text
        });
     }
     
     // REGLER: Vi uploader KUN opskriften, hvis vi har matchet mindst 2 ingredienser til vores råvarekatalog.
     // Dette sikrer at databasen ikke fyldes med irrelevante opskrifter, som ikke bruger de varer vi tracker.
     if (mappedCount >= 2) {
        // Find et tidsforbrug. Meny opskrifter har formatet "0-30 min" som tekst i json (nogle gange gemt i array? Nej)
        // I json ligger "30-60 min" nogle gange som strings. Vi sætter default til 30.
        recipesToInsert.push({
           id: "meny_" + Buffer.from(r.title).toString('base64').substring(0, 15).replace(/[^a-zA-Z0-9]/g, ''),
           titel: r.title,
           beskrivelse: "Importeret fra Meny",
           billed_url: r.imageUrl || '',
           portioner: 4,
           tidsforbrug_min: 30,
           instruktioner: r.instructions ? r.instructions.split('\n').filter(l => l.trim().length > 0) : [],
           ingredienser: parsedIngredients,
           tags: []
        });
     } else {
        noMatchCount++;
     }
  }

  console.log(`   --> Fandt ${recipesToInsert.length} solide opskrifter med god data mapping. Kasserede ${noMatchCount} for at bevare data-integritet.`);

  // 4. GENERER SQL FIL
  console.log("4️⃣  Genererer insert_recipes.sql...");
  if (recipesToInsert.length > 0) {
      let sql = "DELETE FROM recipes;\n\n";
      for (const r of recipesToInsert) {
         const ingredienserJson = JSON.stringify(r.ingredienser).replace(/'/g, "''");
         const instruktionerJson = JSON.stringify(r.instruktioner).replace(/'/g, "''");
         const tagsJson = JSON.stringify(r.tags).replace(/'/g, "''");
         const titel = r.titel.replace(/'/g, "''");
         const beskrivelse = r.beskrivelse.replace(/'/g, "''");
         
         sql += `INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) VALUES ('${r.id}', '${titel}', '${beskrivelse}', '${r.billed_url}', ${r.portioner}, ${r.tidsforbrug_min}, '${instruktionerJson}'::jsonb, '${ingredienserJson}'::jsonb, '${tagsJson}'::jsonb);\n`;
      }
      
      fs.writeFileSync('insert_recipes.sql', sql);
      console.log(`✅ Oprettede insert_recipes.sql med ${recipesToInsert.length} opskrifter.`);
  } else {
      console.log("❌ Ingen opskrifter at generere SQL for.");
  }
  
  console.log("🎉 ETL Pipeline færdig!");
}

runETL().catch(console.error);
