import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: ingData } = await supabase.from('ingredients').select('*').eq('standard_vare', false);
    const { data: recData } = await supabase.from('recipes').select('ingredienser');

    const counts = {};
    ingData.forEach(i => counts[i.id] = 0);
    if(recData) {
        recData.forEach(recipe => {
            const ri = recipe.ingredienser || [];
            ri.forEach(r_ing => {
                if (counts[r_ing.raavare_id] !== undefined) {
                    counts[r_ing.raavare_id]++;
                }
            });
        });
    }

    const laks = ingData.find(i => i.navn.toLowerCase().includes('laks'));
    const torsk = ingData.find(i => i.navn.toLowerCase().includes('torsk'));
    const citron = ingData.find(i => i.navn.toLowerCase().includes('citron'));
    const mel = ingData.find(i => i.navn.toLowerCase().includes('hvedemel'));

    console.log("=== RECIPE COUNTS (Som StaffView beregner dem) ===");
    if(laks) console.log(`Laks (${laks.id}): ${counts[laks.id]} opskrifter`);
    if(torsk) console.log(`Torsk (${torsk.id}): ${counts[torsk.id]} opskrifter`);
    if(citron) console.log(`Citron (${citron.id}): ${counts[citron.id]} opskrifter`);
    if(mel) console.log(`Hvedemel (${mel.id}): ${counts[mel.id]} opskrifter`);

    // Lad os se opskriften præcist
    const laksRecipe = recData.find(r => r.ingredienser && r.ingredienser.some(i => i.raavare_id === laks?.id));
    console.log("\nFandt Laks Opskrift?", !!laksRecipe);
}

run();
