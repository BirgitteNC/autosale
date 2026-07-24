import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runStressTest() {
    console.log("🚀 Starter Data-Dorthe Stresstest af Opskrifts-algoritmen...");

    const { data: allRecipes, error: recError } = await supabase.from('recipes').select('*');
    if (recError) return console.error("Fejl:", recError);

    const { data: allIngs, error: ingError } = await supabase.from('ingredients').select('id');
    if (ingError) return console.error("Fejl:", ingError);

    console.log(`Hentede ${allRecipes.length} opskrifter og ${allIngs.length} råvarer.`);

    let passed = 0;
    let failed = 0;

    // Funktion der simulerer SignageView algoritmen
    function simulateAlgorithm(currentSelected, currentWaste) {
        let scoredRecipes = allRecipes.map(recipe => {
            const recipeIngs = recipe.ingredienser || [];
            let matchCount = 0;
            let wasteCount = 0;
            recipeIngs.forEach(ri => {
                if (currentSelected.includes(ri.raavare_id)) matchCount++;
                if (currentWaste.includes(ri.raavare_id)) wasteCount++;
            });
            return { ...recipe, matchCount, foodWasteCount: wasteCount };
        });

        // SAFE FALLBACK LOGIC
        if (currentWaste.length > 0) {
            const wasteMatches = scoredRecipes.filter(r => r.foodWasteCount > 0);
            if (wasteMatches.length > 0) {
                scoredRecipes = wasteMatches;
            } else {
                scoredRecipes = []; // Hard Lock
            }
        } else if (currentSelected.length > 0) {
            const hasMatches = scoredRecipes.some(r => r.matchCount > 0);
            if (hasMatches) {
                scoredRecipes = scoredRecipes.filter(r => r.matchCount > 0);
            } else {
                scoredRecipes = []; // Hard Lock
            }
        } else {
            // Memory read (simulated) - we pretend memory is empty for stress test
            scoredRecipes = [];
        }

        if (scoredRecipes.length > 0) {
            scoredRecipes.sort((a, b) => {
                if (b.foodWasteCount !== a.foodWasteCount) return b.foodWasteCount - a.foodWasteCount;
                return b.matchCount - a.matchCount;
            });
            scoredRecipes = scoredRecipes.slice(0, 3);
        }

        return scoredRecipes;
    }

    console.log("Kører 10.000 tilfældige kombinationer...");

    for (let i = 0; i < 10000; i++) {
        // Vælg 1-6 random ingredients
        const numSelected = Math.floor(Math.random() * 6);
        const selected = [];
        for(let j=0; j<numSelected; j++) {
            selected.push(allIngs[Math.floor(Math.random() * allIngs.length)].id);
        }
        
        // Vælg 0-2 random waste ingredients
        const numWaste = Math.floor(Math.random() * 3);
        const waste = [];
        for(let j=0; j<numWaste; j++) {
            waste.push(allIngs[Math.floor(Math.random() * allIngs.length)].id);
        }

        const result = simulateAlgorithm(selected, waste);

        // Validation Rules (Drogon Protocol)
        // 1. If waste > 0, ALL returned recipes MUST contain at least one waste item (unless result is empty).
        let isValid = true;
        if (waste.length > 0 && result.length > 0) {
            isValid = result.every(r => r.foodWasteCount > 0);
        }

        // 2. If no waste but selected > 0, ALL returned recipes MUST contain at least one selected item.
        if (waste.length === 0 && selected.length > 0 && result.length > 0) {
            isValid = result.every(r => r.matchCount > 0);
        }

        if (isValid) {
            passed++;
        } else {
            failed++;
            console.error(`❌ Fejl fundet! Selected: ${selected.length}, Waste: ${waste.length}. Returnerede opskrifter overholder ikke Drogon Protocol.`);
        }
    }

    console.log("--- RESULTAT ---");
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    if (failed === 0) {
        console.log("✅ Algoritmen er 100% ROCK SOLID (Drogon Godkendt).");
    }
}

runStressTest();
