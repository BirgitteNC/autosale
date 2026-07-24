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
    
    if (n.match(/(husk|loppefrø|finax|glutenfri melmix|grillspyd)/i)) return 'Diverse';
    if (n.match(/(isterning|vand)$/i)) return 'Basis';
    if (n.match(/(is|frossen ært|hønsekødssuppe|panerede fiskefileter|ærter)/i)) return 'Frost';
    if (n.match(/(fisk|laks|torsk|rødspætte|rejer|krabbe|rogn|ansjos|kammusling|sildefileter|kuller|kulmule)/i)) return 'Fisk';
    if (n.match(/(bacon|butterdej|tærtedej|pasteuriserede æggehvider|plantefars|hummus|serrano)/i)) return 'Køl';
    if (n.match(/(kylling|and|ænder|kalkun|gris|okse|kalv|hjerter|kød|pancetta|skinke|steak|revelsben|kotelet|fasan|lam|mørbrad|flæskesteg|roastbeef|medister|pølser)/i)) return 'Slagter';
    if (n.match(/(ost|mælk|fløde|smør|creme fraiche|skyr|kvark|yoghurt|æg|ymer|mascarpone|feta|pecorino|ricotta|æggeblomme|mozzarella)$/i) || originalName.match(/(Arla|Cheasy|Puck|Jarlsberg|Castello)/i)) return 'Mejeri';
    if (n.match(/(brød|boller|ciabatta|brioche|flute|baguette|rundstykker|flutes)/i)) return 'Bager';
    if (n.match(/(salt|peber|krydderi|karry|paprika|chili|fennikelfrø|nellike|kanel|kardemomme|chiliflage|vaniljesukker|vaniljestang|vaniljepulver|texmex|gurkemeje|natron|løvstikke|rålakrids|garam masala|peberkorn|hvidløgspulver|oregano|spidskommen|allehånde)/i)) return 'Krydderier';
    if (n.match(/(kikærter|bagespray|brun farin|dressing|chia|sennep|kulør|græskarkerner|plantedrik|havredrik|kakaopulver|spelt|perlebyg|tortilla|sliders|nescafé|rasp|pankorasp|sesamfrø|pinjekerner|solsikkekerner|rosiner|mandelflage|tørrede abrikoser|salsa|sriracha|skumfiduser|syltet|træspyd|tartelet|eddike|olie|sauce|fond|bouillon|nudler|pasta|ris|gryn|couscous|oliven|aioli|sirup|honning|kiks|bønner|ketchup|pesto|tapenade|tahin|quinoa|chips|mayonnaise|kapers|tagliatelle|peanut|hørfrø|kikært|oreo|spaghetti|bulgur|filodej|kaffe|nutella|majs|perleløg|kartoffelchips)/i)) return 'Kolonial';
    if (n.match(/(vin|rosé|øl|madeira|whisky|gin|bourbon)/i)) return 'Kolonial'; // Placed in Kolonial for simplicity
    if (n.match(/(mel|sukker|vanilje|bagepulver|gær|chokolade|kakao|sirup|honning|margarine|husblas|frysetørrede hindbær|marcipan|marengs|madfarve|flormelis|kokos)/i)) return 'Bagning';
    if (n.match(/(nød|nødder|jalapeño|karse|knoldselleri|mango|pastinak|rabarber|peberrod|salturt|bladselleri|abrikoser|kål|salat|løg|tomat|æble|bær|frugt|kartofler|kartoffel|fennikel|asparges|peberfrugt|urter|timian|basilikum|persille|dild|kørvel|purløg|mynte|salvie|estragon|koriander|rosmarin|svampe|champignon|radise|squash|aubergine|citrus|lime|citron|appelsin|fersken|nektarin|dadler|linser|rucola|skovsyre|skud|broccolini|ingefær|agurk|gulerødder|gulerod|porrer|banan|bananer|spinat|avocado|broccoli|østershatte|bønnespirer|græskar|klementin|clementin|pære|rødbeder|haricots verts|fennikler|zucchini)/i)) return 'Grønt';
    
    return 'Diverse';
}

function cleanIngredient(originalName) {
    let newName = originalName.replace(/\s+/g, ' ').trim();
    const instructions = [];
    
    // Specifikke replacements og splits
    if (newName.toLowerCase() === 'hasselnøddecreme eller nutella') newName = 'Nutella';
    if (newName.toLowerCase() === 'persille, oregano eller kørvel') newName = 'Krydderurter';
    if (newName.toLowerCase() === 'persille, dild eller andre krydderurter og spirer') newName = 'Krydderurter';
    if (newName.toLowerCase() === 'sort madfarve eller mørk chokolade til dekoration') {
        newName = 'Madfarve';
        instructions.push('eller mørk chokolade til dekoration');
    }
    if (newName.toLowerCase().includes('citron skal')) {
        newName = 'citron';
        instructions.push('skal');
    }
    
    // Citron og saft komplekser
    const saftSkalRegex = /citron,\s+saft\s+og\s+skal|skal\s+af\s+1\s+citron|saften\s+0\.5\s+citron|saft\s+fra\s+0\.5\s+citron|citronsaft\s+-\s+af\s+en\s+halv\s+citron|citronskal\s+af\s+1\s+citron|saft\s+fra\s+citronsaft|saften\s+0\.5\s+citron/gi;
    if (saftSkalRegex.test(newName)) {
        instructions.push(newName);
        newName = 'citron';
    }

    const extractionRegexes = [
        // Quantities at the start (incl new ones)
        /^(ca\.?|bakke|håndfuld|glas|dåser|dåse|Lille 1 bundt|Stor 1 håndfuld|lille|stor|1 dl|2 spsk|2 tsk|1\/2|0\.5|½|1|2|lidt|en halv|en|et|helt fed|bæger)\s+/gi,
        // Instructions before name
        /\b(brækkede|klippet|presset|groft revne|groftrevet|groft|finthakkede|finthakket|hakkede|revet|fine frosne|frosne|optøede|friskbagt|friskrevet|friskhakket|frisk|friske|tørrede|tørret|friskkværnet|sammenpisket|smeltet|koldt|blødt|lunken|lunkent|daggammelt|god|ekstrafine|kold, færdiglavet|fintklippet|grofthakkede|flydende|ristet|ristede|kogt|knust|knuste|lune|saft af)\s+/gi,
        // Suffix instructions
        /\s+(i grove tern|i tykke skiver|i tynde skiver|i tynde ringe|i tynde både|i små tern|i tern|i strimler|i halve|i både|i mindre stykker|i mindre buketter|på stilk|klippet i.*|delt i.*|skåret i.*|i fed|i bælg|skive)\b/gi,
        // Extensions
        /\s+(til ristning af brød|fra køl|til drys|\+ gem aspargeshovederne|\+ ekstra.*|til pynt|til pensling|til ristning|til stegning|til formen|til servering|fra dagen før|i at vende bollerne)$/i,
        /^(evt\.\s+|pynt:\s+|pynt med\s+|gem\s+)/i
    ];
    
    for (const regex of extractionRegexes) {
        let match;
        const matches = newName.match(regex);
        if (matches) {
            for (let m of matches) {
                const instr = m.trim().replace(/^\+ /, '');
                if (instr) instructions.push(instr);
            }
            newName = newName.replace(regex, ' ').replace(/\s+/g, ' ').trim();
        }
    }
    
    // Fast overskrivninger af fejl
    if (newName.toLowerCase() === 'agurker') newName = 'agurk';
    if (newName.toLowerCase() === 'citroner') newName = 'citron';
    if (newName.toLowerCase() === 'rødløg i både') newName = 'rødløg';
    if (newName.toLowerCase() === 'isterning') newName = 'isterninger';
    if (newName.toLowerCase() === 'dobbelt sildefileter') newName = 'sildefileter';
    if (newName.toLowerCase() === 'kød af kogte revelsben fra dagen før') newName = 'revelsben';
    if (newName.toLowerCase() === 'majs fra dåse') newName = 'majs';
    if (newName.toLowerCase() === 'kulmuler filet') newName = 'kulmulefileter';
    if (newName.toLowerCase() === 'kartoffel chips') newName = 'kartoffelchips';
    
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
    const groupedIngredients = {}; 
    const ingredientIdToInstruction = {}; 
    
    for (const ing of ingredients) {
        const { newName, instructions } = cleanIngredient(ing.navn);
        const lowerName = newName.toLowerCase();
        
        if (!groupedIngredients[lowerName]) {
            groupedIngredients[lowerName] = [];
        }
        groupedIngredients[lowerName].push(ing);
        ingredientIdToInstruction[ing.id] = { newName, instructions };
    }
    
    const dirtyToCanonicalMap = {}; 
    const canonicalIngredientsToKeep = [];
    const ingredientsToDelete = [];
    
    console.log("Konsoliderer ingredienser v2...");
    for (const [lowerName, group] of Object.entries(groupedIngredients)) {
        let canonical = group.find(i => i.navn.toLowerCase() === lowerName);
        if (!canonical) canonical = group[0];
        
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
            // FIX: Using raavare_id now!
            const dirtyId = recIng.raavare_id;
            const canonicalId = dirtyToCanonicalMap[dirtyId];
            const { newName, instructions } = ingredientIdToInstruction[dirtyId] || { newName: recIng.navn, instructions: [] };
            
            // Hvis ID mangler fra vores map (f.eks. fordi ingrediensen blev slettet af v1), så brug fallback:
            const finalId = canonicalId || dirtyId;
            
            if (finalId !== dirtyId || recIng.navn !== newName) {
                recipeChanged = true;
            }
            
            // Tilføj de afklippede instruktioner til opskriften
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
                raavare_id: finalId,
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
    console.log(`Opdaterede ${updatedRecipesCount} opskrifter.`);
    
    // 3. Update canonical ingredients (Navn and Kategori)
    console.log("Gemmer opdaterede kategorier og navne for canonical ingredienser...");
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
    
    console.log("DATAVASK V2 GENNEMFØRT SUCCESFULDT!");
}

run().catch(console.error);
