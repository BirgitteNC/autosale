import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: ings } = await supabase.from('ingredients').select('*').in('kategori', ['Fisk & Skaldyr', 'Fiskeafdeling']);
    console.log("Ingredienser i fiske-kategorier:");
    ings.forEach(i => console.log(`ID: ${i.id} | Navn: '${i.navn}' | Kategori: '${i.kategori}'`));
}
check();
