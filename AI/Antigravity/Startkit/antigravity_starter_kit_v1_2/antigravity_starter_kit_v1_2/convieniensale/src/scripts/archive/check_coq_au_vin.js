import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: cols } = await supabase.rpc('get_recipes_schema'); // Not a real RPC, let's just fetch one row
    const { data, error } = await supabase.from('recipes').select('*').ilike('titel', '%coq%');
    console.log(JSON.stringify(data, null, 2));
    
    // Check columns
    const { data: oneRow } = await supabase.from('recipes').select('*').limit(1);
    if (oneRow && oneRow.length > 0) {
        console.log("Columns:", Object.keys(oneRow[0]));
    }
}
check();
