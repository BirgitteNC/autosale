import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('recipes')
        .select('id, titel, beskrivelse')
        .not('beskrivelse', 'eq', 'Importeret fra Meny');
    console.log("Good recipes count:", data ? data.length : 0);
    if (data && data.length > 0) {
        console.log("Samples:", data.slice(0, 3));
    }
}
check();
