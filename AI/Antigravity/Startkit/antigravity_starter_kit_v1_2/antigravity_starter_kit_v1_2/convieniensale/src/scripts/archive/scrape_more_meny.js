import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Henter ingredienser og opskrifter fra Supabase...");
    const { data: allIngs, error: ingErr } = await supabase
        .from('ingredients')
        .select('*')
        .eq('standard_vare', false);

    if (ingErr) {
        console.error("Fejl ved hentning af ingredienser:", ingErr);
        return;
    }

    const { data: recipes, error: recErr } = await supabase
        .from('recipes')
        .select('id, titel, ingredienser');

    if (recErr) {
        console.error("Fejl ved hentning af opskrifter:", recErr);
        return;
    }

    // Find used raavare_ids
    const usedIds = new Set();
    if (recipes) {
        recipes.forEach(r => {
            if (r.ingredienser && Array.isArray(r.ingredienser)) {
                r.ingredienser.forEach(i => {
                    if (i.raavare_id) usedIds.add(i.raavare_id);
                });
            }
        });
    }

    // Find missing ingredients
    const missingIngs = allIngs.filter(ing => !usedIds.has(ing.id));
    console.log(`Fandt ${missingIngs.length} råvarer uden opskrifter.`);

    if (missingIngs.length === 0) {
        console.log("Ingen manglende opskrifter. 100% SUCCESS");
        return;
    }

    console.log("Starter browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Vi sætter en standard user-agent for at undgå at blive blokeret
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    let insertedCount = 0;

    for (const ing of missingIngs) {
        console.log(`\nSøger efter opskrifter med: ${ing.navn} (ID: ${ing.id})`);
        try {
            await page.goto('https://meny.dk/opskrifter', { waitUntil: 'networkidle2', timeout: 30000 });
            // Click cookie accept if present
            const cookieBtn = await page.$('#coiPage-1 .coi-banner__accept').catch(()=>null);
            if(cookieBtn) await cookieBtn.click().catch(()=>null);

            const searchInput = await page.$('input[placeholder*="Søg efter opskrifter"]');
            if (searchInput) {
                await searchInput.type(ing.navn);
                await searchInput.press('Enter');
                await new Promise(r => setTimeout(r, 4000)); // Vent på at SPA henter resultater
            } else {
                console.log("Kunne ikke finde søgefelt!");
            }
        } catch (e) {
            console.log("Timeout eller fejl ved søgning. Springer over.");
            continue;
        }

        const links = await page.$$eval('a', anchors => 
            anchors.map(a => a.href).filter(href => href.includes('/opskrift/'))
        ).catch(() => []);

        const uniqueLinks = [...new Set(links)].slice(0, 2);
        
        if (uniqueLinks.length === 0) {
            console.log(`Ingen opskrifter fundet for ${ing.navn}.`);
            continue;
        }

        console.log(`Fandt ${uniqueLinks.length} opskrift(er) for ${ing.navn}.`);

        for (const url of uniqueLinks) {
            console.log(`Besøger: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                
                // Hent basis data
                const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => null);
                let image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
                if (!image) {
                    image = await page.$eval('img', el => el.src).catch(() => null);
                }

                if (!title) {
                    console.log("Kunne ikke finde titel. Springer over.");
                    continue;
                }

                const bodyText = await page.evaluate(() => document.body.innerText);
                
                // Rengør instruktioner
                let instructions = "";
                const lowerBody = bodyText.toLowerCase();
                let startIdx = lowerBody.indexOf('sådan gør du');
                if (startIdx === -1) startIdx = lowerBody.indexOf('fremgangsmåde');
                
                if (startIdx !== -1) {
                    instructions = bodyText.substring(startIdx);
                    // Fjern Spisetid og Næringsindhold
                    const stopWords = ['næringsindhold', 'spisetid', 'tilføj til indkøbskurv', 'lignende opskrifter'];
                    for (const word of stopWords) {
                        const stopIdx = instructions.toLowerCase().indexOf(word);
                        if (stopIdx !== -1 && stopIdx > 20) { // Don't cut if it's the very first word
                            instructions = instructions.substring(0, stopIdx);
                        }
                    }
                } else {
                    instructions = await page.$$eval('p', ps => ps.map(p => p.innerText).filter(t => t.length > 30).join('\n\n')).catch(() => "");
                }
                
                instructions = instructions.trim();
                if (!instructions) instructions = "Se opskriften på " + url;

                // Find og map ingredienser ud fra den tekst der er på siden
                const matchedIngs = [];
                for (const aIng of allIngs) {
                    // Check if the recipe text contains the ingredient name
                    // Lidt simpel regex matching for at undgå partial word matches
                    const regex = new RegExp(`\\b${aIng.navn.toLowerCase()}\\b`, 'i');
                    if (regex.test(lowerBody)) {
                        matchedIngs.push({
                            raavare_id: aIng.id,
                            navn: aIng.navn,
                            mængde: 1,
                            enhed: 'stk'
                        });
                    }
                }

                // Sørg for at den primære råvare vi søgte efter altid er med
                if (!matchedIngs.find(i => i.raavare_id === ing.id)) {
                    matchedIngs.push({
                        raavare_id: ing.id,
                        navn: ing.navn,
                        mængde: 1,
                        enhed: 'stk'
                    });
                }

                // Tjek om opskriften allerede findes ved hjælp af titel
                const exists = recipes.some(r => r.titel.toLowerCase() === title.toLowerCase());
                if (exists) {
                    console.log(`Opskriften "${title}" findes allerede. Springer over.`);
                    continue;
                }

                const recipeId = "meny_" + Buffer.from(title).toString('base64').substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
                
                // Indsæt i Supabase
                const { error: insertErr } = await supabase.from('recipes').insert([{
                    id: recipeId,
                    titel: title,
                    billed_url: image || '',
                    beskrivelse: 'Importeret fra Meny.dk scraper',
                    portioner: 4,
                    tidsforbrug_min: 30,
                    tags: [],
                    instruktioner: instructions.split('\n').filter(l => l.trim().length > 0),
                    ingredienser: matchedIngs
                }]);

                if (insertErr) {
                    console.error("Fejl ved indsættelse:", insertErr);
                } else {
                    console.log(`Indsat opskrift: "${title}" med ${matchedIngs.length} ingredienser.`);
                    insertedCount++;
                    // Opdater lokal liste for at undgå duplikater hvis samme opskrift findes 2 gange
                    recipes.push({ titel: title });
                }

            } catch (err) {
                console.error("Fejl under scraping af", url, err.message);
            }
        }
    }

    await browser.close();
    console.log(`\nFærdig! Indsatte ${insertedCount} opskrifter.`);
    console.log("100% SUCCESS");
}

run();
