import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rollbackData = [
    {
        newName: 'græsk inspireret yoghurt 10%',
        recipes: ['meny_RmFsYWZlbGJ1cmd'],
        wrongNameInRecipe: 'yoghurt',
        wrongInstr: 'græsk inspireret 10%'
    },
    {
        newName: 'yoghurt 10%',
        recipes: [
            'meny_SW5kaXNrIGthcnJ', 
            'meny_R3LDpnNrZSBrw7h', 
            'meny_Q2hva29sYWRlbW9', 
            'meny_U2Ftb3NhIG1lZCB', 
            'meny_SHZpZGvDpWxzc2F', 
            'meny_QnJ1bmNodGFsbGV',
            'meny_R3LDuG5uZSBmcml' // The 10% 10% one
        ],
        wrongNameInRecipe: 'yoghurt',
        wrongInstr: '10%'
    },
    {
        newName: 'yoghurt naturel',
        recipes: ['meny_QnVkZGhhIGJvd2w'],
        wrongNameInRecipe: 'yoghurt',
        wrongInstr: 'naturel'
    },
    {
        newName: 'gedeoste rulle',
        recipes: ['meny_U2FsYXQgYWYgZ3J'],
        wrongNameInRecipe: 'gedeost',
        wrongInstr: 'i rulle'
    },
    {
        newName: 'flødeost naturel',
        recipes: [
            'meny_fixed_29_1781879414879', 
            'meny_SGluZGLDpnJjaGV', 
            'meny_R3JpbGxldCBtYWp', 
            'meny_R3JpbGxlZGUgYmF', 
            'meny_Q2hlZXNlY2FrZSB'
        ],
        wrongNameInRecipe: 'flødeost',
        wrongInstr: 'naturel'
    },
    {
        newName: 'kvark 0,3%',
        recipes: ['meny_SGluZGLDpnIga2F'],
        wrongNameInRecipe: 'kvark',
        wrongInstr: '0,3% rørt op med'
    }
];

async function run() {
    console.log("Starter rollback af mejeriprodukter...");
    
    for (const rb of rollbackData) {
        console.log(`\nGenskaber: ${rb.newName}`);
        
        // Find existing or insert new
        let { data: ings } = await supabase.from('ingredients').select('*').eq('navn', rb.newName);
        let newIng = ings && ings.length > 0 ? ings[0] : null;
        
        if (!newIng) {
            const newId = 'ing_meny_auto_rb_' + Math.random().toString(36).substring(2, 11);
            const { data: inserted, error: insertErr } = await supabase.from('ingredients')
                .insert({ id: newId, navn: rb.newName, kategori: 'Mejeri' })
                .select();
            if (insertErr) {
                console.error(insertErr);
                continue;
            }
            newIng = inserted[0];
            console.log(`  -> Oprettet med id: ${newIng.id}`);
        } else {
            console.log(`  -> Fandtes allerede med id: ${newIng.id}`);
        }
        
        // Update recipes
        for (const recipeId of rb.recipes) {
            const { data: recipes } = await supabase.from('recipes').select('*').eq('id', recipeId);
            if (!recipes || recipes.length === 0) continue;
            const r = recipes[0];
            
            let changed = false;
            let newIngredienser = [];
            
            // Fix ingredienser
            for (const ri of (r.ingredienser || [])) {
                if (ri.navn.toLowerCase() === rb.wrongNameInRecipe.toLowerCase()) {
                    newIngredienser.push({ ...ri, raavare_id: newIng.id, navn: rb.newName });
                    changed = true;
                } else {
                    newIngredienser.push(ri);
                }
            }
            
            // Fix instruktioner
            let newInstruktioner = [];
            const instrToRemove = `Tilberedning af ${rb.wrongNameInRecipe}: ${rb.wrongInstr}`.toLowerCase();
            
            for (const instr of (r.instruktioner || [])) {
                if (instr.toLowerCase() !== instrToRemove) {
                    newInstruktioner.push(instr);
                } else {
                    changed = true; // Vi fjernede en instruktion
                }
            }
            
            if (changed) {
                const { error: updErr } = await supabase.from('recipes')
                    .update({ ingredienser: newIngredienser, instruktioner: newInstruktioner })
                    .eq('id', r.id);
                if (updErr) console.error(`  Fejl ved opdatering af opskrift ${r.id}`, updErr);
                else console.log(`  -> Opdaterede opskrift: ${r.titel} (${r.id})`);
            }
        }
    }
    
    console.log("\nRollback færdig!");
}

run().catch(console.error);
