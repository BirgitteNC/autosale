import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: allRecipes } = await supabase.from('recipes').select('id, titel, beskrivelse');
    const curatedBadDesc = allRecipes.filter(r => r.id.startsWith('meny_') && !r.id.includes('_Q') && r.beskrivelse === 'Importeret fra Meny');
    console.log("Count:", curatedBadDesc.length);
    console.log(curatedBadDesc.slice(0, 5));
}
check();
