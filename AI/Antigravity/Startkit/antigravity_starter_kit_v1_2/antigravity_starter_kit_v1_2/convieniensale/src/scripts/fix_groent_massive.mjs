import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const categoryFixes = [
    { old: 'mangochutney', newName: 'mangochutney', cat: 'Kolonial' },
    { old: 'tranebær tørrede', newName: 'tranebær', cat: 'Kolonial' },
    { old: 'Santa Maria Green Jalapeño', newName: 'jalapeños', cat: 'Kolonial' },
    { old: 'cashewnød', newName: 'cashewnødder', cat: 'Kolonial' },
    { old: 'knivspids muskatnød', newName: 'muskatnød', cat: 'Krydderier' },
    { old: 'tør æblecider', newName: 'æblecider', cat: 'Drikkevarer' }
];

const groentFixes = [
    { old: 'markchampignoner', newName: 'markchampignon' },
    { old: 'kartoffel', newName: 'kartofler' },
    { old: 'Små kartofler', newName: 'kartofler' },
    { old: 'Nye kartofler', newName: 'kartofler' },
    { old: 'Løg', newName: 'løg' },
    { old: 'Hvidløg', newName: 'hvidløg' },
    { old: 'Helt hvidløg', newName: 'hvidløg' },
    { old: 'Sød Kartoffel', newName: 'søde kartofler' },
    { old: 'Spidskål', newName: 'spidskål' },
    { old: 'kviste timian', newName: 'timian' },
    { old: 'gulerod', newName: 'gulerødder' },
    { old: 'hindbær &', newName: 'hindbær' },
    { old: 'små rødløg', newName: 'rødløg' },
    { old: 'citronskal', newName: 'citron' },
    { old: 'tomat', newName: 'tomater' },
    { old: 'salat mix', newName: 'salat' },
    { old: 'stilke timianblade', newName: 'timian' },
    { old: 'krusemynteblade', newName: 'krusemynte' },
    { old: 'kviste grønkål', newName: 'grønkål' },
    { old: 'estragonblade', newName: 'estragon' },
    { old: 'myntekviste', newName: 'mynte' },
    { old: 'babysalatblade', newName: 'salat' },
    { old: 'champignoner', newName: 'champignon' },
    { old: 'spidskål blade', newName: 'spidskål' },
    { old: 'stilke citrongræs', newName: 'citrongræs' },
    { old: '& ærteskud', newName: 'ærteskud' },
    { old: 'krydderurt : persille, kørvel eller purløg', newName: 'krydderurter' },
    { old: 'grøn squash', newName: 'squash' },
    { old: 'hvid asparges', newName: 'asparges' },
    { old: 'cherrytomater ,', newName: 'cherrytomater' },
    { old: 'guldborg æbler', newName: 'æbler' },
    { old: 'røde æbler', newName: 'æbler' },
    { old: 'radise', newName: 'radiser' },
    { old: 'mynteblad', newName: 'mynte' },
    { old: 'Krydderurter', newName: 'krydderurter' }
];

async function run() {
    console.log("Starter rensning af Grønt...");
    const { data: allIngs } = await supabase.from('ingredients').select('*');
    const { data: recipes } = await supabase.from('recipes').select('*');

    async function getGood(newName, cat) {
        let good = allIngs.find(i => i.navn.toLowerCase() === newName.toLowerCase() && i.kategori === cat);
        if (!good) good = allIngs.find(i => i.navn.toLowerCase() === newName.toLowerCase());
        if (!good) {
            const newId = 'ing_meny_auto_fix_' + Math.random().toString(36).substring(2, 11);
            const res = await supabase.from('ingredients').insert({ id: newId, navn: newName, kategori: cat }).select();
            good = res.data[0];
            allIngs.push(good); // opdater lokal cache
        }
        return good;
    }

    async function applyFixes(fixes, defaultCat = null) {
        for (const f of fixes) {
            const badIngs = allIngs.filter(i => i.navn.toLowerCase() === f.old.toLowerCase());
            if (badIngs.length === 0) continue;
            
            const bad = badIngs[0];
            const targetCat = f.cat || bad.kategori || defaultCat || 'Grønt';
            const good = await getGood(f.newName, targetCat);

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
                console.log(`Merged: ${f.old} -> ${f.newName} (${targetCat})`);
            } else {
                if (bad.kategori !== targetCat || bad.navn !== f.newName) {
                    await supabase.from('ingredients').update({ navn: f.newName, kategori: targetCat }).eq('id', bad.id);
                    console.log(`Updated: ${f.old} -> ${f.newName} (${targetCat})`);
                }
            }
        }
    }

    await applyFixes(categoryFixes);
    await applyFixes(groentFixes, 'Grønt');

    // Split fixes
    const splits = [
        { old: 'kruspersille eller timian', targets: ['kruspersille', 'timian'] },
        { old: 'ferskner eller nektariner', targets: ['ferskner', 'nektariner'] }
    ];

    for (const split of splits) {
        const badIngs = allIngs.filter(i => i.navn.toLowerCase() === split.old.toLowerCase());
        if (badIngs.length === 0) continue;
        const bad = badIngs[0];
        
        const good1 = await getGood(split.targets[0], 'Grønt');
        const good2 = await getGood(split.targets[1], 'Grønt');
        
        for (const r of recipes) {
            let changed = false;
            let newIngs = [];
            for (const ri of (r.ingredienser || [])) {
                if (ri.raavare_id === bad.id) {
                    newIngs.push({ ...ri, raavare_id: good1.id, navn: good1.navn });
                    newIngs.push({ ...ri, raavare_id: good2.id, navn: good2.navn });
                    changed = true;
                } else {
                    newIngs.push(ri);
                }
            }
            if (changed) await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', r.id);
        }
        await supabase.from('ingredients').delete().eq('id', bad.id);
        console.log(`Split: ${split.old} -> ${split.targets.join(' & ')}`);
    }

    console.log("Færdig med at støvsuge alt fra screenshots!");
}

run();
