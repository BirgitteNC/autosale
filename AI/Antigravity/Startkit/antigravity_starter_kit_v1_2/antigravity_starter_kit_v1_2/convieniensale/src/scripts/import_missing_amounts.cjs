require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Starter import af opdaterede mængder fra CSV...");
    
    const filepath = require('path').join(__dirname, '..', 'manglende_maengder.csv');
    if (!fs.existsSync(filepath)) {
        console.error("Filen manglende_maengder.csv blev ikke fundet!");
        return;
    }

    const csvData = fs.readFileSync(filepath, 'utf8');
    const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Spring header over
    const dataLines = lines.slice(1);

    // Gruppér pr. opskrift
    const updatesByRecipe = {};

    for (const line of dataLines) {
        // Håndterer simple semikolon split. (Hvis navne indeholder ;, kan det drille, men vi bruger quotes i eksporten)
        // For at være helt sikker, bruger vi et simpelt regex der respekterer quotes.
        const row = [];
        let inQuotes = false;
        let current = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && line[i+1] === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ';' && !inQuotes) {
                row.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        row.push(current); // Sidste felt

        if (row.length < 6) continue;

        const recipeId = row[0];
        const title = row[1];
        const raavareId = row[2];
        const rawAmount = row[4]; // felt indeks 4 er "Ny Mængde"
        const unit = row[5];      // felt indeks 5 er "Ny Enhed"

        if (!updatesByRecipe[recipeId]) {
            updatesByRecipe[recipeId] = { title, updates: [] };
        }

        // Kun hvis brugeren har indtastet en mængde eller SLET
        if (rawAmount && rawAmount.trim() !== '') {
            const rawAmountLower = rawAmount.trim().toLowerCase();
            if (rawAmountLower === 'slet' || rawAmountLower === '0') {
                updatesByRecipe[recipeId].updates.push({
                    raavare_id: raavareId,
                    navn: row[3], // Ingrediens navn
                    action: 'delete'
                });
            } else {
                // Håndter dansk komma
                const numVal = parseFloat(rawAmount.replace(',', '.'));
                if (!isNaN(numVal)) {
                    updatesByRecipe[recipeId].updates.push({
                        raavare_id: raavareId,
                        navn: row[3], // Ingrediens navn
                        mængde_pr_person: numVal,
                        enhed: unit ? unit.trim() : 'stk',
                        action: 'update_or_add'
                    });
                }
            }
        }
    }

    const recipeIdsToUpdate = Object.keys(updatesByRecipe).filter(id => updatesByRecipe[id].updates.length > 0);
    if (recipeIdsToUpdate.length === 0) {
        console.log("Ingen nye mængder fundet i filen (eller filen er endnu ikke udfyldt).");
        return;
    }

    console.log(`Fandt opdateringer til ${recipeIdsToUpdate.length} opskrifter. Henter fra DB for at gange op...`);

    let successCount = 0;

    for (const recipeId of recipeIdsToUpdate) {
        const { data: dbRecipe, error: fetchErr } = await supabase.from('recipes').select('*').eq('id', recipeId).single();
        if (fetchErr || !dbRecipe) {
            console.error(`Kunne ikke finde opskrift ${recipeId} i db.`);
            continue;
        }

        const portions = dbRecipe.portioner || 4;
        let currentIngredients = dbRecipe.ingredienser || [];
        let modified = false;

        // Kør alle sletninger igennem først
        const deletes = updatesByRecipe[recipeId].updates.filter(u => u.action === 'delete' && u.raavare_id);
        if (deletes.length > 0) {
            const beforeCount = currentIngredients.length;
            currentIngredients = currentIngredients.filter(ing => !deletes.find(d => d.raavare_id === ing.raavare_id));
            if (currentIngredients.length !== beforeCount) modified = true;
        }

        // Kør opdateringer / tilføjelser
        const updates = updatesByRecipe[recipeId].updates.filter(u => u.action === 'update_or_add');
        for (const updateMatch of updates) {
            const existingIdx = currentIngredients.findIndex(ing => ing.raavare_id === updateMatch.raavare_id && updateMatch.raavare_id !== '');
            if (existingIdx >= 0) {
                // Opdater
                currentIngredients[existingIdx] = {
                    ...currentIngredients[existingIdx],
                    mængde: parseFloat((updateMatch.mængde_pr_person * portions).toFixed(2)),
                    enhed: updateMatch.enhed
                };
                modified = true;
            } else {
                // Tilføj NY ingrediens
                let realRaavareId = updateMatch.raavare_id;
                
                // Hvis raavare_id mangler, prøv at slå det op i db baseret på navnet!
                if (!realRaavareId || realRaavareId.trim() === '') {
                    const { data: searchIng } = await supabase.from('ingredients').select('id, navn').ilike('navn', updateMatch.navn).limit(1).single();
                    if (searchIng) {
                        realRaavareId = searchIng.id;
                    } else {
                        // GOVERNANCE RULING: Vi må ikke auto-oprette ukendte råvarer med blanke allergener!
                        console.warn(`[GOVERNANCEN ADVARSEL] Råvaren '${updateMatch.navn}' findes ikke i systemet! Den blev sprunget over. Opret den korrekt via PIM/Scraper for at få allergener med.`);
                        continue; // Hop ud af dette loop, gem ikke den ukendte ingrediens!
                    }
                }

                currentIngredients.push({
                    raavare_id: realRaavareId,
                    navn: updateMatch.navn,
                    mængde: parseFloat((updateMatch.mængde_pr_person * portions).toFixed(2)),
                    enhed: updateMatch.enhed
                });
                modified = true;
            }
        }

        if (modified) {
            const { error: updateErr } = await supabase.from('recipes').update({ ingredienser: currentIngredients }).eq('id', recipeId);
            if (updateErr) {
                console.error(`Fejl ved opdatering af ${dbRecipe.titel}:`, updateErr);
            } else {
                successCount++;
                console.log(`✅ Opdateret: ${dbRecipe.titel} (Portioner: ${portions})`);
            }
        }
    }

    console.log(`\nImport Færdig! ${successCount} opskrifter fik opdaterede mængder.`);
}

run();
