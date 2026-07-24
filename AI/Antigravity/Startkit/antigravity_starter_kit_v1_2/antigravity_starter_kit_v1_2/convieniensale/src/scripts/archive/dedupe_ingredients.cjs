require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Henter ingredienser for at finde dubletter...");
    const { data: allIngs } = await supabase.from('ingredients').select('*');
    
    // Group by lowercased trimmed name
    const grouped = {};
    for (const ing of allIngs) {
        const key = ing.navn.trim().toLowerCase();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(ing);
    }

    const dupes = Object.values(grouped).filter(g => g.length > 1);
    if (dupes.length === 0) {
        console.log("Ingen dubletter fundet!");
        return;
    }

    console.log(`Fandt ${dupes.length} råvarer med dubletter. Gennemgår...`);

    const { data: allRecipes } = await supabase.from('recipes').select('id, ingredienser');

    for (const group of dupes) {
        console.log(`\nBehandler: ${group[0].navn}`);
        // Keep the one that looks like a primary key (e.g. not ing_extra_X if possible, or just the first one)
        // Let's sort so 'ing_avocado' comes before 'ing_extra_10'
        group.sort((a,b) => {
            const aIsExtra = a.id.includes('extra');
            const bIsExtra = b.id.includes('extra');
            if (aIsExtra && !bIsExtra) return 1;
            if (!aIsExtra && bIsExtra) return -1;
            return 0;
        });

        const master = group[0];
        const duplicates = group.slice(1);
        console.log(`  Beholder: ${master.id} (${master.navn})`);

        for (const duplicate of duplicates) {
            console.log(`  Sletter klon: ${duplicate.id}`);
            
            // Opdater opskrifter
            let updatedRecipesCount = 0;
            for (const recipe of allRecipes) {
                const ings = recipe.ingredienser || [];
                const idx = ings.findIndex(i => i.raavare_id === duplicate.id);
                if (idx !== -1) {
                    // Tjek om opskriften ALLEREDE har master (for at undgå dobbelt)
                    const hasMaster = ings.some(i => i.raavare_id === master.id);
                    if (hasMaster) {
                        ings.splice(idx, 1); // Fjern bare klonen
                    } else {
                        ings[idx].raavare_id = master.id; // Peg på master
                    }
                    await supabase.from('recipes').update({ ingredienser: ings }).eq('id', recipe.id);
                    updatedRecipesCount++;
                }
            }
            console.log(`  Opdaterede ${updatedRecipesCount} opskrifter for at fjerne reference til klon.`);
            
            // Slet klonen
            await supabase.from('ingredients').delete().eq('id', duplicate.id);
            console.log(`  Klon ${duplicate.id} slettet permanent.`);
        }
    }
}

run().catch(console.error);
