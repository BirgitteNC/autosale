import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getOrCreateIngredient(name, category) {
    let { data: ings } = await supabase.from('ingredients').select('*').eq('navn', name);
    if (ings && ings.length > 0) return ings[0];
    
    const newId = 'ing_meny_auto_fix_' + Math.random().toString(36).substring(2, 11);
    const { data: inserted } = await supabase.from('ingredients').insert({ id: newId, navn: name, kategori: category }).select();
    return inserted[0];
}

async function fixVand() {
    console.log("Fixer vand...");
    const { data: baddata } = await supabase.from('ingredients').select('*').eq('navn', '0.5- 1 dl vand');
    if (!baddata || baddata.length === 0) return;
    const bad = baddata[0];
    const good = await getOrCreateIngredient('vand', 'Basis');
    
    const { data: recipes } = await supabase.from('recipes').select('*');
    for (const r of recipes) {
        let changed = false;
        let newIngs = [];
        for (const ri of (r.ingredienser || [])) {
            if (ri.raavare_id === bad.id) {
                newIngs.push({ ...ri, raavare_id: good.id, navn: good.navn });
                changed = true;
            } else {
                newIngs.push(ri);
            }
        }
        if (changed) {
            let newInsts = [...(r.instruktioner || [])];
            if (!newInsts.includes('0.5- 1 dl vand')) newInsts.push('0.5- 1 dl vand');
            await supabase.from('recipes').update({ ingredienser: newIngs, instruktioner: newInsts }).eq('id', r.id);
        }
    }
    await supabase.from('ingredients').delete().eq('id', bad.id);
}

async function fixSmoer() {
    console.log("Fixer smør...");
    const { data: baddata } = await supabase.from('ingredients').select('*').eq('navn', 'smør, smeltet');
    if (!baddata || baddata.length === 0) return;
    const bad = baddata[0];
    const good = await getOrCreateIngredient('smør', 'Mejeri');
    
    const { data: recipes } = await supabase.from('recipes').select('*');
    for (const r of recipes) {
        let changed = false;
        let newIngs = [];
        for (const ri of (r.ingredienser || [])) {
            if (ri.raavare_id === bad.id) {
                newIngs.push({ ...ri, raavare_id: good.id, navn: good.navn });
                changed = true;
            } else {
                newIngs.push(ri);
            }
        }
        if (changed) {
            let newInsts = [...(r.instruktioner || [])];
            if (!newInsts.includes('Tilberedning af smør: smeltet')) newInsts.push('Tilberedning af smør: smeltet');
            await supabase.from('recipes').update({ ingredienser: newIngs, instruktioner: newInsts }).eq('id', r.id);
        }
    }
    await supabase.from('ingredients').delete().eq('id', bad.id);
}

async function fixGrillspyd() {
    console.log("Fixer grillspyd...");
    await supabase.from('ingredients').update({ kategori: 'Nonfood' }).eq('navn', 'grillspyd');
}

async function fixMynte() {
    console.log("Fixer mynte og hvide chokolade spåner...");
    const { data: baddata } = await supabase.from('ingredients').select('*').eq('navn', 'mynte og hvide chokolade spåner');
    if (!baddata || baddata.length === 0) return;
    const bad = baddata[0];
    
    const mynte = await getOrCreateIngredient('mynte', 'Grønt');
    const chokolade = await getOrCreateIngredient('hvide chokoladespåner', 'Bagning');
    
    const { data: recipes } = await supabase.from('recipes').select('*');
    for (const r of recipes) {
        let changed = false;
        let newIngs = [];
        for (const ri of (r.ingredienser || [])) {
            if (ri.raavare_id === bad.id) {
                newIngs.push({ ...ri, raavare_id: mynte.id, navn: mynte.navn });
                newIngs.push({ ...ri, raavare_id: chokolade.id, navn: chokolade.navn });
                changed = true;
            } else {
                newIngs.push(ri);
            }
        }
        if (changed) {
            await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', r.id);
        }
    }
    await supabase.from('ingredients').delete().eq('id', bad.id);
}

async function run() {
    await fixVand();
    await fixSmoer();
    await fixGrillspyd();
    await fixMynte();
    console.log("Færdig med at rette fejl!");
}

run();
