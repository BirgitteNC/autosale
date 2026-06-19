import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSussieSanityCheck() {
    console.log("🕵️ Sussie Validator: Analyserer databasens domæne-dækning...\n");

    const { data: allRecipes, error: recError } = await supabase.from('recipes').select('id, titel, tags, ingredienser');
    const { data: allIngs, error: ingError } = await supabase.from('ingredients').select('id, navn, kategori');

    if (recError || ingError) {
        return console.error("Fejl ved hentning af data:", recError || ingError);
    }

    // Domæne-Krav for et Supermarked
    const requiredCategories = [
        "Frugt & Grønt",
        "Kød",
        "Fisk & Skaldyr",
        "Mejeri",
        "Kolonial",
        "Bager"
    ];

    let passed = true;
    console.log("--- KATEGORI DÆKNING (INGREDIENSER) ---");
    for (const reqCat of requiredCategories) {
        const ingsInCat = allIngs.filter(i => i.kategori === reqCat);
        if (ingsInCat.length === 0) {
            console.error(`❌ KRITISK FEJL: Afdelingen '${reqCat}' mangler fuldstændig i råvaredatabasen!`);
            passed = false;
        } else {
            console.log(`✅ ${reqCat}: ${ingsInCat.length} råvarer fundet.`);
        }
    }
    console.log("");

    console.log("--- KATEGORI DÆKNING (OPSKRIFTER) ---");
    // Tjek om der findes opskrifter for de mest forgængelige varegrupper
    const perishableCheck = [
        { name: "Fisk & Skaldyr", checkIds: allIngs.filter(i => i.kategori === "Fisk & Skaldyr").map(i => i.id) },
        { name: "Kød (Hakket/Fersk)", checkIds: allIngs.filter(i => i.kategori === "Kød").map(i => i.id) },
        { name: "Mejeri (Mælk/Fløde)", checkIds: allIngs.filter(i => i.kategori === "Mejeri").map(i => i.id) },
        { name: "Frugt & Grønt (Let fordærvelig)", checkIds: allIngs.filter(i => i.kategori === "Frugt & Grønt").map(i => i.id) }
    ];

    for (const perishable of perishableCheck) {
        if (perishable.checkIds.length === 0) continue; // Allerede fejlet ovenfor

        // Find opskrifter der bruger råvarer fra denne kategori
        const matchingRecipes = allRecipes.filter(r => {
            const ingIds = (r.ingredienser || []).map(ing => ing.raavare_id);
            return ingIds.some(id => perishable.checkIds.includes(id));
        });

        if (matchingRecipes.length === 0) {
            console.error(`❌ KRITISK FEJL: Ingen opskrifter understøtter den meget forgængelige afdeling '${perishable.name}'. Systemet fejler sit primære formål (madspild).`);
            passed = false;
        } else {
            console.log(`✅ ${perishable.name}: Understøttes af ${matchingRecipes.length} opskrifter.`);
        }
    }

    console.log("\n--- KONKLUSION ---");
    if (passed) {
        console.log("💚 SANITY CHECK PASSED: Alle kritiske afdelinger er repræsenteret og understøttet af rigtige opskrifter.");
    } else {
        console.log("🛑 SANITY CHECK FAILED: Systemet mangler dækning for kritiske supermarkeds-kategorier!");
        process.exit(1);
    }
}

runSussieSanityCheck();
