import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("Verificerer produktion (Regel 6)...");
    const { data: recipes, error } = await supabase.from('recipes').select('id, titel');
    if (error) return console.error(error);
    
    console.log(`Fandt totalt ${recipes.length} opskrifter i databasen!`);
    const massive = recipes.filter(r => r.id.startsWith('meny_massive'));
    console.log(`Heraf er ${massive.length} de nye "massive" opskrifter.`);
    
    const { data: kylling } = await supabase.from('ingredients').select('id, navn').eq('id', 'ing_hakket_kylling');
    if (kylling && kylling.length > 0) {
        console.log(`Hakket Kylling findes i DB: ${kylling[0].navn}`);
    } else {
        console.log("Hakket Kylling mangler!");
    }
}
verify();
