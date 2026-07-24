import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Assuming we run from src/scripts

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runDBACheck() {
    console.log("Hej! Her er Dorthe. Kører fuldt tjek af Supabase databasen...\n");

    // 1. Tjekker Ingredients
    const { data: ingredients, error: errIng } = await supabase.from('ingredients').select('id, navn');
    if (errIng) {
        console.error("Fejl ved læsning af ingredients:", errIng);
        return;
    }
    console.log(`Fandt ${ingredients.length} ingredients.`);
    const validIngredientIds = new Set(ingredients.map(i => i.id));

    // 2. Tjekker Opskrifter (Recipes)
    const { data: recipes, error: errRec } = await supabase.from('recipes').select('id, titel, ingredienser');
    if (errRec) {
        console.error("Fejl ved læsning af recipes:", errRec);
        return;
    }
    console.log(`Fandt ${recipes.length} recipes.\n`);

    // 3. Forældreløse opskrifter / manglende ingredienser
    let orphanRecipes = 0;
    let missingReferencesCount = 0;
    let missingReferencesDetails = [];
    let nullRaavareIdCount = 0;

    for (const recipe of recipes) {
        if (!recipe.ingredienser || recipe.ingredienser.length === 0) {
            orphanRecipes++;
        } else {
            for (const item of recipe.ingredienser) {
                if (item.raavare_id === null) {
                    nullRaavareIdCount++;
                } else if (!validIngredientIds.has(item.raavare_id)) {
                    missingReferencesCount++;
                    missingReferencesDetails.push(`Opskrift '${recipe.titel}' (ID: ${recipe.id}) refererer til raavare_id '${item.raavare_id}', som IKKE findes i ingredients-tabellen!`);
                }
            }
        }
    }

    console.log("=== DORTHE'S FINDINGS ===");
    console.log(`1. Forældreløse opskrifter (ingen ingredienser overhovedet): ${orphanRecipes}`);
    console.log(`2. Ingredienser med 'null' som raavare_id i JSON'en: ${nullRaavareIdCount}`);
    console.log(`3. Brudte Foreign Keys (Pga. JSONB-design mangler relationel integritet!): ${missingReferencesCount} fundet.`);
    
    if (missingReferencesCount > 0) {
        console.log("\nEksempler på brudte referencer:");
        missingReferencesDetails.slice(0, 5).forEach(m => console.log("- " + m));
    }
    console.log("=========================\n");
}

runDBACheck();
