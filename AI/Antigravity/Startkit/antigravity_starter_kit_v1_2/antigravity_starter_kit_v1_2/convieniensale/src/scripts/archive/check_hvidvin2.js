import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: recipes, error } = await supabase.from('recipe_ingredients').select('recipe_id').eq('ingredient_id', 'ing_extra_40');
    console.log(recipes, error);
}
check();
