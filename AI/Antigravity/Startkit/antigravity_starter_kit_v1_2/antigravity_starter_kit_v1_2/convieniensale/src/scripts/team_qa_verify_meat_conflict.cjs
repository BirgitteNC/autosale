require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function simulate() {
  console.log('--- START QA VERIFICATION (Kylling vs Fiskesuppe) ---');
  
  // 1. Simuler at personalet vælger "Kylling" (ing_meny_auto_298) og "Gulerødder" (ing_extra_4)
  const currentSelected = ['ing_meny_auto_298', 'ing_extra_4'];
  const currentWaste = [];
  console.log('Store selected ingredients:', currentSelected);

  // 2. Hent opskrifter og ingredienser (ligesom SignageView)
  const { data: allRecipes } = await supabase.from('recipes').select('*').neq('beskrivelse', 'Importeret fra Meny');
  const { data: allIngredients } = await supabase.from('ingredients').select('id, kategori');
  
  const ingCategoryMap = {};
  allIngredients.forEach(i => { ingCategoryMap[i.id] = i.kategori; });

  // 3. Den opdaterede logik!
  const meatCategories = ['Slagter', 'Fisk'];
  const allSelectedIds = [...currentSelected, ...currentWaste];
  const userSelectedMeats = allSelectedIds.filter(id => meatCategories.includes(ingCategoryMap[id]));
  
  console.log('User selected meats:', userSelectedMeats.map(id => {
    const item = allIngredients.find(i => i.id === id);
    return `${item.kategori}: ${id}`;
  }));

  let fishSoup = null;

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
     
     const res = { ...recipe, matchCount, foodWasteCount: wasteCount, hasMeatConflict };
     if (recipe.titel.includes('Cremet fiskesuppe')) {
       fishSoup = res;
     }
     return res;
  });
  
  console.log('\n--- EVALUATING "Cremet fiskesuppe" ---');
  if (fishSoup) {
    console.log(`Match Count: ${fishSoup.matchCount} (Gulerødder matched!)`);
    console.log(`Has Meat Conflict: ${fishSoup.hasMeatConflict ? 'YES' : 'NO'}`);
    if (fishSoup.hasMeatConflict) {
       console.log('SUCCESS: Fish soup is correctly marked as a conflict and will be filtered out!');
    } else {
       console.error('FAIL: Fish soup is NOT marked as a conflict.');
    }
  } else {
    console.log('Fish soup not found in DB.');
  }

  // Filtrering
  scoredRecipes = scoredRecipes.filter(r => !r.hasMeatConflict);
  const stillHasFishSoup = scoredRecipes.some(r => r.titel.includes('Cremet fiskesuppe'));
  
  console.log(`\nIs fish soup in final results? ${stillHasFishSoup ? 'YES (FAIL)' : 'NO (SUCCESS)'}`);
  console.log('--- END QA VERIFICATION ---');
}

simulate();
