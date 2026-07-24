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
  const { data: recipes, error } = await supabase.from('recipes').select('id, titel, ingredienser');
  if (error) {
    console.error(error);
    return;
  }
  
  const badRecipes = recipes.filter(r => {
    if (!r.ingredienser) return false;
    return r.ingredienser.some(i => i.raavare_id === 'ing_meny_auto_1244' || (i.text && i.text.toLowerCase() === 'ff'));
  });
  
  console.log(`Found ${badRecipes.length} recipes containing 'ff':`);
  badRecipes.forEach(r => console.log(`- ${r.titel} (ID: ${r.id})`));
}

run();
