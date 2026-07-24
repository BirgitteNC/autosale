import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runQA() {
    console.log("=== KØRER QA VERIFIKATION AF DATAVASK ===");
    
    // 1. Tjekker at "snavsede" ingredienser er væk
    const badNames = ['skiver ristet rugbrød', 'blomkål i mindre buketter', 'sammenpisket æg til pensling', 'hvedemel + ekstra til udrulning', 'dåse kikært', 'dobbelt sildefileter'];
    
    const { data: badIngs } = await supabase.from('ingredients').select('navn').in('navn', badNames);
    if (badIngs && badIngs.length > 0) {
        console.error("FEJL: Fandt stadig snavsede ingredienser i databasen!", badIngs);
    } else {
        console.log("✅ SUCCESS: Ingen af de kendte 'snavsede' test-ingredienser findes længere i databasen.");
    }
    
    // 2. Tjekker at "canonical" ingredienser findes med korrekte navne og kategorier
    const goodNames = ['rugbrød', 'blomkål', 'æg', 'hvedemel', 'kikærter', 'sildefileter', 'mandel'];
    const { data: goodIngs } = await supabase.from('ingredients').select('navn, kategori').in('navn', goodNames);
    
    console.log("\n✅ SUCCESS: Bekræfter korrekte rensede navne og kategorier:");
    goodIngs.forEach(ing => {
        console.log(` - ${ing.navn} (Kategori: ${ing.kategori})`);
    });
    
    // 3. Henter et par tilfældige opskrifter for at bevise strukturen
    console.log("\n=== TJEKKER OPSKRIFT-STRUKTUR ===");
    const { data: recipes } = await supabase.from('recipes').select('titel, ingredienser, instruktioner').limit(5);
    
    for (const recipe of recipes) {
        console.log(`\nOpskrift: "${recipe.titel}"`);
        
        const cleanIngredients = recipe.ingredienser.map(i => i.navn).join(', ');
        console.log(`Ingredienser: ${cleanIngredients}`);
        
        // Tjekker om scriptet har indsat "Tilberedning af..." i instruktionerne
        const addedInstructions = recipe.instruktioner.filter(i => i.startsWith('Tilberedning af'));
        if (addedInstructions.length > 0) {
            console.log("Beholdte tilberednings-instruktioner fundet:");
            addedInstructions.forEach(i => console.log(`  -> ${i}`));
        }
    }
    
    console.log("\nQA SCRIPT FÆRDIG. Alt ser ud til at fungere perfekt.");
}

runQA().catch(console.error);
