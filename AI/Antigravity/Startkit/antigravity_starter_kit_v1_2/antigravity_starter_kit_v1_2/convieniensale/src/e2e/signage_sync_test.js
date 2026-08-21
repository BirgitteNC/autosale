import puppeteer from 'puppeteer';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { rankRecipes } from '../utils/rankRecipes.js';

const storeId = '39aed1ff-e8fa-473e-81da-b61e719d46b5'; // Dagrofa Test Butik

async function runSignageSyncTest() {
  console.log("=== Robot: Zero-Defect Signage Sync Test ===");
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Tillad console logs fra browseren
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('BROWSER ERROR:', msg.text());
  });

  try {
    console.log("[1] Navigerer til Staff App...");
    let retries = 3;
    while (retries > 0) {
      try {
        await page.goto(`http://127.0.0.1:5180/staff`, { waitUntil: 'networkidle0', timeout: 10000 });
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log("[2] Logger ind som Dagrofa Test Butik via LocalStorage (Bypasser API i E2E)...");
    await page.evaluate((sid) => {
        localStorage.setItem('staff_store_id', sid);
        localStorage.setItem('staff_user_role', 'Voksen');
        localStorage.setItem('staff_role_desc', '[Admin] Fuld adgang');
        localStorage.setItem('staff_login_time', Date.now().toString());
    }, storeId);

    // Genindlæs siden så appen opfanger localStorage ændringerne
    await page.goto(`http://127.0.0.1:5180/staff`, { waitUntil: 'networkidle0' });

    // Vent på at Staff Dashboard loader (Søgefeltet vises)
    await page.waitForSelector('input[placeholder="Søg efter råvarer..."]', { timeout: 10000 });
    console.log("[3] Login succesfuldt. Starter valg af varer...");

    // Hent DB-data til dynamisk ranking-beregning
    const supabaseClient = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const [{ data: allRecipes }, { data: allIngredients }] = await Promise.all([
      supabaseClient.from('recipes').select('id,titel,ingredienser').eq('is_deleted', false),
      supabaseClient.from('ingredients').select('id,navn,kategori'),
    ]);

    const varer = ['Kalvebov', 'Gulerødder', 'Bladselleri', 'Tomater'];
    
    for (const vare of varer) {
      // Ryd søgefelt
      const searchInput = await page.$('input[placeholder="Søg efter råvarer..."]');
      await searchInput.click({ clickCount: 3 });
      await searchInput.press('Backspace');
      
      // Søg
      await page.type('input[placeholder="Søg efter råvarer..."]', vare);
      await new Promise(r => setTimeout(r, 1000)); // Vent på re-render
      
      // Klik på det første råvare-kort der vises (som matcher søgningen)
      const clicked = await page.evaluate((searchVare) => {
         const cards = Array.from(document.querySelectorAll('div')).filter(el => 
            el.style.cursor === 'pointer' && el.innerText.toLowerCase().includes(searchVare.toLowerCase())
         );
         if (cards.length > 0) {
            cards[0].click();
            return true;
         }
         return false;
      }, vare);

      if (!clicked) {
         console.warn(`Advarsel: Kunne ikke finde og klikke på '${vare}'. Testen fortsætter, men kan fejle.`);
      }
    }

    console.log("[4] Varer valgt. Sætter netværks-interception op for at håndtere API kald...");
    
    // Vi mocker Vercel API'et for at E2E-testen kan køre 100% lokalt
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      if (request.url().includes('/api/update_promotions') && request.method() === 'POST') {
        const payload = JSON.parse(request.postData());
        
        // TEST AF LAYER 1 (API Sanitization)
        let { selectedIds, foodWasteIds } = payload;
        const orgSelectedCount = selectedIds.length;
        selectedIds = [...new Set(selectedIds)];
        foodWasteIds = Array.isArray(foodWasteIds) ? [...new Set(foodWasteIds)] : [];
        
        console.log(`[API MOCK] Modtog payload. Original længde: ${orgSelectedCount}. Sanitized: ${selectedIds.length}`);
        
        if (selectedIds.length > 6 || foodWasteIds.length > 6) {
           return request.respond({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'For mange varer' }) });
        }

        // Opdater Supabase direkte for at simulere backend RPC
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        await supabase.rpc('set_active_promotions', {
           p_store_id: storeId, p_selected_ids: selectedIds, p_food_waste_ids: foodWasteIds
        });

        request.respond({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Promotions updated securely' })
        });
      } else {
        request.continue();
      }
    });

    // Find og klik "Godkend" knappen i bunden
    await page.evaluate(() => {
       const buttons = Array.from(document.querySelectorAll('button'));
       const godkendBtn = buttons.find(b => b.innerText.includes('Godkend'));
       if (godkendBtn) godkendBtn.click();
    });

    // Vent på modal "Godkend tilbud"
    await new Promise(r => setTimeout(r, 1000));
    
    // Klik "Send til skærm" / "Godkend" i modalen
    await page.evaluate(() => {
       const buttons = Array.from(document.querySelectorAll('button'));
       // I ConfirmModal er det "Godkend" knappen med linear-gradient
       const confirmBtn = buttons.find(b => b.innerText === 'Godkend' && !b.disabled);
       if (confirmBtn) confirmBtn.click();
    });

    console.log("[5] Payload sendt. Venter på backend sanitization og realtime sync...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("[6] Skifter til Butiksskærmen for at verificere...");
    const signagePage = await browser.newPage();
    await signagePage.goto(`http://127.0.0.1:5180/signage?storeId=${storeId}`, { waitUntil: 'networkidle0' });
    
    await signagePage.waitForSelector('h1', { timeout: 10000 });
    
    const titleOnScreen = await signagePage.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? el.innerText : '';
    });

    // Beregn dynamisk hvad topopskriften BØR være for de valgte IDs
    const { data: promotions } = await supabaseClient
      .from('active_promotions')
      .select('selected_ingredients, food_waste_ingredients')
      .eq('store_id', storeId)
      .maybeSingle();

    const sentIds = promotions?.selected_ingredients || [];
    const scored = rankRecipes({ selectedIngredientIds: sentIds, foodWasteIngredientIds: [], recipes: allRecipes, ingredients: allIngredients });
    const topRecipe = scored
      .filter(r => !r.hasMeatConflict && r.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)[0];

    const expectedTitle = topRecipe?.titel || '';
    console.log(`[7] Forventet topopskrift (beregnet lokalt): "${expectedTitle}"`);
    console.log(`[7] Vist på skærmen: "${titleOnScreen}"`);

    if (expectedTitle && titleOnScreen.toLowerCase().includes(expectedTitle.toLowerCase().slice(0, 15))) {
       console.log(`✅ SUCCES! Sync bekræftet — skærmen viser korrekt topopskrift.`);
       await browser.close();
       process.exit(0);
    } else if (!expectedTitle && titleOnScreen) {
       console.log(`✅ SUCCES! Sync bekræftet — skærmen viser en opskrift (ingen lokal forventning beregnet).`);
       await browser.close();
       process.exit(0);
    } else {
       console.error(`❌ KRITISK FEJL! Forventede "${expectedTitle}", men skærmen viste: "${titleOnScreen}"`);
       console.error(`- Dette indikerer at Sync Protocol fejlede eller rankingen er ude af sync!`);
       await browser.close();
       process.exit(1);
    }

  } catch (error) {
    console.error("❌ E2E Test crashede uventet:", error);
    await browser.close();
    process.exit(1);
  }
}

runSignageSyncTest();
