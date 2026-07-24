const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../manglende_maengder_auto.csv');
const jsonPath = path.join(__dirname, '../datasets/scraped_meny_recipes.json');
const outputPath = path.join(__dirname, '../manglende_maengder_komplet.csv');

async function run() {
    console.log('Læser filer...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8').split('\n');
    const recipesData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Gruppér eksisterende CSV rækker per opskrift
    const recipeMap = new Map(); // opskrift_navn -> array af originale ingredienser i csv
    const recipeIdMap = new Map(); // opskrift_navn -> opskrift_id

    let outputCsv = [];
    const header = csvContent[0].trim();
    outputCsv.push(header);

    for (let i = 1; i < csvContent.length; i++) {
        const line = csvContent[i].trim();
        if (!line) continue;
        
        outputCsv.push(line); // behold den originale række

        const parts = line.split(';');
        const opskrift_id = parts[0].replace(/^"|"$/g, '');
        const opskrift_navn = parts[1].replace(/^"|"$/g, '');
        const original_text = (parts[6] || '').replace(/^"|"$/g, '');
        const raavare_navn = parts[3].replace(/^"|"$/g, '');

        if (!recipeMap.has(opskrift_navn)) {
            recipeMap.set(opskrift_navn, []);
            recipeIdMap.set(opskrift_navn, opskrift_id);
        }
        
        // Vi gemmer både original tekst og råvarenavn for at kunne tjekke om en ingrediens er dækket
        recipeMap.get(opskrift_navn).push({
            original: original_text.toLowerCase(),
            navn: raavare_navn.toLowerCase()
        });
    }

    let addedCount = 0;

    // Gennemgå alle opskrifter i vores CSV
    for (const [opskrift_navn, existingIngredients] of recipeMap.entries()) {
        const opskrift_id = recipeIdMap.get(opskrift_navn);
        
        const recipe = recipesData.find(r => r.title.toLowerCase().trim() === opskrift_navn.toLowerCase().trim());
        if (recipe && recipe.ingredients) {
            
            // Tjek hver ingrediens i Meny-opskriften
            for (const jsonIng of recipe.ingredients) {
                const cleanJsonIng = jsonIng.toLowerCase().trim();
                
                // Er denne ingrediens allerede i CSV'en?
                const isAlreadyInCsv = existingIngredients.some(ei => 
                    (ei.original && cleanJsonIng.includes(ei.original)) || 
                    (ei.original && ei.original.includes(cleanJsonIng)) ||
                    cleanJsonIng.includes(ei.navn.replace(/er$/, '').replace(/e$/, ''))
                );

                if (!isAlreadyInCsv) {
                    // Mangler! Vi skal udtrække data og tilføje den
                    let ny_maengde = '';
                    let ny_enhed = '';
                    let raavare_navn = jsonIng; // Default til hele teksten, men vi forsøger at rense
                    
                    const match = jsonIng.match(/^([\d,.]+)\s*([a-zA-ZæøåÆØÅ]+)\s*(.*)/);
                    if (match) {
                        ny_maengde = match[1].replace(',', '.');
                        ny_enhed = match[2];
                        raavare_navn = match[3].split('(')[0].trim(); // Fjern alt efter parentes (f.eks. "lagt i blød...")
                        
                        // Capitalize first letter of raavare_navn
                        if (raavare_navn) {
                            raavare_navn = raavare_navn.charAt(0).toUpperCase() + raavare_navn.slice(1);
                        } else {
                            raavare_navn = jsonIng;
                        }
                    } else if (jsonIng.match(/^(lidt|salt|peber|smag)/i)) {
                        ny_maengde = '0';
                        ny_enhed = 'smag';
                        raavare_navn = jsonIng.split('(')[0].trim();
                        raavare_navn = raavare_navn.charAt(0).toUpperCase() + raavare_navn.slice(1);
                    }

                    const original_text = jsonIng.replace(/;/g, ',');
                    
                    // Tilføj ny række! (Opskrift ID;Opskrift Titel;Raavare ID;Ingrediens Navn;Ny Mængde;Ny Enhed;Original tekst)
                    // Raavare ID lades tom, så den oprettes/slås op under import
                    outputCsv.push(`${opskrift_id};${opskrift_navn};;${raavare_navn};${ny_maengde};${ny_enhed};${original_text}`);
                    addedCount++;
                }
            }
        }
    }

    fs.writeFileSync(outputPath, outputCsv.join('\n'), 'utf-8');
    console.log(`Færdig! Tilføjede ${addedCount} helt manglende ingredienser (som f.eks. kikærter). Gemt i manglende_maengder_komplet.csv`);
}

run();
