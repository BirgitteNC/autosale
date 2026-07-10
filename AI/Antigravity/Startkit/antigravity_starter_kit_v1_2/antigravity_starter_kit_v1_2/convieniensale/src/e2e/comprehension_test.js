import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Mangler VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY i miljøet (se .env).');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const storeId = '11111111-1111-1111-1111-111111111111';

async function runTest() {
  console.log("=== Nørde-Niels Forståelses-Test ===");
  
  // 1. Hent alle opskrifter
  const { data: recipes, error: err1 } = await supabase.from('recipes').select('*');
  if (err1 || !recipes || recipes.length === 0) {
    console.error("Fejl: Kunne ikke hente opskrifter fra DB.");
    process.exit(1);
  }

  // 2. Vælg en tilfældig opskrift
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
  console.log(`[1] Valgt tilfældig opskrift: "${randomRecipe.titel}"`);

  // 3. Vælg 1-2 tilfældige ingredienser fra opskriften
  const ings = randomRecipe.ingredienser || [];
  if (ings.length === 0) {
    console.error("Fejl: Den valgte opskrift har ingen ingredienser!");
    process.exit(1);
  }
  
  // Shuffle array let
  const shuffledIngs = ings.sort(() => 0.5 - Math.random());
  const selectedIds = shuffledIngs.slice(0, 2).map(i => i.raavare_id);
  
  console.log(`[2] Medarbejder vælger råvare IDs: ${selectedIds.join(', ')}`);

  // 4. Opdater active_promotions (Simulér Medarbejder Tablet "Send")
  let err2 = null;
  const { data: existing } = await supabase.from('active_promotions').select('id').eq('store_id', storeId).maybeSingle();
  
  if (existing) {
    const { error } = await supabase.from('active_promotions').update({
      selected_ingredients: selectedIds,
      food_waste_ingredients: [],
      updated_at: new Date().toISOString()
    }).eq('store_id', storeId);
    err2 = error;
  } else {
    const { error } = await supabase.from('active_promotions').insert({
      store_id: storeId,
      selected_ingredients: selectedIds,
      food_waste_ingredients: [],
      updated_at: new Date().toISOString()
    });
    err2 = error;
  }

  if (err2) {
    console.error("Fejl: Kunne ikke opdatere active_promotions", err2);
    process.exit(1);
  }

  console.log("[3] Promotion sendt til databasen. Venter på realtime synkronisering...");
  
  // Giv realtime tid til at ramme skærmen
  await new Promise(r => setTimeout(r, 2000));

  // 5. Åbn Puppeteer for at se Butiksskærmen
  console.log("[4] Åbner Butiksskærm i robot-browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Vi tester mod localhost, der kører under testen på port 5180, MED storeId!
  await page.goto(`http://127.0.0.1:5180/signage?storeId=${storeId}`, { waitUntil: 'networkidle0' });

  try {
    await page.waitForSelector('h1', { timeout: 5000 });
  } catch (e) {
    console.error("Fejl: Skærmen viste aldrig nogen opskrifter (Timeout). Er systemet crashet?");
    await browser.close();
    process.exit(1);
  }

  // Læs titlen på opskriften på skærmen
  const titleOnScreen = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return el ? el.innerText : '';
  });

  console.log(`[5] Aflæst opskrift på skærmen: ${titleOnScreen}`);

  await browser.close();

  // 6. Verifikation
  if (!titleOnScreen || titleOnScreen === 'MENY') {
    console.error(`❌ FEJL! Skærmen viste '${titleOnScreen}', men vi forventede at se en opskrift!`);
    process.exit(1);
  }

  // Tjek om opskriften på skærmen rent faktisk indeholder de ingredienser, vi valgte
  const screenRecipe = recipes.find(r => r.titel === titleOnScreen);
  if (!screenRecipe) {
    console.error(`❌ FEJL! Skærmen viste '${titleOnScreen}', som ikke findes i opskrifts-databasen!`);
    process.exit(1);
  }

  const screenRecipeIngs = (screenRecipe.ingredienser || []).map(i => i.raavare_id);
  const hasMatch = selectedIds.some(id => screenRecipeIngs.includes(id));

  if (hasMatch) {
    console.log(`✅ SUCCES! Forståelses-testen er bestået. Skærmen viste '${titleOnScreen}' som indeholder de promoverede ingredienser.`);
    process.exit(0);
  } else {
    console.error(`❌ FEJL! Skærmen viste '${titleOnScreen}', men den indeholder IKKE de valgte råvarer (${selectedIds.join(', ')}). Logikken er i stykker!`);
    process.exit(1);
  }
}

runTest();
