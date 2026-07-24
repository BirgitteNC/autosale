import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function getDef() {
    const { data, error } = await supabase.rpc('execute_sql', {
        query: "SELECT pg_get_functiondef('update_store_promotions'::regproc);"
    });
    console.log(data, error);
}
getDef();
