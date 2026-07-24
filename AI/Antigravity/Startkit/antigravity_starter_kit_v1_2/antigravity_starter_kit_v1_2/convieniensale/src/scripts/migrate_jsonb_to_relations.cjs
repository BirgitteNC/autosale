const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' }); // Adjust if needed

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log("Starter datamigrering fra recipes.ingredienser (JSONB) til recipe_ingredients (Many-to-Many)...");
  
  // 1. Hent alle opskrifter
  const { data: recipes, error: fetchError } = await supabase.from('recipes').select('id, titel, ingredienser');
  if (fetchError) {
    console.error("Fejl ved hentning af opskrifter:", fetchError);
    return;
  }
  
  console.log(`Fandt ${recipes.length} opskrifter. Analyserer ingredienser...`);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (const recipe of recipes) {
    if (!recipe.ingredienser || recipe.ingredienser.length === 0) continue;
    
    for (const ing of recipe.ingredienser) {
      if (!ing.raavare_id) {
         console.warn(`[Advarsel] Opskrift "${recipe.titel}" (${recipe.id}) har en ingrediens UDEN raavare_id (NULL). Skipper denne for at undgå datakorruption.`);
         totalSkipped++;
         continue;
      }
      
      const insertData = {
        recipe_id: recipe.id,
        ingredient_id: ing.raavare_id,
        amount: ing.amount || null,
        unit: ing.unit || ing.enhed || null,
        original_text: ing.text || null
      };
      
      const { error: insertError } = await supabase.from('recipe_ingredients').upsert(insertData, { onConflict: 'recipe_id, ingredient_id' });
      if (insertError) {
        console.error(`Fejl ved indsættelse for opskrift ${recipe.id}, ingrediens ${ing.raavare_id}:`, insertError.message);
      } else {
        totalInserted++;
      }
    }
  }
  
  console.log(`Migrering fuldført!`);
  console.log(`- Indsat/Opdateret i recipe_ingredients: ${totalInserted}`);
  console.log(`- Skippet pga. NULL raavare_id (Data Dorthe Issue #2): ${totalSkipped}`);
  
  // Bemærk: Vi sletter IKKE den gamle JSONB kolonne endnu, for at sikre bagudkompatibilitet 
  // indtil hele frontenden er omskrevet til udelukkende at bruge 'recipe_ingredients' API'et.
}

migrateData();
