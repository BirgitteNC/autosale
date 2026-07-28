const fs = require('fs');

async function testScrape() {
  try {
    const res = await fetch('https://meny.dk/opskrift/madtaerte-cherrytomater-ricotta-og-mozzarella');
    const text = await res.text();
    fs.writeFileSync('meny_test.html', text);
    
    // Check for JSON-LD
    const scriptRegex = /<script[^>]*>(.*?)<\/script>/gs;
    let match;
    let jsonFound = false;
    while ((match = scriptRegex.exec(text)) !== null) {
      if (match[1].includes('"@type"') && match[1].includes('"Recipe"')) {
        console.log('Found Recipe JSON-LD!');
        jsonFound = true;
      }
      if (match[0].includes('__NEXT_DATA__')) {
        console.log('Found __NEXT_DATA__!');
        jsonFound = true;
      }
    }
    if (!jsonFound) console.log('No obvious JSON found, must parse HTML.');
  } catch (e) {
    console.error(e);
  }
}
testScrape();
