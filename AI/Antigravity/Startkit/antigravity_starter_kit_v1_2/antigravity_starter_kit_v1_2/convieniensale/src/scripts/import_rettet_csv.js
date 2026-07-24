import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const csvPath = path.join(__dirname, '../manglende_maengder_rettet.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8').split('\n');

  console.log('Læser CSV...');

  const recipeUpdates = new Map(); // recipe_id -> [] of ingredients
  const missingIngredients = new Map(); // raavare_id -> navn

  for (let i = 1; i < csvContent.length; i++) {
    const line = csvContent[i].trim();
    if (!line) continue;

    const parts = line.split(';');
    const opskrift_id = parts[0].replace(/^"|"$/g, '').trim();
    // Opskrift Titel = parts[1]
    let raavare_id = parts[2] ? parts[2].replace(/^"|"$/g, '').trim() : '';
    let navn = parts[3] ? parts[3].replace(/^"|"$/g, '').trim() : '';
    let maengdeStr = parts[4] ? parts[4].replace(/^"|"$/g, '').trim() : '';
    let enhed = parts[5] ? parts[5].replace(/^"|"$/g, '').trim() : '';

    if (!opskrift_id) continue;

    if (!raavare_id && navn) {
      // Generer et ID hvis det stadig mangler
      raavare_id = 'ing_auto_' + Math.random().toString(36).substr(2, 9);
    }

    if (raavare_id.startsWith('ing_meny_auto_') || raavare_id.startsWith('ing_auto_')) {
      if (!missingIngredients.has(raavare_id)) {
        missingIngredients.set(raavare_id, navn);
      }
    }

    let maengde = 0;
    if (maengdeStr) {
      maengdeStr = maengdeStr.replace(',', '.');
      maengde = parseFloat(maengdeStr);
      if (isNaN(maengde)) maengde = 0;
    }
    
    // Hvis enheden er helt blank og mængden er 0, sætter vi defaults.
    if (!enhed && maengde === 0) {
       enhed = 'smag';
    }

    if (!recipeUpdates.has(opskrift_id)) {
      recipeUpdates.set(opskrift_id, []);
    }

    recipeUpdates.get(opskrift_id).push({
      navn: navn,
      enhed: enhed,
      mængde: maengde,
      raavare_id: raavare_id
    });
  }

  console.log(`Fandt ${missingIngredients.size} nye råvarer der skal oprettes...`);
  
  // Insert missing ingredients
  const newIngs = Array.from(missingIngredients.entries()).map(([id, n]) => ({
    id: id,
    navn: n,
    kategori: 'diverse',
    standard_vare: false
  }));

  if (newIngs.length > 0) {
    // Bulk insert i chunks of 100
    for (let i = 0; i < newIngs.length; i += 100) {
      const chunk = newIngs.slice(i, i + 100);
      const { error } = await supabase.from('ingredients').upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error('Fejl ved oprettelse af råvarer:', error);
      }
    }
    console.log('Nye råvarer er oprettet/opdateret.');
  }

  console.log(`Klar til at opdatere ${recipeUpdates.size} opskrifter...`);

  let count = 0;
  for (const [recipe_id, ingredientsArr] of recipeUpdates.entries()) {
    const { error } = await supabase.from('recipes').update({ 
        ingredienser: ingredientsArr
    }).eq('id', recipe_id);

    if (error) {
      console.error(`Fejl ved opdatering af opskrift ${recipe_id}:`, error);
    } else {
      count++;
      if (count % 10 === 0) console.log(`Opdateret ${count} opskrifter...`);
    }
  }

  console.log(`Færdig! Opdaterede ${count} opskrifter succesfuldt!`);
}

run().catch(console.error);
