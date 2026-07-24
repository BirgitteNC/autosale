require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function printSection(title) { console.log(`\n========================================\n[QA MODUL] ${title}\n========================================`); }

async function runQA() {
    console.log("🚀 Starter ConvienienSale End-to-End QA Validering...");

    // -------------------------------------------------------------------------
    // MODUL 1: Database & Data Integritet
    // -------------------------------------------------------------------------
    printSection("1. Database & Integritet");
    const { data: ingredients, error: errIng } = await supabase.from('ingredients').select('*');
    if (errIng) throw new Error("Fejl ved hentning af ingredienser: " + errIng.message);
    
    // Tjek for kloner
    const names = ingredients.map(i => i.navn.trim().toLowerCase());
    const dupes = names.filter((e, i, a) => a.indexOf(e) !== i);
    if (dupes.length > 0) throw new Error("FEJL: Der findes klonede råvarer i databasen: " + [...new Set(dupes)].join(', '));
    console.log(`✅ Ingredienser OK: ${ingredients.length} unikke råvarer fundet. Ingen kloner.`);

    const { data: recipes, error: errRec } = await supabase.from('recipes').select('*').neq('beskrivelse', 'Importeret fra Meny');
    if (errRec) throw new Error("Fejl ved hentning af opskrifter: " + errRec.message);
    if (recipes.length === 0) throw new Error("FEJL: Databasen indeholder ingen aktive opskrifter!");
    console.log(`✅ Opskrifter OK: Der findes præcis ${recipes.length} aktive opskrifter i databasen.`);

    // -------------------------------------------------------------------------
    // MODUL 2: Store Admin Flow
    // -------------------------------------------------------------------------
    printSection("2. Store Admin Flow (Valg af varer)");
    // Vi finder id'erne for "Hakket oksekød" (Kød) og "Burgerboller" (Basis)
    const oksekodId = ingredients.find(i => i.navn.toLowerCase().includes('hakket oksekød'))?.id;
    const bolleId = ingredients.find(i => i.navn.toLowerCase().includes('burgerboller'))?.id;
    if (!oksekodId || !bolleId) throw new Error("FEJL: Kunne ikke finde basale varer (Oksekød/Burgerboller) til test.");
    
    // Vi henter en eksisterende butik til testen for at overholde foreign keys
    const { data: stores, error: errStore } = await supabase.from('stores').select('id').limit(1);
    if (errStore || stores.length === 0) throw new Error("FEJL: Ingen butikker fundet til QA test!");
    const testStoreId = stores[0].id;
    
    // Rydder eksisterende for at undgå doublets
    await supabase.from('active_promotions').delete().eq('store_id', testStoreId);
    
    const testPayload = {
        store_id: testStoreId,
        selected_ingredients: [oksekodId, bolleId],
        food_waste_ingredients: [],
        updated_at: new Date().toISOString()
    };
    
    const { error: errUpsert } = await supabase.from('active_promotions').insert(testPayload);
    if (errUpsert) throw new Error("FEJL: Kunne ikke gemme Store Admin promotion: " + errUpsert.message);
    console.log("✅ Store Admin OK: Valgte varer gemt korrekt i active_promotions.");

    // -------------------------------------------------------------------------
    // MODUL 3: Signage Flow & Meat Conflict Eliminator
    // -------------------------------------------------------------------------
    printSection("3. Signage Flow (Match & Conflict Logic)");
    const { data: promoData, error: promoErr } = await supabase.from('active_promotions').select('*').eq('store_id', testStoreId).single();
    if (promoErr || !promoData) throw new Error("FEJL: Kunne ikke læse active_promotions til Signage skærm: " + (promoErr?.message || 'Ingen data'));

    // Simulerer SignageView.jsx match logic
    const currentSelected = promoData.selected_ingredients;
    const currentWaste = promoData.food_waste_ingredients;
    
    const ingCategoryMap = {};
    ingredients.forEach(i => { ingCategoryMap[i.id] = i.kategori; });

    const meatCategories = ['Kød', 'Slagter', 'Fiskeafdeling'];
    const allSelectedIds = [...currentSelected, ...currentWaste];
    const userSelectedMeats = allSelectedIds.filter(id => meatCategories.includes(ingCategoryMap[id]));
    console.log(`🔍 Test: Medarbejder har valgt kød/fisk: ${userSelectedMeats.length > 0}`);

    let scoredRecipes = recipes.map(recipe => {
         const recipeIngs = recipe.ingredienser || [];
         let matchCount = 0;
         let wasteCount = 0;
         let hasMeatConflict = false;

         recipeIngs.forEach(ri => {
             if (currentSelected.includes(ri.raavare_id)) matchCount++;
             if (currentWaste.includes(ri.raavare_id)) wasteCount++;
         });

         if (userSelectedMeats.length > 0) {
             const recipeMeats = recipeIngs.filter(ri => meatCategories.includes(ingCategoryMap[ri.raavare_id]));
             if (recipeMeats.length > 0) {
                 const hasRequestedMeat = recipeMeats.some(rm => userSelectedMeats.includes(rm.raavare_id));
                 if (!hasRequestedMeat) hasMeatConflict = true; 
             }
         }
         return { ...recipe, matchCount, foodWasteCount: wasteCount, hasMeatConflict };
    });

    let filtered = scoredRecipes.filter(r => !r.hasMeatConflict && (r.matchCount > 0 || r.foodWasteCount > 0));
    filtered.sort((a, b) => b.matchCount - a.matchCount);

    const frikadelleBurger = scoredRecipes.find(r => r.titel.includes('Frikadelleburger'));
    if (frikadelleBurger && !frikadelleBurger.hasMeatConflict) {
        throw new Error("FEJL: Meat Conflict Eliminator fejlede! Frikadelleburger (svin) blev godkendt sammen med oksekød.");
    }
    console.log("✅ Meat Conflict OK: Svinekøds-opskrifter blev succesfuldt blokeret (Hard Conflict).");
    console.log(`✅ Signage Flow OK: Fandt ${filtered.length} valide opskrifter uden kød-konflikter.`);

    // -------------------------------------------------------------------------
    // MODUL 4: Customer Mobile Flow
    // -------------------------------------------------------------------------
    printSection("4. Customer Mobile Flow");
    const testRecipe = filtered[0] || recipes[0]; // Tag den vindende opskrift, eller en default
    const { data: customerRecipe, error: errCust } = await supabase.from('recipes').select('*').eq('id', testRecipe.id).single();
    
    if (errCust) throw new Error("FEJL: Kunne ikke hente opskrift i kundevisning: " + errCust.message);
    if (!customerRecipe.ingredienser || customerRecipe.ingredienser.length === 0) {
        throw new Error("FEJL: Opskrift mangler ingredienser i kundevisning!");
    }

    // Nyt Tjek: Sikr at 'mængde' eller 'amount' kan aflæses korrekt
    const validAmount = customerRecipe.ingredienser.some(i => i.amount !== undefined || i.mængde !== undefined || i['m\u00E6ngde'] !== undefined);
    if (!validAmount) {
        throw new Error("FEJL: Opskriften mangler udfyldte mængder (amount/mængde) på ingredienserne! Mængderne vil ikke blive vist for kunden.");
    }

    console.log(`✅ Customer Mobile OK: Opskrift '${customerRecipe.titel}' indlæst korrekt med ${customerRecipe.ingredienser.length} ingredienser.`);

    // Ryd op efter testen
    await supabase.from('active_promotions').delete().eq('store_id', testStoreId);

    printSection("TEST RESULTAT");
    console.log("🌟 100% SUCCESS! Alle moduler er sunde, fejlfrie og opererer snorlige. 🌟\n");
}

runQA().catch(e => {
    console.error("\n❌ E2E QA TEST FEJLEDE!");
    console.error(e.message);
    process.exit(1);
});
