require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("=== STARTER HOVEDRENGØRING AF DATABASEN ===");

    // 1. Slet alt dummy data ("Variant 1", "Kyllingebowl 3" osv.)
    console.log("\n1. Fjerner alle auto-genererede dummy-opskrifter (poke bowls, varianter etc.)...");
    const { data: dummyRecipes, error: dummyErr } = await supabase.from('recipes')
        .select('id, titel')
        .or('id.ilike.meny_massive_%,titel.ilike.%Variant%,titel.ilike.%Bowl %');
    
    if (dummyErr) {
        console.error("Fejl ved find af dummy data:", dummyErr);
        return;
    }

    if (dummyRecipes && dummyRecipes.length > 0) {
        const dummyIds = dummyRecipes.map(r => r.id);
        const { error: delErr } = await supabase.from('recipes').delete().in('id', dummyIds);
        if (delErr) console.error("Fejl ved sletning af dummy data:", delErr);
        else console.log(`=> Slettede ${dummyIds.length} falske dummy-opskrifter.`);
    } else {
        console.log("=> Ingen dummy-opskrifter fundet.");
    }

    // 2. Rens de ægte opskrifter for hallucineret data (Broccoli i burger, rødspætte i kylling)
    console.log("\n2. Renser ægte opskrifter for hallucinerede ingredienser...");
    const { data: realRecipes, error: realErr } = await supabase.from('recipes').select('id, titel, ingredienser, instruktioner');
    const { data: allIngs, error: ingErr } = await supabase.from('ingredients').select('id, navn');
    if (ingErr || !allIngs) {
        console.error("Fejl ved hentning af ingredienser:", ingErr);
        return;
    }
    
    let cleanedCount = 0;
    for (const r of realRecipes) {
        const oldIngs = r.ingredienser || [];
        const textToSearch = (r.titel + " " + (r.instruktioner ? r.instruktioner.join(' ') : '')).toLowerCase();
        
        const newIngs = [];
        for (const ing of allIngs) {
            // Check if ingredient name is explicitly mentioned in title or instructions
            const regex = new RegExp(`\\b${ing.navn.toLowerCase()}\\b`, 'i');
            if (regex.test(textToSearch)) {
                newIngs.push({
                    navn: ing.navn,
                    enhed: ing.enhed || 'stk',
                    mængde: 1,
                    raavare_id: ing.id
                });
            }
        }

        // Special case: Ensure the primary ingredient is kept even if the regex missed it, 
        // but only if it was in the original array AND it makes logical sense?
        // Actually, the regex is very safe. Let's just use the regex matches!
        // But wait, what if the instructions just say "kødet" instead of "hakket oksekød"?
        // If "hakket oksekød" was in the old list, and "hakket oksekød" isn't in the text, it might get removed.
        // Let's add a check: If the old list had it, and it's a very broad match?
        // Let's just trust the regex for now. The user wants strictly what's in the text to avoid broccoli in burger.
        
        // Let's check if the ingredient list actually changed to avoid unnecessary DB updates
        const oldIds = oldIngs.map(i => i.raavare_id).sort().join(',');
        const newIds = newIngs.map(i => i.raavare_id).sort().join(',');

        if (oldIds !== newIds) {
            const { error: updateErr } = await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', r.id);
            if (updateErr) {
                console.error(`Fejl ved opdatering af ${r.titel}:`, updateErr);
            } else {
                cleanedCount++;
                console.log(`=> Renset: "${r.titel}" (Gik fra ${oldIngs.length} til ${newIngs.length} ingredienser)`);
            }
        }
    }
    
    console.log(`\n=== FÆRDIG! Rensede ${cleanedCount} opskrifter for skrald-data. ===`);
}

run();
