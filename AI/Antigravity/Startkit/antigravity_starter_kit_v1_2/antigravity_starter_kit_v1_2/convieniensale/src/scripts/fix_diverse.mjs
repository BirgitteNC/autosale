import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Henter ingredienser i Diverse...");
    const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('kategori', 'Diverse');
        
    if (error) throw error;
    console.log(`Fandt ${ingredients.length} varer i Diverse, som skal rettes.`);
    
    let fixedCount = 0;
    for (const ing of ingredients) {
        const n = ing.navn.toLowerCase();
        let newCat = 'Diverse';
        
        // Grønt
        if (n.match(/(ingefær|agurk|gulerødder|gulerod|porrer|banan|bananer|spinat|bladsselleri|avocado|broccoli|bønne|østershatte|bønnespirer|græskar|klementin|clementin|pære|rødbeder|haricots verts|fennikler|zucchini|ært)/i)) newCat = 'Grønt';
        // Slagter
        else if (n.match(/(mørbrad|flæskesteg|roastbeef|medister|pølser|ænder)/i)) newCat = 'Slagter';
        // Vin & Spiritus
        else if (n.match(/(vin|rosé|øl|madeira|whisky|gin|bourbon)/i)) newCat = 'Vin & Spiritus';
        // Mejeri
        else if (n.match(/(yoghurt|ost|creme fraiche|kvark|feta|pecorino|smør|æggeblomme|mozzarella|ricotta)/i)) newCat = 'Mejeri';
        // Bager
        else if (n.match(/(rundstykker|flutes|brød i grove tern|brød)/i)) newCat = 'Bager';
        // Krydderier
        else if (n.match(/(oregano|spidskommen|allehånde)/i)) newCat = 'Krydderier';
        // Kolonial
        else if (n.match(/(quinoa|chips|mayonnaise|kapers|rosin|pinjekerne|tagliatelle|peanut|hørfrø|kikært|oreo|spaghetti|bulgur|filodej|kaffe)/i)) newCat = 'Kolonial';
        // Diverse
        else if (n.match(/(fiberhusk|loppefrøskaller|melmix|grillspyd)/i)) newCat = 'Diverse';
        // Fisk
        else if (n.match(/(sild|kulmuler)/i)) newCat = 'Fisk';
        // Bagning
        else if (n.match(/(marcipan|marengs|madfarve|flormelis|kokos)/i)) newCat = 'Bagning';
        
        if (newCat !== 'Diverse') {
            await supabase.from('ingredients').update({ kategori: newCat }).eq('id', ing.id);
            fixedCount++;
        }
    }
    
    console.log(`Rettede ${fixedCount} varer! De er nu placeret i de korrekte afdelinger.`);
}

run().catch(console.error);
