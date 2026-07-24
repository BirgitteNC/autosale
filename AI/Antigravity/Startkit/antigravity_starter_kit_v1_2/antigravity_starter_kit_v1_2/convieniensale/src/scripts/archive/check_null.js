import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: ings } = await supabase.from('ingredients').select('*');
    const empty = ings.filter(i => !i.navn || i.navn.trim() === '');
    console.log("Empty name ingredients:", empty);
    
    // Tjek også Fiskeafdeling / Fisk & Skaldyr igen
    const fish = ings.filter(i => i.kategori === 'Fiskeafdeling' || i.kategori === 'Fisk & Skaldyr');
    console.log("Fish ingredients:");
    fish.forEach(f => console.log(f.id, f.navn, f.kategori));
}
check();
