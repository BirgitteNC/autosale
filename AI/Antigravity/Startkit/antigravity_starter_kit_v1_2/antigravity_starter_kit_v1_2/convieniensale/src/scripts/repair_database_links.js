import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function runAudit() {
  console.log("Henter ingredienser fra Supabase...");
  const { data: ingredients, error: ingErr } = await supabase.from('ingredients').select('id, navn, alternativ_id');
  if (ingErr) throw ingErr;

  console.log("Henter opskrifter fra Supabase...");
  const { data: recipes, error: recErr } = await supabase.from('recipes').select('id, titel, ingredienser');
  if (recErr) throw recErr;

  let auditLog = [];
  let successCount = 0;
  let failureCount = 0;
  let beefRecipes = [];
  let potatoRecipes = [];
  let bothRecipes = [];

  const ingMap = ingredients.map(ing => {
    let searchTerms = [ing.navn.toLowerCase()];
    if (ing.navn.toLowerCase().includes('oksekød')) searchTerms.push('oksekød');
    if (ing.navn.toLowerCase().includes('kartofler') || ing.navn.toLowerCase().includes('kartoffel')) {
        searchTerms.push('kartofler', 'kartoffel', 'bagekartofler', 'bagekartoffel', 'sødekartofler');
    }
    if (ing.navn.toLowerCase().includes('løg')) searchTerms.push('rødløg', 'hvidløg', 'forårsløg');
    return { ...ing, searchTerms };
  });

  for (const recipe of recipes) {
    let matchedIds = new Set();
    let originalTextList = [];
    
    const ingList = recipe.ingredienser || [];
    for (const item of ingList) {
      let textToSearch = "";
      if (typeof item === 'string') textToSearch = item;
      else if (item.text) textToSearch = item.text;
      else if (item.maengde) textToSearch = item.maengde;
      
      if (!textToSearch) continue;
      originalTextList.push(textToSearch);
      
      const lowerText = textToSearch.toLowerCase();
      
      for (const ing of ingMap) {
        if (ing.searchTerms.some(term => lowerText.includes(term))) {
          matchedIds.add(ing.id);
        }
      }
    }

    const matchedArray = Array.from(matchedIds);
    if (matchedArray.length > 0) {
      successCount++;
    } else {
      failureCount++;
    }

    const hasBeef = matchedArray.some(id => ingredients.find(i => i.id === id)?.navn.toLowerCase().includes('oksekød'));
    const hasPotato = matchedArray.some(id => ingredients.find(i => i.id === id)?.navn.toLowerCase().includes('kartof'));

    if (hasBeef) beefRecipes.push(recipe.titel);
    if (hasPotato) potatoRecipes.push(recipe.titel);
    if (hasBeef && hasPotato) bothRecipes.push(recipe.titel);

    auditLog.push(`### Opskrift: ${recipe.titel}`);
    const tag1 = hasBeef ? '🥩 ' : '';
    const tag2 = hasPotato ? '🥔 ' : '';
    auditLog.push(`Tags: ${tag1}${tag2}`);
    auditLog.push(`Original tekst: ${originalTextList.slice(0, 4).join(', ')} ...`);
    
    const matchedNames = matchedArray.map(id => ingredients.find(i => i.id === id)?.navn).join(', ');
    auditLog.push(`Matchede Råvarer: **${matchedArray.length > 0 ? matchedNames : 'INGEN MATCH'}**\n`);
  }

  const report = `# TØRLØB AUDIT RAPPORT (DRY-RUN)
*Dette script har udelukkende læst data. Intet er ændret i databasen endnu.*

## STATISTIK
- **Totalt antal opskrifter læst:** ${recipes.length}
- **Opskrifter hvor vi fandt mindst 1 genkendelig råvare:** ${successCount}
- **Opskrifter hvor INGEN råvarer kunne genkendes:** ${failureCount}

## SPECIFIK SØGNING (Oksekød & Kartofler)
- Antal opskrifter fundet med Oksekød: ${beefRecipes.length}
- Antal opskrifter fundet med Kartofler: ${potatoRecipes.length}
- **Antal opskrifter fundet med BÅDE Oksekød og Kartofler:** ${bothRecipes.length}

> [!TIP]
> **Eksempler på opskrifter med BÅDE Oksekød og Kartofler:**
> - ${bothRecipes.slice(0, 5).join('\n> - ')}

---
## STIKPRØVER FRA LOGGEN (Top 15)
Læs venligst de første 15 stikprøver igennem. Hvis "Matchede Råvarer" ser korrekte ud i forhold til den originale tekst, virker matematikken!

${auditLog.slice(0, 60).join('\n')}
`;

  fs.writeFileSync('C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\mapping_audit_report.md', report);
  console.log("Audit rapport gemt direkte i artifacts!");
}

runAudit().catch(console.error);
