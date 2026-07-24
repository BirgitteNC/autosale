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

function categorize(newName, originalName) {
    const n = newName.toLowerCase();
    if (n.match(/(husk|loppefrø|finax|glutenfri melmix)/i)) return 'Diverse';
    if (n.match(/(frossen ært|hønsekødssuppe|panerede fiskefileter)/i)) return 'Frost';
    if (n.match(/(fisk|laks|torsk|rødspætte|rejer|krabbe|rogn|ansjos|kammusling|sildefileter|kuller)/i)) return 'Fisk';
    if (n.match(/(bacon|butterdej|tærtedej|pasteuriserede æggehvider|plantefars|hummus|serrano)/i)) return 'Køl';
    if (n.match(/(kylling|and|kalkun|gris|okse|kalv|hjerter|kød|pancetta|skinke|steak|revelsben|kotelet|fasan|lam)/i)) return 'Slagter';
    if (n.match(/(ost|mælk|fløde|smør|creme fraiche|skyr|kvark|yoghurt|æg|ymer|mascarpone)$/i) || originalName.match(/(Arla|Cheasy|Puck|Jarlsberg|Castello)/i)) return 'Mejeri';
    if (n.match(/(brød|boller|ciabatta|brioche|flute|baguette)$/i)) return 'Bager';
    if (n.match(/(salt|peber|krydderi|karry|paprika|chili|fennikelfrø|nellike|kanel|kardemomme|chiliflage|vaniljesukker|vaniljestang|vaniljepulver|texmex|gurkemeje|natron|løvstikke|rålakrids|garam masala|peberkorn)/i)) return 'Krydderier';
    if (n.match(/(kikærter|bagespray|brun farin|dressing|chia|sennep|kulør|græskarkerner|plantedrik|havredrik|kakaopulver|spelt|perlebyg|tortilla|sliders|nescafé|rasp|pankorasp|sesamfrø|pinjekerner|solsikkekerner|rosiner|mandelflage|tørrede abrikoser|salsa|sriracha|skumfiduser|syltet|træspyd|tartelet|eddike|olie|sauce|fond|bouillon|nudler|pasta|ris|gryn|couscous|oliven|aioli|sirup|honning|kiks|bønner|ketchup|pesto|tapenade|tahin)/i)) return 'Kolonial';
    if (n.match(/(mel|sukker|vanilje|bagepulver|gær|chokolade|kakao|sirup|honning|margarine|husblas)$/i)) return 'Bagning';
    if (n.match(/(nød|nødder|jalapeño|karse|knoldselleri|mango|pastinak|rabarber|peberrod|salturt|bladselleri|abrikoser|kål|salat|løg|tomat|æble|bær|frugt|kartofler|kartoffel|fennikel|asparges|peberfrugt|urter|timian|basilikum|persille|dild|kørvel|purløg|mynte|salvie|estragon|koriander|rosmarin|svampe|champignon|majs|radise|squash|aubergine|citrus|lime|citron|appelsin|fersken|nektarin|dadler|ærter|linser|rucola|skovsyre|skud|broccolini)/i)) return 'Grønt';
    if (n.match(/(vand|isterninger|is)$/i)) return 'Basis';
    return 'Diverse';
}

function cleanIngredient(originalName) {
    let newName = originalName;
    const instructions = [];
    
    newName = newName.replace(/kogt eller stegt kyllingekød/gi, 'tilberedt kyllingekød');
    newName = newName.replace(/Oreo cookiecrumbles/gi, 'Oreo');
    newName = newName.replace(/spaghetti af kvalitet/gi, 'spaghetti');
    newName = newName.replace(/vaniljesukker &/gi, 'vaniljesukker');
    newName = newName.replace(/dobbelt sildefileter/gi, 'sildefileter');
    newName = newName.replace(/kød af kogte revelsben fra dagen før/gi, 'revelsben');
    
    // Mængder fjernes helt (ikke instruktion)
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
    
    // Ost sammenskrivning
    if (newName.toLowerCase().includes('parmigiano reggiano') || newName.toLowerCase().includes('parmesan') || newName.toLowerCase().includes('parmegiano')) {
         newName = 'parmesan';
    }
    
    return { newName, instructions };
}

async function run() {
    console.log("Henter ingredienser...");
    const { data: ingredients, error: ingError } = await supabase.from('ingredients').select('*');
    if (ingError) throw ingError;
    
    console.log("Henter opskrifter...");
    const { data: recipes, error: recError } = await supabase.from('recipes').select('*');
    if (recError) throw recError;
    
    const originalCount = ingredients.length;
    console.log(`Fandt ${originalCount} ingredienser og ${recipes.length} opskrifter.`);

    // 1. Group ingredients by normalized name
    const groupedIngredients = {}; // { 'rugbrød': [ {id: 1, navn: 'rugbrød'}, {id: 2, navn: 'skiver ristet rugbrød'} ] }
    const ingredientIdToInstruction = {}; // { 2: ['skiver', 'ristet'] }
    
    for (const ing of ingredients) {
        const { newName, instructions } = cleanIngredient(ing.navn);
        const lowerName = newName.toLowerCase();
        
        if (!groupedIngredients[lowerName]) {
            groupedIngredients[lowerName] = [];
        }
        groupedIngredients[lowerName].push(ing);
        ingredientIdToInstruction[ing.id] = { newName, instructions };
    }
    
    const dirtyToCanonicalMap = {}; // Maps dirty ID -> Canonical ID
    const canonicalIngredientsToKeep = [];
    const ingredientsToDelete = [];
    
    console.log("Konsoliderer ingredienser...");
    for (const [lowerName, group] of Object.entries(groupedIngredients)) {
        // Find the "best" canonical ingredient in the group. Prefer one whose name exactly matches the newName, otherwise first.
        let canonical = group.find(i => i.navn.toLowerCase() === lowerName);
        if (!canonical) canonical = group[0];
        
        // Update its name and category
        const { newName } = cleanIngredient(canonical.navn);
        canonical.navn = newName;
        canonical.kategori = categorize(newName, canonical.navn);
        
        canonicalIngredientsToKeep.push(canonical);
        
        for (const ing of group) {
            dirtyToCanonicalMap[ing.id] = canonical.id;
            if (ing.id !== canonical.id) {
                ingredientsToDelete.push(ing.id);
            }
        }
    }
    
    console.log(`Der vil være ${canonicalIngredientsToKeep.length} unikke ingredienser tilbage. ${ingredientsToDelete.length} dubletter vil blive slettet.`);
    
    let updatedRecipesCount = 0;
    
    // 2. Update recipes
    for (const recipe of recipes) {
        let recipeChanged = false;
        const newIngredienser = [];
        const newInstruktioner = [...(recipe.instruktioner || [])];
        
        for (const recIng of (recipe.ingredienser || [])) {
            const dirtyId = recIng.id;
            const canonicalId = dirtyToCanonicalMap[dirtyId];
            const { newName, instructions } = ingredientIdToInstruction[dirtyId] || { newName: recIng.navn, instructions: [] };
            
            if (canonicalId !== dirtyId || recIng.navn !== newName) {
                recipeChanged = true;
            }
            
            // Tilføj de afklippede instruktioner til opskriften, hvis de ikke er der i forvejen
            for (const instr of instructions) {
                const instrText = instr.toLowerCase();
                // Check if any existing instruction already contains this word (naive check)
                const alreadyExists = newInstruktioner.some(i => i.toLowerCase().includes(instrText));
                if (!alreadyExists) {
                    newInstruktioner.push(`Tilberedning af ${newName}: ${instr}`);
                    recipeChanged = true;
                }
            }
            
            newIngredienser.push({
                ...recIng,
                id: canonicalId,
                navn: newName
            });
        }
        
        if (recipeChanged) {
            // Update the recipe in Supabase
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
    console.log(`Opdaterede ${updatedRecipesCount} opskrifter med nye ingrediens-IDs, rensede navne og eventuelle klippede instruktioner.`);
    
    // 3. Update canonical ingredients (Navn and Kategori)
    console.log("Gemmer opdaterede kategorier og navne for canonical ingredienser...");
    // We update them one by one or in batches.
    let updatedIngCount = 0;
    for (const canonical of canonicalIngredientsToKeep) {
        const { error: updErr } = await supabase.from('ingredients')
            .update({ navn: canonical.navn, kategori: canonical.kategori })
            .eq('id', canonical.id);
        if (updErr) console.error(`Fejl ved opdatering af ingrediens ${canonical.id}:`, updErr);
        else updatedIngCount++;
    }
    console.log(`Opdaterede ${updatedIngCount} canonical ingredienser.`);
    
    // 4. Delete dirty ingredients
    console.log("Sletter snavsede dubletter...");
    if (ingredientsToDelete.length > 0) {
        // Delete in batches of 50 to avoid URL limits
        const batchSize = 50;
        let deletedCount = 0;
        for (let i = 0; i < ingredientsToDelete.length; i += batchSize) {
            const batch = ingredientsToDelete.slice(i, i + batchSize);
            const { error: delErr } = await supabase.from('ingredients').delete().in('id', batch);
            if (delErr) {
                console.error(`Fejl ved sletning af batch:`, delErr);
            } else {
                deletedCount += batch.length;
            }
        }
        console.log(`Slettede ${deletedCount} dubletter.`);
    } else {
        console.log("Ingen dubletter at slette.");
    }
    
    console.log("DATAVASK GENNEMFØRT SUCCESFULDT!");
}

run().catch(console.error);
