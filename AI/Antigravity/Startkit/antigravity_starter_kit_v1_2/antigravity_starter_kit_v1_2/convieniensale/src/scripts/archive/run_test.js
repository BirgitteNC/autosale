import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("== STARTER TEST AF DATABASE & RPC ==");

  // 1. Tjek vand og løg
  const { data: ingData } = await supabase.from('ingredients').select('id, navn, standard_vare').in('id', ['ing_vand', 'ing_loeg', 'ing_spidskaal']);
  console.log("\n1. Tjekker ingredienser:");
  console.table(ingData);

  // 2. Tjek ny opskrift
  const { data: recipeData } = await supabase.from('recipes').select('id, titel').eq('id', 'meny_okse_spidskaal');
  console.log("\n2. Tjekker ny opskrift (Oksekød/Spidskål):");
  console.table(recipeData);

  // 3. Tjek RPC Funktion (Drogon Protocol)
  console.log("\n3. Tjekker RPC funktionen (Sikkerhedsfejl)...");
  
  // Hent en gyldig PIN og Store ID
  const { data: pinData } = await supabase.from('store_pins').select('*').limit(1).single();
  if (!pinData) {
     console.log("❌ Kunne ikke finde en PIN kode at teste med.");
     return;
  }

  console.log(`Prøver at opdatere tilbud for butik: ${pinData.store_id} med PIN: ${pinData.pin_code}`);
  
  const { error: rpcError } = await supabase.rpc('update_store_promotions', {
    p_store_id: pinData.store_id,
    p_pin: pinData.pin_code,
    p_selected_ids: ['ing_loeg', 'ing_hakket_okse'],
    p_food_waste_ids: ['ing_spidskaal']
  });

  if (rpcError) {
    console.error("❌ RPC Fejlede:", rpcError);
  } else {
    console.log("✅ RPC Succes! Ingen sikkerhedsfejl.");
  }
}

runTest();
