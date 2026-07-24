import puppeteer from 'puppeteer';

async function testScrape() {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    console.log("Searching for laks...");
    await page.goto('https://meny.dk/opskrifter?search=laks', { waitUntil: 'networkidle2' });
    
    const links = await page.$$eval('a', anchors => 
        anchors.map(a => a.href).filter(href => href.includes('/opskrift/'))
    );
    const uniqueLinks = [...new Set(links)];
    console.log("Found links:", uniqueLinks.slice(0, 3));
    
    if (uniqueLinks.length > 0) {
        console.log("Visiting:", uniqueLinks[0]);
        await page.goto(uniqueLinks[0], { waitUntil: 'networkidle2' });
        
        const title = await page.$eval('h1', el => el.innerText).catch(() => 'No H1');
        const ogImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => 'No image');
        const bodyText = await page.$eval('body', el => el.innerText).catch(() => '');
        
        console.log("Title:", title);
        console.log("Image:", ogImage);
        console.log("Body snippet:", bodyText.substring(0, 500));
        
        // Let's try to find ingredients
        const ingText = await page.$$eval('.ingredient, li, p', els => els.map(e => e.innerText).join('\n'));
        console.log("Ingredients length:", ingText.length);
    }
    
    await browser.close();
}

testScrape().catch(console.error);
