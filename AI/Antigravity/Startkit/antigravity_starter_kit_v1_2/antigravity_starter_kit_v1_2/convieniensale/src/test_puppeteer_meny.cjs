const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    console.log("Navigating to Meny recipe...");
    
    try {
        await page.goto('https://meny.dk/opskrift/taerte-med-roedloeg-spinat-skinke-og-timian', { waitUntil: 'networkidle2' });
        const html = await page.content();
        
        const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (match) {
            const nextData = JSON.parse(match[1]);
            const recipeData = nextData.props?.pageProps?.data || nextData.props?.pageProps?.initialState?.recipe?.recipe;
            console.log("Success! Found recipe data.");
            console.log("Title:", recipeData?.title);
            console.log("Ingredients:", JSON.stringify(recipeData?.ingredients || recipeData?.ingredientGroups, null, 2));
        } else {
            console.log("No NEXT_DATA found.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
    await browser.close();
}
run();
