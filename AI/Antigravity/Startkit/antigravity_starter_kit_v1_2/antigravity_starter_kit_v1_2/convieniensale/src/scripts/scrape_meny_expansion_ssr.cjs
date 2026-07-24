require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("=== Starter SSR baseret scraping af Meny.dk ===");
    const { data: allIngs } = await supabase.from('ingredients').select('id, navn, kategori');
    const { data: existingRecipes } = await supabase.from('recipes').select('titel');
    const existingTitles = new Set(existingRecipes.map(r => r.titel.toLowerCase()));

    console.log("Henter sitemap...");
    const sitemapRes = await fetch('https://meny.dk/sitemap.recipes.xml');
    const sitemapText = await sitemapRes.text();
    const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
    let allUrls = urlMatches ? urlMatches.map(u => u.replace('<loc>', '').replace('</loc>', '')) : [];
    
    allUrls = allUrls.sort(() => 0.5 - Math.random());
    const targetCount = 130;
    let insertedCount = 0;

    for (const url of allUrls) {
        if (insertedCount >= targetCount) break;
        try {
            const res = await fetch(url);
            const html = await res.text();
            
            const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
            if (!match) { console.log('Intet NEXT_DATA'); continue; }

            const nextData = JSON.parse(match[1]);
            const recipeData = nextData.props?.pageProps?.data || nextData.props?.pageProps?.initialState?.recipe?.recipe;
            if (!recipeData) { 
                console.log(url, '-> Mangler recipeData. Keys:', Object.keys(nextData.props?.pageProps || {})); 
                continue; 
            }

            const title = recipeData.shortName || recipeData.title;
            if (!title) { console.log('Ingen titel'); continue; }
            if (existingTitles.has(title.toLowerCase())) { console.log('Eksisterer allerede'); continue; }

            // Billede
            let image = "";
            if (recipeData.pictures && recipeData.pictures.length > 0) {
                image = recipeData.pictures[0].url || recipeData.pictures[0];
            } else if (recipeData.image && recipeData.image.url) {
                image = recipeData.image.url;
            }
            if (typeof image !== 'string') image = "";

            // Instruktioner
            const steps = recipeData.steps || recipeData.instructions || [];
            let instArray = [];
            if (steps.length > 0 && typeof steps[0] === 'object') {
                instArray = steps.map(s => s.text).filter(t => t && t.trim().length > 0);
            } else {
                instArray = steps;
            }
            if (instArray.length === 0) { console.log('Ingen instruktioner'); continue; }

            const textToSearch = (title + " " + instArray.join(' ')).toLowerCase();

            // Rense-algoritme (Regel 9)
            const matchedIngs = [];
            for (const ing of allIngs) {
                const regex = new RegExp(`\\b${ing.navn.toLowerCase()}\\b`, 'i');
                if (regex.test(textToSearch)) {
                    matchedIngs.push({
                        raavare_id: ing.id,
                        navn: ing.navn,
                        mængde: 1,
                        enhed: 'stk'
                    });
                }
            }

            if (matchedIngs.length < 2) {
                console.log('Afvist pga. manglende validerede ingredienser: ', title);
                continue; // Afviser hvis vi ikke fandt mindst 2 af vores varer i den
            }

            const recipeId = "meny_" + Buffer.from(title).toString('base64').substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
            
            const portioner = recipeData.amount?.number || 4;
            const tid = recipeData.preparationTime?.number || 30;

            const { error } = await supabase.from('recipes').insert([{
                id: recipeId,
                titel: title,
                billed_url: image,
                beskrivelse: '',
                portioner: portioner,
                tidsforbrug_min: tid,
                tags: [],
                instruktioner: instArray,
                ingredienser: matchedIngs
            }]);

            if (error) {
                console.error(`Fejl ved gem: ${title}`, error.message);
            } else {
                console.log(`[${insertedCount+1}/${targetCount}] Indsat: "${title}" med ${matchedIngs.length} validerede ingredienser.`);
                insertedCount++;
                existingTitles.add(title.toLowerCase());
            }

        } catch (e) {
            console.error('Fejl ved hentning af URL:', url, e.message);
        }
    }

    console.log(`\n=== FÆRDIG! Indsatte ${insertedCount} nye, 100% vaskede opskrifter. ===`);
}

run();
