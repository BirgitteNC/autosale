require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const aliases = {
    'torskefileter': ['torsk', 'fiskefilet', 'torskefilet', 'fisk', 'paneret fisk'],
    'fiskefars': ['fiskefars', 'fiskedeller', 'fiskeburger'],
    'fersk laks': ['laks', 'laksefilet', 'varmrøget laks', 'koldrøget laks'],
    'rødspætte': ['rødspætte', 'rødspættefilet'],
    'hakket oksekød': ['hakket oksekød', 'oksekød', 'oksefars'],
    'hakket oksekød (8-14%)': ['hakket oksekød', 'oksekød', 'oksefars'],
    'hakket grisekød': ['hakket grisekød', 'hakket svinekød', 'hakket gris', 'svinefars'],
    'hakket kalv og flæsk': ['hakket kalv og flæsk', 'kalv og flæsk', 'hakket kalv', 'frikadellefars'],
    'hakket gris & kalv': ['hakket gris og kalv', 'kalv og flæsk', 'hakket kalv', 'frikadellefars'],
    'hakket kylling': ['hakket kylling', 'kyllingefars'],
    'kyllingebryst': ['kyllingebryst', 'kyllingefilet', 'kylling'],
    'hel kylling': ['hel kylling', 'kylling'],
    'kyllingeunderlår': ['kyllingeunderlår', 'kyllingelår', 'trommestikker'],
    'bacon i tern': ['bacon', 'bacontern'],
    'pancetta / bacon i tern': ['pancetta', 'bacon', 'bacontern'],
    'skinketern': ['skinketern', 'skinke'],
    'kogt skinke': ['skinke', 'kogt skinke'],
    'svinemørbrad': ['svinemørbrad', 'mørbrad'],
    'medister': ['medister', 'medisterpølse'],
    'gode brunchpølser': ['brunchpølser', 'pølser', 'wienerpølser', 'cocktailpølser'],
    'lammekølle (ca. 1,5 kg)': ['lammekølle', 'lammekød', 'lam']
};

function buildRegex(ingNavn) {
    const lowerName = ingNavn.toLowerCase().trim();
    let terms = [lowerName];
    if (aliases[lowerName]) {
        terms = terms.concat(aliases[lowerName]);
    }
    // Sorter efter længde så vi undgår "fisk" fanger "fiskefars" uhensigtsmæssigt
    terms.sort((a,b) => b.length - a.length);
    const pattern = terms.map(t => `\\b${t}\\b`).join('|');
    return new RegExp(`(${pattern})`, 'i');
}

async function run() {
    console.log("Henter kød og fisk fra databasen...");
    const { data: allIngs } = await supabase.from('ingredients').select('*').in('kategori', ['Kød', 'Slagter', 'Fiskeafdeling']);
    console.log(`Fandt ${allIngs.length} relevante råvarer.`);

    const { data: allRecipes } = await supabase.from('recipes').select('id, titel, instruktioner, ingredienser');

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
        const existingIds = new Set((recipe.ingredienser || []).map(i => i.raavare_id));
        let updatedIngs = [...(recipe.ingredienser || [])];
        let addedSomething = false;

        for (const ing of allIngs) {
            if (existingIds.has(ing.id)) continue;
            
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
                console.log(`[MATCH] Fandt '${ing.navn}' i opskriften: '${title}'`);
            }
        }

        if (addedSomething) {
            await supabase.from('recipes').update({ ingredienser: updatedIngs }).eq('id', recipe.id);
        }
    }

    console.log(`\nOpdatering fuldført! Fandt ${totalNewMatches} nye kød/fisk-forbindelser.`);
    if (totalNewMatches > 0) {
        const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        console.table(sortedStats);
    }
}

run().catch(console.error);
