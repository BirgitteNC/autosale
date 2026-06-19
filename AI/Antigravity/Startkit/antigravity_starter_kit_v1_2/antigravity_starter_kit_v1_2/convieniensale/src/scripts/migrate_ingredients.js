import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

   // Fallback, f.eks. "Lidt", "En knivspids"
   return { amount: null, unit: null, text: maengdeStr };
}

async function migrate() {
  console.log("Henter opskrifter for migration...");
  const { data: recipes, error } = await supabase.from('recipes').select('id, ingredienser');
  if (error || !recipes) return console.error(error);
  
  let successCount = 0;
  
  for (const recipe of recipes) {
     const newIngs = recipe.ingredienser.map(ing => {
        // Hvis den allerede er migreret, hop over
        if (ing.amount !== undefined || ing.text !== undefined) return ing;
        
        const parsed = parseMaengde(ing.maengde);
        return {
           raavare_id: ing.raavare_id,
           amount: parsed.amount,
           unit: parsed.unit,
           text: parsed.text
           // Vi fjerner 'maengde' og erstatter den med struktur
        };
     });
     
     const { error: upErr } = await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', recipe.id);
     if (upErr) {
        console.error("Fejl på opskrift", recipe.id, upErr);
     } else {
        successCount++;
     }
  }
  
  console.log(`Migrering fuldført. ${successCount} opskrifter opdateret.`);
}

migrate();
