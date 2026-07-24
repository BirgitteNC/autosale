import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Retter kategori-fejl...");
    
    const fixes = [
        // Kartoffel
        { oldName: 'mellemstore kartoffel', newName: 'kartofler', cat: 'Grønt' },
        
        // Fisk/Skaldyr på dåse eller frost
        { oldName: 'ansjosfileter', newName: 'ansjosfileter', cat: 'Kolonial' },
        { oldName: 'torpedo rejer', newName: 'torpedo rejer', cat: 'Frost' },
        { oldName: 'kæmperejer', newName: 'kæmperejer', cat: 'Frost' },
        
        // Frost fejl (grundet "is$" og "ærter")
        { oldName: 'flormelis', newName: 'flormelis', cat: 'Bagning' },
        { oldName: 'brune ris', newName: 'brune ris', cat: 'Kolonial' },
        { oldName: 'basmatiris', newName: 'basmatiris', cat: 'Kolonial' },
        { oldName: 'kikærter', newName: 'kikærter', cat: 'Kolonial' },
        
        // Krydderi fejl (grundet "peber")
        { oldName: 'rød peberfrugt', newName: 'peberfrugt', cat: 'Grønt' },
        { oldName: 'gul peberfrugt', newName: 'peberfrugt', cat: 'Grønt' },
        
        // Andet fra screenshot
        { oldName: 'persille eller oregano, kørvel', newName: 'krydderurter', cat: 'Grønt' }
    ];

    const { data: allIngs } = await supabase.from('ingredients').select('*');
    const { data: recipes } = await supabase.from('recipes').select('*');

    for (const fix of fixes) {
        const badIngs = allIngs.filter(i => i.navn.toLowerCase() === fix.oldName.toLowerCase());
        if (badIngs.length === 0) continue;
        
        const bad = badIngs[0];
        console.log(`Fixer: ${bad.navn} -> ${fix.newName} (${fix.cat})`);
        
        let good = allIngs.find(i => i.navn.toLowerCase() === fix.newName.toLowerCase() && i.kategori === fix.cat && i.id !== bad.id);
        
        if (!good && fix.oldName.toLowerCase() !== fix.newName.toLowerCase()) {
            good = allIngs.find(i => i.navn.toLowerCase() === fix.newName.toLowerCase());
        }

        if (good) {
            // Findes allerede, vi peger opskrifter over og sletter bad
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
                    await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', r.id);
                }
            }
            await supabase.from('ingredients').delete().eq('id', bad.id);
        } else {
            // Opdaterer in place
            await supabase.from('ingredients').update({ navn: fix.newName, kategori: fix.cat }).eq('id', bad.id);
        }
    }
    
    // Speciel håndtering for "pasta eller ris" for at splitte den
    const pastaRisArr = allIngs.filter(i => i.navn.toLowerCase() === 'pasta eller ris');
    if (pastaRisArr.length > 0) {
        console.log(`Fixer: pasta eller ris -> Splitter...`);
        const bad = pastaRisArr[0];
        
        let pasta = allIngs.find(i => i.navn.toLowerCase() === 'pasta');
        let ris = allIngs.find(i => i.navn.toLowerCase() === 'ris');
        
        if (!pasta) {
            const res = await supabase.from('ingredients').insert({ navn: 'pasta', kategori: 'Kolonial' }).select();
            pasta = res.data[0];
        }
        if (!ris) {
            const res = await supabase.from('ingredients').insert({ navn: 'ris', kategori: 'Kolonial' }).select();
            ris = res.data[0];
        }
        
        for (const r of recipes) {
            let changed = false;
            let newIngs = [];
            for (const ri of (r.ingredienser || [])) {
                if (ri.raavare_id === bad.id) {
                    newIngs.push({ ...ri, raavare_id: pasta.id, navn: pasta.navn });
                    newIngs.push({ ...ri, raavare_id: ris.id, navn: ris.navn });
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
    
    // Glem ikke at 'ris' og 'pasta' kan ligge i Frost nu grundet 'is$' fejlen
    await supabase.from('ingredients').update({ kategori: 'Kolonial' }).eq('navn', 'ris');
    await supabase.from('ingredients').update({ kategori: 'Kolonial' }).eq('navn', 'pasta');

    console.log("Færdig!");
}

run();
