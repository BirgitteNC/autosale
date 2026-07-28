const fs = require('fs');
const html = fs.readFileSync('meny_test.html', 'utf8');
const scriptRegex = /<script[^>]*>(.*?)<\/script>/gs;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  if (match[1].includes('"@type"') && match[1].includes('"Recipe"')) {
    try {
      const data = JSON.parse(match[1]);
      const recipe = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
      if (recipe) {
        console.log('JSON-LD Image property type:', typeof recipe.image);
        console.log('Value:', recipe.image);
      }
    } catch(e) {}
  }
}
