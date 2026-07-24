import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function cleanIngredient(originalName) {
    let newName = originalName;
    const instructions = [];
    
    newName = newName.replace(/kogt eller stegt kyllingekød/gi, 'tilberedt kyllingekød');
    newName = newName.replace(/Oreo cookiecrumbles/gi, 'Oreo');
    newName = newName.replace(/spaghetti af kvalitet/gi, 'spaghetti');
    newName = newName.replace(/vaniljesukker &/gi, 'vaniljesukker');
    newName = newName.replace(/dobbelt sildefileter/gi, 'sildefileter');
    newName = newName.replace(/kød af kogte revelsben fra dagen før/gi, 'revelsben');
    
    newName = newName.replace(/^(bakke|håndfuld|ca\.? \d+ g|glas|dåser|dåse|Lille 1 bundt|Stor 1 håndfuld|lille|stor)\s+/i, '');
    
    const extractionRegexes = [
        /\s+(i skiver|i tykke skiver|i tynde skiver|i tern|i strimler|i halve|i både|i mindre stykker|i mindre buketter|på stilk|klippet i.*|delt i.*|skåret i.*)\b/gi,
        /\b(hakket|finthakket|friskpresset|sammenpisket|smeltet|koldt|blødt|lunken|daggammelt|friske|frisk|god|ekstrafine|kold, færdiglavet|fintklippet|grofthakkede|tørret|tørrede|flydende|friskkværnet|ristet|ristede|kogt|knust|knuste|revet|lune|saft af)\s+/gi,
        /\s+(\+ ekstra.*|til pynt|til pensling|til ristning|til stegning|til formen|til servering|fra dagen før|i at vende bollerne)$/i,
        /^(evt\.\s+|pynt:\s+|pynt med\s+|gem\s+)/i
    ];
    
    for (const regex of extractionRegexes) {
        const matches = newName.match(regex);
        if (matches) {
            for (let m of matches) {
                const instr = m.trim().replace(/^\+ /, '');
                if (instr) instructions.push(instr);
            }
            newName = newName.replace(regex, ' ');
        }
    }
    
    newName = newName.replace(/\s+/g, ' ').trim();
    
    if (newName.toLowerCase() === 'agurker') newName = 'agurk';
    if (newName.toLowerCase() === 'citroner') newName = 'citron';
    if (newName.toLowerCase() === 'rødløg i både') newName = 'rødløg';
    if (newName.toLowerCase() === 'isterning') newName = 'isterninger';
    
    if (newName.toLowerCase().includes('parmigiano reggiano') || newName.toLowerCase().includes('parmesan') || newName.toLowerCase().includes('parmegiano')) {
         newName = 'parmesan';
    }
    
    return { newName, instructions };
}

async function run() {
    console.log("Henter canonical ingredienser...");
    const { data: ingredients, error: ingError } = await supabase.from('ingredients').select('*');
    if (ingError) throw ingError;
    
    console.log("Henter opskrifter...");
    const { data: recipes, error: recError } = await supabase.from('recipes').select('*');
    if (recError) throw recError;
    
    console.log(`Fandt ${ingredients.length} canonical ingredienser og ${recipes.length} opskrifter.`);

    let updatedRecipesCount = 0;
    
    for (const recipe of recipes) {
        let recipeChanged = false;
        const newIngredienser = [];
        const newInstruktioner = [...(recipe.instruktioner || [])];
        
        for (const recIng of (recipe.ingredienser || [])) {
            const { newName, instructions } = cleanIngredient(recIng.navn);
            
            // Find canonical ingredient in DB
            let canonical = ingredients.find(i => i.navn.toLowerCase() === newName.toLowerCase());
            
            // Fallback om nødvendigt
            if (!canonical) {
                console.log(`Advarsel: Kunne ikke finde canonical ingrediens for "${newName}" (original: "${recIng.navn}") i DB.`);
                // We keep the old id, but we still apply the cleaned name.
            }
            
            const newId = canonical ? canonical.id : recIng.raavare_id;
            
            if (recIng.raavare_id !== newId || recIng.navn !== newName) {
                recipeChanged = true;
            }
            
            // Tilføj instruktioner
            for (const instr of instructions) {
                const instrText = instr.toLowerCase();
                const alreadyExists = newInstruktioner.some(i => i.toLowerCase().includes(instrText));
                if (!alreadyExists) {
                    newInstruktioner.push(`Tilberedning af ${newName}: ${instr}`);
                    recipeChanged = true;
                }
            }
            
            newIngredienser.push({
                ...recIng,
                raavare_id: newId,
                navn: newName
            });
        }
        
        if (recipeChanged) {
            const { error: updateError } = await supabase.from('recipes')
                .update({ 
                    ingredienser: newIngredienser,
                    instruktioner: newInstruktioner
                })
                .eq('id', recipe.id);
                
            if (updateError) {
                console.error(`Fejl ved opdatering af opskrift ${recipe.id}:`, updateError);
            } else {
                updatedRecipesCount++;
            }
        }
    }
    
    console.log(`Opdaterede ${updatedRecipesCount} opskrifter med canonical IDs og rensede navne.`);
    console.log("RECOVERY GENNEMFØRT SUCCESFULDT!");
}

run().catch(console.error);
