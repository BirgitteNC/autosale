require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: recipes, error } = await supabase.from('recipes').select('id, titel, portioner, ingredienser');
    if (error) {
        console.error("Fejl:", error);
        return;
    }

    let csvContent = 'Opskrift ID;Opskrift Titel;Antal Portioner;Raavare ID;Ingrediens Navn;Ny Mængde (Total for X portioner);Ny Enhed\n';
    let count = 0;

    for (const recipe of recipes) {
        if (!recipe.ingredienser || recipe.ingredienser.length === 0) continue;
        
        const allOneStk = recipe.ingredienser.every(i => i.mængde === 1 && i.enhed === 'stk');
        
        if (allOneStk) {
            count++;
            const portioner = recipe.portioner || 4; // Vores app bruger fallback på 4 (eller 2 afhængig af sted) men scraper satte oftest 4. Lad os vise det faktiske fra db.
            for (const ing of recipe.ingredienser) {
                const safeTitle = recipe.titel.replace(/"/g, '""');
                const safeName = ing.navn.replace(/"/g, '""');
                csvContent += `"${recipe.id}";"${safeTitle}";"${portioner}";"${ing.raavare_id}";"${safeName}";;\n`;
            }
        }
    }

    const filepath = require('path').join(__dirname, 'manglende_maengder.csv');
    fs.writeFileSync(filepath, "\uFEFF" + csvContent, 'utf8'); // BOM for Excel
    console.log(`Opdaterede CSV med portioner for ${count} opskrifter på: ${filepath}`);
}

run();
