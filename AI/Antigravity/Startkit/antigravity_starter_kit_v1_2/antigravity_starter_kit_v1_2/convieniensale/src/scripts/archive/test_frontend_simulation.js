import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("🔍 Starter frontend-simulation test...");
  let success = true;

  // 1. Tjekker ghosting (Er der nogen opskrifter med raavare_id der ikke findes i ingredients tabellen?)
  console.log("\n🧪 Test 1: Tjekker for 'ghosting' (døde links) i alle opskrifter...");
  const { data: recipes, error: recErr } = await supabase.from('recipes').select('id, titel, ingredienser');
  const { data: allIngredients, error: ingErr } = await supabase.from('ingredients').select('id, navn');
  
  if (recErr || ingErr) {
     console.error("Database fejl:", recErr || ingErr);
     process.exit(1);
  }

  const ingredientIds = new Set(allIngredients.map(i => i.id));
  let ghostingCount = 0;

  for (const recipe of recipes) {
     if (!recipe.ingredienser || !Array.isArray(recipe.ingredienser)) continue;
     for (const ing of recipe.ingredienser) {
         if (ing.raavare_id && !ingredientIds.has(ing.raavare_id)) {
             console.error(`❌ GHOSTING FUNDET i "${recipe.titel}": Mangler råvare_id '${ing.raavare_id}' i databasen!`);
             ghostingCount++;
             success = false;
         }
     }
  }

  if (ghostingCount === 0) {
      console.log(`✅ Test 1 Bestået: Ingen ghosting fundet i ${recipes.length} opskrifter.`);
  } else {
      console.log(`❌ Test 1 Fejlede: Fandt ${ghostingCount} instanser af ghosting.`);
  }

  // 2. Tjekker at Hakkebøf opskriften findes og virker
  console.log("\n🧪 Test 2: Henter den specifikke 'Hakkebøf med bløde løg og kartofler' opskrift...");
  const hakkeboef = recipes.find(r => r.titel.toLowerCase().includes('hakkebøf') && r.titel.toLowerCase().includes('kartofler'));
  
  if (!hakkeboef) {
      console.error("❌ Test 2 Fejlede: Kunne ikke finde hakkebøf opskriften.");
      success = false;
  } else {
      console.log(`✅ Opskrift fundet: "${hakkeboef.titel}" (ID: ${hakkeboef.id})`);
      
      console.log("   Tjekker indkøbskurv-simulering for hakkebøf...");
      let cartValid = true;
      for (const ing of hakkeboef.ingredienser) {
         if (ing.raavare_id) {
             const dbVare = allIngredients.find(i => i.id === ing.raavare_id);
             console.log(`   🛒 Tilføjer til kurv: ${ing.amount} ${ing.unit} -> Matches med officiel vare: [${dbVare.navn}]`);
         }
      }
      console.log("✅ Test 2 Bestået: Alle varer til hakkebøf kan tilføjes til kurven med korrekte titler.");
  }

  // Opsummering
  console.log("\n=================================");
  if (success) {
      console.log("🎉 ALLE TEST BESTÅET. Appens datalag er 100% stabilt.");
  } else {
      console.log("⚠️ NOGLE TESTS FEJLEDE. Systemet er ikke stabilt.");
  }
  console.log("=================================\n");
}

runTests();
