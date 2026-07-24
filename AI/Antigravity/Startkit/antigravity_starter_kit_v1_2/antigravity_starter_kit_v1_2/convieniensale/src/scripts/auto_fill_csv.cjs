const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../manglende_maengder.csv');
const jsonPath = path.join(__dirname, '../datasets/scraped_meny_recipes.json');
const outputPath = path.join(__dirname, '../manglende_maengder_auto.csv');

async function run() {
    console.log('Læser filer...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8').split('\n');
    const recipesData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    let outputCsv = [];
    const header = csvContent[0].trim();
    
    // Check if user already had ny_maengde columns, if not add them
    let hasAmountCols = header.includes('ny_maengde');
    if (hasAmountCols) {
        outputCsv.push(header);
    } else {
        outputCsv.push(`${header};ny_maengde;ny_enhed;original_tekst`);
    }

    let matchCount = 0;

    for (let i = 1; i < csvContent.length; i++) {
        const line = csvContent[i].trim();
        if (!line) continue;

        const parts = line.split(';');
        const opskrift_id = parts[0].replace(/^"|"$/g, '');
        const opskrift_navn = parts[1].replace(/^"|"$/g, '');
        const raavare_id = parts[2].replace(/^"|"$/g, '');
        const raavare_navn = parts[3].replace(/^"|"$/g, '');
        
        let ny_maengde = (parts[4] || '').replace(/^"|"$/g, '');
        let ny_enhed = (parts[5] || '').replace(/^"|"$/g, '');
        let original_text = '';

        if (opskrift_navn && raavare_navn && !ny_maengde) {
            // Find recipe in JSON
            const recipe = recipesData.find(r => r.title.toLowerCase().trim() === opskrift_navn.toLowerCase().trim());
            if (recipe) {
                // Find matching ingredient line
                const searchStr = raavare_navn.toLowerCase().replace(/er$/, '').replace(/e$/, '').replace('frisk ', '');
                const matchLine = recipe.ingredients.find(ing => ing.toLowerCase().includes(searchStr));
                
                if (matchLine) {
                    original_text = matchLine.replace(/;/g, ',');
                    // Extract amount and unit (e.g., "400 g hakket...", "2 spsk...", "1 fed...")
                    const match = matchLine.match(/^([\d,.]+)\s*([a-zA-ZæøåÆØÅ]+)/);
                    if (match) {
                        ny_maengde = match[1].replace(',', '.');
                        ny_enhed = match[2];
                        matchCount++;
                    } else if (matchLine.match(/^(lidt|salt|peber|smag)/i)) {
                        ny_maengde = '0';
                        ny_enhed = 'smag';
                        matchCount++;
                    }
                }
            }
        }

        if (hasAmountCols) {
            outputCsv.push(`${opskrift_id};${opskrift_navn};${raavare_id};${raavare_navn};${ny_maengde};${ny_enhed}`);
        } else {
            outputCsv.push(`${opskrift_id};${opskrift_navn};${raavare_id};${raavare_navn};${ny_maengde};${ny_enhed};${original_text}`);
        }
    }

    fs.writeFileSync(outputPath, outputCsv.join('\n'), 'utf-8');
    console.log(`Færdig! Auto-udfyldte ${matchCount} mængder ud fra databasen. Gemt i manglende_maengder_auto.csv`);
}

run();
