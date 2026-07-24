import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- QA VERIFICERING: Tjekker Pesto-rettelse ---");

  // Tjekker råvaren
  const { data: ing } = await supabase
    .from('ingredients')
    .select('navn, kategori')
    .eq('id', 'ing_meny_auto_1244')
    .single();
    
  console.log("Ingrediens status:");
  console.log(`  Navn: ${ing.navn}`);
  console.log(`  Kategori: ${ing.kategori}`);
  if (ing.navn !== 'Grøn Pesto') {
     console.error("❌ FEJL: Ingrediens har forkert navn!");
     return;
  }

  // Tjekker opskriften
  const recipeId = 'meny_R3JpbGxldCBtZWR';
  const { data: recipe } = await supabase
    .from('recipes')
    .select('ingredienser')
    .eq('id', recipeId)
    .single();
    
  const targetIng = recipe.ingredienser.find(i => i.raavare_id === 'ing_meny_auto_1244');
  console.log("\nOpskrift status:");
  if (targetIng) {
     console.log(`  Fundet ingrediens: ${targetIng.mængde} ${targetIng.enhed} ${targetIng.navn}`);
     if (targetIng.navn === 'Grøn Pesto') {
        console.log("✅ SUCCES: Opskriften er renset og peger nu korrekt på Grøn Pesto.");
     } else {
        console.error("❌ FEJL: Opskriften har ikke det rigtige navn for pestoen!");
     }
  } else {
     console.error("❌ FEJL: Kunne slet ikke finde raavare_id ing_meny_auto_1244 i opskriften.");
  }
}

run();
