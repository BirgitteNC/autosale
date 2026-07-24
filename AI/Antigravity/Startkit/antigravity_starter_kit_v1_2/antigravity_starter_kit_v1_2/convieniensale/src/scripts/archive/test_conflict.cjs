require('dotenv').config({path:'.env'});
const {createClient}=require('@supabase/supabase-js'); 
const supabase=createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: allRecipes } = await supabase.from('recipes').select('*').ilike('titel', '%burger%');
    const { data: allIngredients } = await supabase.from('ingredients').select('id, navn, kategori');
    
    // Simulate user selecting "Hakket oksekød" (ing_hakket_okse) and "Burgerboller" (ing_burgerboller)
    // Wait, let's find the IDs first
    const oksekodId = allIngredients.find(i => i.navn.includes('Hakket oksekød'))?.id;
    const bolleId = allIngredients.find(i => i.navn.includes('Burgerboller'))?.id;
    
    console.log("Selected IDs:", oksekodId, bolleId);
    const currentSelected = [oksekodId, bolleId].filter(Boolean);
    const currentWaste = [];

    const ingCategoryMap = {};
    allIngredients.forEach(i => { ingCategoryMap[i.id] = i.kategori; });

    const meatCategories = ['Kød', 'Slagter', 'Fiskeafdeling'];
    const allSelectedIds = [...currentSelected, ...currentWaste];
    const userSelectedMeats = allSelectedIds.filter(id => meatCategories.includes(ingCategoryMap[id]));
    console.log("User selected meats:", userSelectedMeats);

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
            const recipeMeats = recipeIngs.filter(ri => meatCategories.includes(ingCategoryMap[ri.raavare_id]));
            if (recipeMeats.length > 0) {
                const hasRequestedMeat = recipeMeats.some(rm => userSelectedMeats.includes(rm.raavare_id));
                if (!hasRequestedMeat) {
                    hasMeatConflict = true; 
                }
            }
        }

        return { titel: recipe.titel, matchCount, hasMeatConflict, recipeMeats: recipeIngs.filter(ri => meatCategories.includes(ingCategoryMap[ri.raavare_id])).map(m => m.navn) };
    });

    console.log("\nScored Recipes:");
    console.table(scoredRecipes);
    
    let filtered = scoredRecipes.filter(r => !r.hasMeatConflict && r.matchCount > 0);
    console.log("\nAfter Conflict Filter:");
    console.table(filtered);
}
run();
