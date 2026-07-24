import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDB() {
    console.log("Henter ingredienser...");
    const { data: ings } = await supabase.from('ingredients').select('id, navn, kategori');
    
    const hvedemel = ings.filter(i => i.navn.toLowerCase().includes('hvedemel'));
    console.log("Hvedemel fundet:", hvedemel);

    const categories = [...new Set(ings.map(i => i.kategori))];
    console.log("Kategorier i DB:", categories);

    const bagerItems = ings.filter(i => i.kategori?.includes('Bager'));
    console.log("Bager/Bageri items:", bagerItems);

    console.log("Henter opskrifter...");
    const { data: recipes } = await supabase.from('recipes').select('id, titel, ingredienser');
    
    // Check which recipes use hvedemel
    if (hvedemel.length > 0) {
        const hid = hvedemel[0].id;
        const usesMel = recipes.filter(r => {
            const arr = r.ingredienser || [];
            return arr.some(ing => ing.raavare_id === hid);
        });
        console.log(`Opskrifter der bruger ${hid}:`, usesMel.map(r => r.id));
    }
}
debugDB();
