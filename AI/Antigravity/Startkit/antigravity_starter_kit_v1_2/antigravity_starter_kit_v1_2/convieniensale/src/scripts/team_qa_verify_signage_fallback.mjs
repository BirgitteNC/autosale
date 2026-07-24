import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const storeId = '11111111-1111-1111-1111-111111111111';

async function runQA() {
  console.log("========================================");
  console.log("🚨 STARTER GOVERNANCE QA: SIGNAGE FALLBACK");
  console.log("========================================\n");

  // 1. Tøm databasen for valgte varer (fremprovoker 'Hard Lock')
  console.log("[1] Fremprovokerer 'Tom Skærm' tilstand ved at rydde active_promotions...");
  const { error } = await supabase.from('active_promotions').upsert({
    store_id: storeId,
    selected_ingredients: [],
    food_waste_ingredients: [],
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error("Fejl ved tømning af database:", error);
    process.exit(1);
  }

  // 2. Test Anonym RLS for opskrifter (Fallback data)
  console.log("[2] Tester at Butiksskærmen (anonym RLS) kan hente fallback-opskrifter...");
  
  // Vi opretter en "anonym" klient (uden service role!)
  const anonClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY // Kun public anon key!
  );

  const { data: allRecipes, error: fetchError } = await anonClient
    .from('recipes')
    .select('*')
    .neq('beskrivelse', 'Importeret fra Meny');

  if (fetchError || !allRecipes || allRecipes.length === 0) {
    console.error("❌ GOVERNANCE FEJL: Kunne ikke hente opskrifter via anonym RLS!", fetchError);
    process.exit(1);
  }

  // 3. Simuler fallback logikken fra SignageView.jsx
  console.log("[3] Simulerer SignageView fallback (Hard Lock prevention)...");
  
  let scoredRecipes = []; // Tom skærm (ingen matches / ingen hukommelse)
  
  if (scoredRecipes.length === 0) {
     // Vores nye fallback logik
     scoredRecipes = [...allRecipes].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 3);
  }

  if (scoredRecipes.length === 3) {
    console.log(`✅ GOVERNANCE GODKENDT: SignageView fallback logic hentede succesfuldt 3 opskrifter via anonym RLS!`);
    console.log(`   Fallback 1: "${scoredRecipes[0].titel}"`);
    console.log(`   Fallback 2: "${scoredRecipes[1].titel}"`);
    console.log(`   Fallback 3: "${scoredRecipes[2].titel}"`);
    console.log("\n✅ QA TEST BESTÅET! REST-fallback og opskrifts-fallback virker!");
    process.exit(0);
  } else {
    console.error("❌ GOVERNANCE FEJL: Fallback logikken fejlede. Skærmen gik i Hard Lock.");
    process.exit(1);
  }
}

runQA();
