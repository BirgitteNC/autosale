import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPolicies() {
    // If we can insert, let's look at what the error is or if it really succeeds.
    const { data, error } = await supabase.from('recipes').insert([{
        id: 'fake_recipe_2',
        titel: 'Hannes Hacked Recipe 2',
        ingredienser: [],
        fremgangsmaade: 'Hak!',
        billede_url: '',
        kategori: 'Hack'
    }]).select();

    console.log("Insert result:", { data, error });
    await supabase.from('recipes').delete().eq('id', 'fake_recipe_2');
}
checkPolicies();
