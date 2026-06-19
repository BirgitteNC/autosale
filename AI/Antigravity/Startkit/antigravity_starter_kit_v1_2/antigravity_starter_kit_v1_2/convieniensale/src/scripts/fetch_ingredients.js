import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchIngredients() {
  const { data, error } = await supabase.from('ingredients').select('id, navn');
  if (error) {
    console.error(error);
  } else {
    data.forEach(d => console.log(`${d.id}: ${d.navn}`));
  }
}
fetchIngredients();
