import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Rettelse af datafejl (ff -> Grøn Pesto) i ingredienser og opskrifter...");

  // 1. Opdater selve råvaren i ingredients tabellen
  const { error: ingError } = await supabase
    .from('ingredients')
    .update({ navn: 'Grøn Pesto', kategori: 'Kolonial' })
    .eq('id', 'ing_meny_auto_1244');

  if (ingError) {
    console.error("Fejl ved opdatering af ingrediens:", ingError);
    return;
  }
  console.log("✅ Ingrediens 'ff' er omdøbt til 'Grøn Pesto' i kategori 'Kolonial'.");

  // 2. Opdater JSON array i opskriften
  const recipeId = 'meny_R3JpbGxldCBtZWR';
  const { data: recipe, error: getRecipeError } = await supabase
    .from('recipes')
    .select('ingredienser')
    .eq('id', recipeId)
    .single();

  if (getRecipeError) {
    console.error("Fejl ved hentning af opskrift:", getRecipeError);
    return;
  }

  const updatedIngredients = recipe.ingredienser.map(ing => {
    if (ing.raavare_id === 'ing_meny_auto_1244' || ing.navn === 'ff') {
      return { ...ing, navn: 'Grøn Pesto' };
    }
    return ing;
  });

  const { error: updateRecipeError } = await supabase
    .from('recipes')
    .update({ ingredienser: updatedIngredients })
    .eq('id', recipeId);

  if (updateRecipeError) {
    console.error("Fejl ved opdatering af opskriftens ingredienser:", updateRecipeError);
    return;
  }
  
  console.log("✅ Opskriften er opdateret til at bruge navnet 'Grøn Pesto'.");
}

run();
