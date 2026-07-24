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

const patchMap = {
    "parmesan": { name: "parmesan", cat: "Mejeri" },
    "yoghurt 10% 10%": { name: "yoghurt", cat: "Mejeri", instr: "10%" },
    "Bladsselleri": { name: "bladselleri", cat: "Grønt" },
    "gedeoste": { name: "gedeost", cat: "Mejeri" },
    "Mozarella ost (revet)": { name: "mozzarella", cat: "Mejeri", instr: "revet" },
    "sort bønne": { name: "sorte bønner", cat: "Kolonial" }, // Wait, bønner are Kolonial if dried, but Grønt if fresh. 'sorte bønner' usually Kolonial (or canned). Let's put Kolonial. Actually, previous script had 'bønner' as Kolonial.
    "græsk inspireret yoghurt 10%": { name: "yoghurt", cat: "Mejeri", instr: "græsk inspireret 10%" },
    "rosin": { name: "rosiner", cat: "Kolonial" },
    "yoghurt 10%": { name: "yoghurt", cat: "Mejeri", instr: "10%" },
    "mozzarella oste": { name: "mozzarella", cat: "Mejeri" },
    "pinjekerne": { name: "pinjekerner", cat: "Kolonial" },
    "flødeost naturel": { name: "flødeost", cat: "Mejeri", instr: "naturel" },
    "smør til bruning": { name: "smør", cat: "Mejeri", instr: "til bruning" },
    "kvark, 0,3% rørt op med": { name: "kvark", cat: "Mejeri", instr: "0,3% rørt op med" },
    "gedeoste rulle": { name: "gedeost", cat: "Mejeri", instr: "i rulle" },
    "benfri sild": { name: "sild", cat: "Fisk", instr: "benfri" },
    "æggeblommer": { name: "æggeblomme", cat: "Mejeri" },
    "solsikkekerne": { name: "solsikkekerner", cat: "Kolonial" },
    "yoghurt naturel": { name: "yoghurt", cat: "Mejeri", instr: "naturel" },
    "ært": { name: "ærter", cat: "Frost" } // Using Frost for peas
};

async function run() {
    console.log("Henter ingredienser i Diverse...");
    const { data: diverseIngs } = await supabase.from('ingredients').select('*').eq('kategori', 'Diverse');
    const { data: allIngs } = await supabase.from('ingredients').select('*');
    const { data: recipes } = await supabase.from('recipes').select('*');

    for (const ing of diverseIngs) {
        if (!patchMap[ing.navn]) continue;
        
        const patch = patchMap[ing.navn];
        console.log(`Retter ${ing.navn} til ${patch.name} i ${patch.cat}`);
        
        // Find existing canonical if any
        let canonical = allIngs.find(i => i.navn.toLowerCase() === patch.name.toLowerCase() && i.kategori !== 'Diverse' && i.id !== ing.id);
        
        if (!canonical) {
            // Update this one to be the canonical
            console.log(`  Opdaterer in-place.`);
            await supabase.from('ingredients').update({ navn: patch.name, kategori: patch.cat }).eq('id', ing.id);
            canonical = { id: ing.id, navn: patch.name, kategori: patch.cat };
        } else {
            console.log(`  Dublet fundet: Sletter ${ing.id} og peger på ${canonical.id}`);
            await supabase.from('ingredients').delete().eq('id', ing.id);
        }
        
        // Update recipes
        for (const recipe of recipes) {
            let changed = false;
            let newIngs = [];
            let newInsts = [...(recipe.instruktioner || [])];
            
            for (const rIng of (recipe.ingredienser || [])) {
                if (rIng.raavare_id === ing.id) {
                    newIngs.push({ ...rIng, raavare_id: canonical.id, navn: patch.name });
                    if (patch.instr) {
                        const instrText = `Tilberedning af ${patch.name}: ${patch.instr}`;
                        if (!newInsts.includes(instrText)) newInsts.push(instrText);
                    }
                    changed = true;
                } else {
                    newIngs.push(rIng);
                }
            }
            if (changed) {
                await supabase.from('recipes').update({ ingredienser: newIngs, instruktioner: newInsts }).eq('id', recipe.id);
                console.log(`  Opdaterede opskrift ${recipe.id}`);
            }
        }
    }
    console.log("Diverse patch færdig!");
}
run();
