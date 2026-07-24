import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking hvidvin...");
    const { data, error } = await supabase.from('ingredients').select('id, navn').eq('navn', 'Hvidvin');
    console.log(data);
    
    // Check recipes for hvidvin
    if (data && data.length > 0) {
        const id = data[0].id;
        const { data: recipes } = await supabase.from('recipe_ingredients').select('recipe_id').eq('ingredient_id', id);
        console.log(`Recipes for ${id}:`, recipes.length);
    }
}
check();
