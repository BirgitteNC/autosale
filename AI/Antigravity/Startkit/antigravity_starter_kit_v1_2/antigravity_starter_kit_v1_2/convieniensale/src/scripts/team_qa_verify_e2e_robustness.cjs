require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL.replace(/\r\n/g, '').trim();
const key = process.env.VITE_SUPABASE_ANON_KEY.replace(/\r\n/g, '').trim();
const supabase = createClient(url, key);

async function runE2E() {
    console.log("==================================================");
    console.log("STARTER FUCKING GRUNDIG END-TO-END TEST (E2E)");
    console.log("==================================================\n");

    let errors = 0;
    const storeId = '11111111-1111-1111-1111-111111111111'; // Domus Vista

    // --- TEST 1: LOGIN FLOWS ---
    console.log("TEST 1: Verificerer PIN-koder og Rolletildeling (RPC)");
    const pinsToTest = [
        { pin: '1007', expectedRole: '[Voksen]' },
        { pin: '0103', expectedRole: '[Voksen]' },
        { pin: '2007', expectedRole: '[Ungarbejder]' }
    ];

    for (const p of pinsToTest) {
        const { data, error } = await supabase.rpc('verify_staff_pin', {
            p_store_id: storeId,
            p_pin_code: p.pin
        });
        if (error || !data || data.length === 0 || !data[0].is_valid) {
            console.error(`[FEJL] PIN ${p.pin} fejlede login!`);
            errors++;
        } else if (!data[0].role_description.includes(p.expectedRole)) {
            console.error(`[FEJL] PIN ${p.pin} fik forkert rolle: ${data[0].role_description}`);
            errors++;
        } else {
            console.log(`[OK] PIN ${p.pin} loggede ind succesfuldt som: ${data[0].role_description}`);
        }
    }
    console.log("");

    // --- TEST 2: DATA SUNDHED (KØD-KONFLIKTER) ---
    console.log("TEST 2: Verificerer Data Governance (Er Grøntsager Kød?)");
    const { data: wrongIngredients, error: ingError } = await supabase
        .from('ingredients')
        .select('navn, kategori')
        .in('kategori', ['Slagter', 'Fiskeafdeling', 'Kød', 'Fisk'])
        .ilike('navn', '%koriander%');
    
    if (ingError) {
        console.error("[FEJL] Kunne ikke læse ingredienser:", ingError);
        errors++;
    } else if (wrongIngredients.length > 0) {
        console.error(`[FEJL] Fandt Grøntsager/Krydderier i kødafdelingen:`, wrongIngredients);
        errors++;
    } else {
        console.log("[OK] Ingen 'Koriander' eller lignende fundet i Slagter-afdelingen.");
    }
    console.log("");

    // --- TEST 3: MATCHING ALGORITME (DEN DER FEJLEDE FØR) ---
    console.log("TEST 3: Simulerer Signage Skærmens Kød-Konflikt Algoritme");
    // Vi vælger Løg (Grønt), Mozzarella (Mejeri), Kylling (Slagter)
    const currentSelected = ['ing_loeg', 'ing_meny_auto_9', 'ing_meny_auto_976'];
    const currentWaste = [];

    const { data: allRecipes } = await supabase.from('recipes').select('*').neq('beskrivelse', 'Importeret fra Meny');
    const { data: allIngredients } = await supabase.from('ingredients').select('id, kategori, navn');
    
    const ingCategoryMap = {};
    const ingNameMap = {};
    allIngredients.forEach(i => { 
        ingCategoryMap[i.id] = i.kategori; 
        ingNameMap[i.id] = i.navn;
    });

    const meatCategories = ['Kød', 'Slagter', 'Fiskeafdeling'];
    const userSelectedMeats = currentSelected.filter(id => meatCategories.includes(ingCategoryMap[id]));

    let scoredRecipes = allRecipes.map(recipe => {
        const recipeIngs = recipe.ingredienser || [];
        let matchCount = 0;
        let wasteCount = 0;
        let hasMeatConflict = false;

        recipeIngs.forEach(ri => {
            if (currentSelected.includes(ri.raavare_id)) matchCount++;
            if (currentWaste.includes(ri.raavare_id)) wasteCount++;
        });

        if (userSelectedMeats.length > 0) {
            const recipeMeats = recipeIngs.filter(ri => {
                if (['ing_koriander', 'ing_meny_auto_104'].includes(ri.raavare_id)) return false;
                return meatCategories.includes(ingCategoryMap[ri.raavare_id]);
            });
            if (recipeMeats.length > 0) {
                const hasRequestedMeat = recipeMeats.some(rm => userSelectedMeats.includes(rm.raavare_id));
                if (!hasRequestedMeat) {
                    hasMeatConflict = true; 
                }
            }
        }
        return { ...recipe, matchCount, foodWasteCount: wasteCount, hasMeatConflict };
    });

    scoredRecipes = scoredRecipes.filter(r => !r.hasMeatConflict);
    scoredRecipes = scoredRecipes.filter(r => r.matchCount > 0 || r.foodWasteCount > 0);

    if (scoredRecipes.length === 0) {
        console.error("[CRITICAL FEJL] Algoritmen returnerede 0 opskrifter for Kylling+Løg+Mozzarella! Madspildsskærm vises!");
        errors++;
    } else {
        console.log(`[OK] Algoritmen overlevede og returnerede ${scoredRecipes.length} opskrifter.`);
        console.log(`     Top opskrift fundet: "${scoredRecipes[0].titel}"`);
    }
    console.log("");

    // --- TEST 4: KUNDEVENDT OPSKRIFT LOADER ---
    console.log("TEST 4: Verificerer at den nye rødspætte-opskrift er formateret korrekt til kundens mobil");
    const { data: fishRecipe, error: fishErr } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', 'manual_roedspaette_1')
        .single();
    
    if (fishErr || !fishRecipe) {
        console.error("[FEJL] Kunne ikke finde Rødspætte-opskriften i databasen.");
        errors++;
    } else {
        if (!Array.isArray(fishRecipe.instruktioner) || fishRecipe.instruktioner.length < 5) {
            console.error("[FEJL] Instruktionerne er ikke et gyldigt JSON array af strings!");
            errors++;
        } else {
            console.log(`[OK] Rødspætte-opskrift læst korrekt. Antal trin: ${fishRecipe.instruktioner.length}`);
        }
    }
    console.log("");

    console.log("==================================================");
    if (errors === 0) {
        console.log("✅ ALLE E2E TESTS BESTÅET! Systemet er sundt og robust.");
    } else {
        console.log(`❌ E2E TEST FEJLEDE MED ${errors} FEJL!`);
    }
    console.log("==================================================");
}

runE2E();
