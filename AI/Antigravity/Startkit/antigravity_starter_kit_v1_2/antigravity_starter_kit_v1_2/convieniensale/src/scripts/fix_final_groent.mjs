import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const groentFixes = [
    // Kategori rettelser
    { old: 'mangochutney', newName: 'mangochutney', cat: 'Kolonial' },
    { old: 'tranebær tørrede', newName: 'tørrede tranebær', cat: 'Kolonial' },
    { old: 'Santa Maria Green Jalapeño', newName: 'jalapeños', cat: 'Kolonial' },
    { old: 'cashewnød', newName: 'cashewnødder', cat: 'Kolonial' },
    { old: 'tør æblecider', newName: 'tør æblecider', cat: 'Drikkevarer' },
    { old: 'knivspids muskatnød', newName: 'muskatnød', cat: 'Krydderier' },
    
    // Grammatik og tegnsætning
    { old: 'hindbær &', newName: 'hindbær', cat: 'Grønt' },
    { old: '& ærteskud', newName: 'ærteskud', cat: 'Grønt' },
    { old: 'cherrytomater ,', newName: 'cherrytomater', cat: 'Grønt' },
    { old: 'Løg', newName: 'løg', cat: 'Grønt' },
    { old: 'Hvidløg', newName: 'hvidløg', cat: 'Grønt' },
    { old: 'Spidskål', newName: 'spidskål', cat: 'Grønt' },
    { old: 'Sød Kartoffel', newName: 'søde kartofler', cat: 'Grønt' }
];

async function run() {
    console.log("Starter præcis rettelse af Grønt...");
    const { data: allIngs } = await supabase.from('ingredients').select('*');
    const { data: recipes } = await supabase.from('recipes').select('*');

    async function getGood(newName, cat) {
        let good = allIngs.find(i => i.navn.toLowerCase() === newName.toLowerCase() && i.kategori === cat);
        if (!good) good = allIngs.find(i => i.navn.toLowerCase() === newName.toLowerCase());
        if (!good) {
            const newId = 'ing_meny_auto_fix_' + Math.random().toString(36).substring(2, 11);
            const res = await supabase.from('ingredients').insert({ id: newId, navn: newName, kategori: cat }).select();
            good = res.data[0];
            allIngs.push(good);
        }
        return good;
    }

    // 1. Almindelige fixes
    for (const f of groentFixes) {
        const badIngs = allIngs.filter(i => i.navn.toLowerCase() === f.old.toLowerCase() || i.navn === f.old);
        if (badIngs.length === 0) continue;
        
        const bad = badIngs[0];
        const good = await getGood(f.newName, f.cat);

        if (bad.id !== good.id) {
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
                if (changed) await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', r.id);
            }
            await supabase.from('ingredients').delete().eq('id', bad.id);
            console.log(`Merged: ${f.old} -> ${f.newName} (${f.cat})`);
        } else {
            if (bad.kategori !== f.cat || bad.navn !== f.newName) {
                await supabase.from('ingredients').update({ navn: f.newName, kategori: f.cat }).eq('id', bad.id);
                console.log(`Updated: ${f.old} -> ${f.newName} (${f.cat})`);
            }
        }
    }

    // 2. Split Krydderurter
    const splits = [
        { old: 'krydderurt : persille, kørvel eller purløg', targets: ['persille', 'kørvel', 'purløg'] },
        { old: 'Krydderurter', targets: ['persille', 'oregano', 'kørvel'] } // Vores tidligere fejl-merge
    ];

    for (const split of splits) {
        const badIngs = allIngs.filter(i => i.navn.toLowerCase() === split.old.toLowerCase());
        if (badIngs.length === 0) continue;
        const bad = badIngs[0];
        
        const goods = [];
        for (const t of split.targets) {
            goods.push(await getGood(t, 'Grønt'));
        }
        
        for (const r of recipes) {
            let changed = false;
            let newIngs = [];
            for (const ri of (r.ingredienser || [])) {
                if (ri.raavare_id === bad.id) {
                    for (const g of goods) {
                        newIngs.push({ ...ri, raavare_id: g.id, navn: g.navn });
                    }
                    changed = true;
                } else {
                    newIngs.push(ri);
                }
            }
            if (changed) await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', r.id);
        }
        await supabase.from('ingredients').delete().eq('id', bad.id);
        console.log(`Split: ${split.old} -> ${split.targets.join(', ')}`);
    }

    console.log("Færdig med de målrettede rettelser!");
}

run();
