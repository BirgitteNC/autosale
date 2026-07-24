import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log("Checking recipes table...");
  const { data: recipes, error: err1 } = await supabase.from('recipes').select('*').limit(1);
  if (err1) console.error("Error fetching recipes:", err1);
  else if (recipes.length > 0) console.log("Recipes columns:", Object.keys(recipes[0]));
  else console.log("Recipes table is empty.");

  console.log("Checking ingredients table...");
  const { data: ingredients, error: err2 } = await supabase.from('ingredients').select('*').limit(1);
  if (err2) console.error("Error fetching ingredients:", err2);
  else if (ingredients.length > 0) console.log("Ingredients columns:", Object.keys(ingredients[0]));
  else console.log("Ingredients table is empty.");

  console.log("Checking recipe_ingredients table...");
  const { data: ri, error: err3 } = await supabase.from('recipe_ingredients').select('*').limit(1);
  if (err3) console.error("Error fetching recipe_ingredients:", err3);
  else if (ri.length > 0) console.log("Recipe_ingredients columns:", Object.keys(ri[0]));
  else console.log("Recipe_ingredients table is empty.");
}

checkSchema();
