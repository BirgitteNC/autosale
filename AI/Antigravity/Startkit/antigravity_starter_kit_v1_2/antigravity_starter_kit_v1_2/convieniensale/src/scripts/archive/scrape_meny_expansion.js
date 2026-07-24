import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Henter ingredienser fra Supabase...");
    const { data: allIngs } = await supabase.from('ingredients').select('id, navn, enhed');
    
    console.log("Henter eksisterende opskrifter for at undgå dubletter...");
    const { data: existingRecipes } = await supabase.from('recipes').select('titel');
    const existingTitles = new Set(existingRecipes.map(r => r.titel.toLowerCase()));

    console.log("Henter sitemap fra Meny.dk...");
    const sitemapRes = await fetch('https://meny.dk/sitemap.recipes.xml');
    const sitemapText = await sitemapRes.text();
    
    // Simpel udtræk af URL'er
    const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
    let allUrls = urlMatches ? urlMatches.map(u => u.replace('<loc>', '').replace('</loc>', '')) : [];
    
    console.log(`Fandt ${allUrls.length} opskrifts-URL'er i sitemap.`);
    
    // Vi blander URL'erne (shuffle) for at få et tilfældigt udsnit
    allUrls = allUrls.sort(() => 0.5 - Math.random());
    
    const targetCount = 130;
    const urlsToScrape = allUrls.slice(0, targetCount * 2); // Tag lidt ekstra hvis nogle fejler
    
    console.log(`Starter Puppeteer for at skrabe opskrifter...`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    let insertedCount = 0;
    
    for (const url of urlsToScrape) {
        if (insertedCount >= targetCount) break;
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => console.log('Goto timeout, men prøver alligevel at læse dom...'));            
            // Hent basis data
            const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => null);
            if (!title || existingTitles.has(title.toLowerCase())) {
                continue; // Spring over hvis titel mangler eller opskriften findes
            }

            let image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
            if (!image) image = await page.$eval('img', el => el.src).catch(() => null);
            
            // Hent instruktioner
            const bodyText = await page.evaluate(() => document.body.innerText);
            let instructions = "";
            const lowerBody = bodyText.toLowerCase();
            let startIdx = lowerBody.indexOf('sådan gør du');
            if (startIdx === -1) startIdx = lowerBody.indexOf('fremgangsmåde');
            
            if (startIdx !== -1) {
                instructions = bodyText.substring(startIdx);
                const stopWords = ['næringsindhold', 'spisetid', 'tilføj til indkøbskurv', 'lignende opskrifter'];
                for (const word of stopWords) {
                    const stopIdx = instructions.toLowerCase().indexOf(word);
                    if (stopIdx !== -1 && stopIdx > 20) {
                        instructions = instructions.substring(0, stopIdx);
                    }
                }
            } else {
                instructions = await page.$$eval('p', ps => ps.map(p => p.innerText).filter(t => t.length > 30).join('\n\n')).catch(() => "");
            }
            
            instructions = instructions.trim();
            if (!instructions) continue;

            const instArray = instructions.split('\n').filter(l => l.trim().length > 0);
            const textToSearch = (title + " " + instArray.join(' ')).toLowerCase();

            // NY STRAM VALIDERINGSALGORITME
            const matchedIngs = [];
            for (const ing of allIngs) {
                const regex = new RegExp(`\\b${ing.navn.toLowerCase()}\\b`, 'i');
                if (regex.test(textToSearch)) {
                    matchedIngs.push({
                        raavare_id: ing.id,
                        navn: ing.navn,
                        mængde: 1,
                        enhed: ing.enhed || 'stk'
                    });
                }
            }

            // Indsæt kun hvis den har fundet mindst 2 ingredienser (for at undgå helt ubrugelige opskrifter)
            if (matchedIngs.length < 2) continue;

            const recipeId = "meny_" + Buffer.from(title).toString('base64').substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
            
            const recipeData = {
                id: recipeId,
                titel: title,
                billed_url: image || '',
                beskrivelse: '', // Vi bruger ikke længere dummy beskrivelser
                portioner: 4,
                tidsforbrug_min: 30,
                tags: [],
                instruktioner: instArray,
                ingredienser: matchedIngs
            };

            const { error: insertErr } = await supabase.from('recipes').insert([recipeData]);

            if (insertErr) {
                console.error("DB Fejl:", insertErr.message);
            } else {
                console.log(`[${insertedCount + 1}/${targetCount}] Indsat: "${title}" med ${matchedIngs.length} ingredienser.`);
                insertedCount++;
                existingTitles.add(title.toLowerCase());
            }

        } catch (err) {
            console.log(`Sprang over ${url} (Timeout eller parsing fejl)`);
        }
    }

    await browser.close();
    console.log(`\n=== FÆRDIG! Indsatte ${insertedCount} nye, rene opskrifter. ===`);
}

run();
