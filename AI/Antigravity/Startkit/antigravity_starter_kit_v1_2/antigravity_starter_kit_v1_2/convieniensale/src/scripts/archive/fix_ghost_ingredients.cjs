require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const aliases = {
    'friske tomater': ['tomat', 'tomater'],
    'tomater (danske)': ['tomat', 'tomater'],
    'hakkede tomater': ['tomat', 'tomater', 'hakkede tomater', 'flåede tomater'],
    'iceberg salat': ['iceberg', 'salat'],
    'skåret salatblanding': ['salat', 'salatblanding', 'salatblade', 'blandet salat'],
    'blandet salat': ['salat', 'salatblanding', 'blandet salat'],
    'frisk spinat': ['spinat', 'babyspinat'],
    'frisk persille': ['persille'],
    'frisk rosmarin': ['rosmarin'],
    'frisk ingefær': ['ingefær'],
    'frisk koriander': ['koriander'],
    'frisk chili': ['chili', 'chilifrugt'],
    'østershatte': ['østershatte', 'svampe'],
    'enoki svampe': ['enoki', 'svampe'],
    'æble': ['æble', 'æbler'],
    'bananer': ['banan', 'bananer'],
    'citroner': ['citron', 'citronsaft', 'citronskal'],
    'gulerødder': ['gulerod', 'gulerødder'],
    'kartofler': ['kartofler', 'kartoffel'],
    'porrer': ['porre', 'porrer'],
    'hakket grisekød': ['hakket svinekød', 'hakket gris', 'svinefars'],
    'hakket oksekød': ['hakket oksekød', 'oksefars', 'hakket okse'],
    'hakket kalv og flæsk': ['hakket kalv og flæsk', 'hakket kalv', 'hakket flæsk'],
    'kyllingebryst': ['kyllingebryst', 'kyllingefilet', 'kylling']
};

function buildRegex(ingNavn) {
    const lowerName = ingNavn.toLowerCase().trim();
    let terms = [lowerName];
    if (aliases[lowerName]) {
        terms = terms.concat(aliases[lowerName]);
    }
    // Create an OR regex for all terms, bounded by word boundaries
    // We sort by length descending so longer terms match first
    terms.sort((a,b) => b.length - a.length);
    const pattern = terms.map(t => `\\b${t}\\b`).join('|');
    return new RegExp(`(${pattern})`, 'i');
}

async function run() {
    console.log("Henter ingredienser...");
    const { data: allIngs } = await supabase.from('ingredients').select('*');
    console.log(`Fandt ${allIngs.length} ingredienser.`);

    console.log("Henter opskrifter...");
    const { data: allRecipes } = await supabase.from('recipes').select('id, titel, instruktioner, ingredienser');
    console.log(`Fandt ${allRecipes.length} opskrifter.`);

    let totalNewMatches = 0;
    const stats = {};

    for (const recipe of allRecipes) {
        const title = recipe.titel || '';
        let instText = '';
        if (Array.isArray(recipe.instruktioner)) {
            instText = recipe.instruktioner.join(' ');
        } else if (typeof recipe.instruktioner === 'string') {
            instText = recipe.instruktioner;
        }

        const textToSearch = (title + ' ' + instText).toLowerCase();

        // Eksisterende råvare-id'er på opskriften
        const existingIds = new Set((recipe.ingredienser || []).map(i => i.raavare_id));
        let updatedIngs = [...(recipe.ingredienser || [])];
        let addedSomething = false;

        for (const ing of allIngs) {
            if (existingIds.has(ing.id)) continue; // Har den allerede
            
            const regex = buildRegex(ing.navn);
            if (regex.test(textToSearch)) {
                updatedIngs.push({
                    raavare_id: ing.id,
                    navn: ing.navn,
                    mængde: 1,
                    enhed: 'stk'
                });
                addedSomething = true;
                totalNewMatches++;
                stats[ing.navn] = (stats[ing.navn] || 0) + 1;
            }
        }

        if (addedSomething) {
            await supabase.from('recipes').update({ ingredienser: updatedIngs }).eq('id', recipe.id);
        }
    }

    console.log(`\nOpdatering fuldført! Fandt ${totalNewMatches} nye råvare-forbindelser.`);
    console.log("Nye matches pr. råvare:");
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    console.table(sortedStats);
}

run().catch(console.error);
