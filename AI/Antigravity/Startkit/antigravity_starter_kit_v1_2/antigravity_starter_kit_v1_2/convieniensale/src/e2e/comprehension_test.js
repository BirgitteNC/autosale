import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://llfyffxbeuvwwethwbli.supabase.co';
const supabaseKey = 'REDACTED_ROTATE_THIS_KEY'; // SERVICE KEY
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
  const { error: err2 } = await supabase.from('active_promotions')
    .update({
      selected_ingredients: selectedIds,
      food_waste_ingredients: []
    })
    .eq('store_id', storeId);

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
  
  // Vi tester mod localhost, der kører under testen
  await page.goto('http://localhost:5173/signage', { waitUntil: 'networkidle0' });

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
  if (titleOnScreen === randomRecipe.titel) {
    console.log("✅ SUCCES! Forståelses-testen er bestået. Skærmen reagerede korrekt og placerede opskriften i toppen.");
    process.exit(0);
  } else {
    console.error(`❌ FEJL! Skærmen viste '${titleOnScreen}', men vi forventede at se '${randomRecipe.titel}'. Logikken er i stykker!`);
    process.exit(1);
  }
}

runTest();
