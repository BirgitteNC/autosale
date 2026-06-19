import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMeat() {
    const { data: ings } = await supabase.from('ingredients').select('id, navn, kategori');
    
    const keywords = ['kylling', 'oksekød', 'svinekød', 'fiskefars', 'hakket'];
    const found = ings.filter(i => keywords.some(k => i.navn.toLowerCase().includes(k)));
    
    console.log("Fandt følgende relaterede råvarer:");
    found.forEach(i => console.log(`- ${i.id}: ${i.navn} (${i.kategori})`));
}
checkMeat();
