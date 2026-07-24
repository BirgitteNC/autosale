import puppeteer from 'puppeteer';

async function test() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://meny.dk/opskrifter', { waitUntil: 'networkidle2' });
    
    // Find all inputs
    const inputs = await page.$$eval('input', els => els.map(e => ({
        type: e.type,
        placeholder: e.placeholder,
        class: e.className,
        id: e.id
    })));
    console.log("Inputs found:", inputs);
    
    await browser.close();
}
test().catch(console.error);
