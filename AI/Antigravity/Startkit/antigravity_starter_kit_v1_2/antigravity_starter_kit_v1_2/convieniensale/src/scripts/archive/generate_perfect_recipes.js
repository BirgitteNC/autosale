import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function generate() {
    console.log("Henter ingredienser...");
    const { data: ingredients } = await supabase.from('ingredients').select('id, navn').eq('standard_vare', false);
    
    console.log("Læser rå data...");
    const rawData = JSON.parse(fs.readFileSync('datasets/scraped_meny_recipes.json', 'utf-8'));
    
    let sql = `-- Fikser alle skrabede opskrifter for at bryde cirklen!\n\n`;
    sql += `DELETE FROM recipes WHERE id LIKE '%_Q%' OR beskrivelse = 'Importeret fra Meny';\n\n`;
    
    console.log(`Behandler ${rawData.length} rå opskrifter...`);
    let insertCount = 0;
    
    for (let i = 0; i < rawData.length; i++) {
        const r = rawData[i];
        
        // Rens instruktioner
        let instructionsText = r.instructions;
        if (instructionsText.includes('SPISETID')) {
            instructionsText = instructionsText.substring(0, instructionsText.indexOf('SPISETID')).trim();
        }
        if (instructionsText.includes('Næringsindhold:')) {
            instructionsText = instructionsText.substring(0, instructionsText.indexOf('Næringsindhold:')).trim();
        }
        
        // Byg array af instruktioner
        let instArray = instructionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 3 && !line.match(/^\d+\.$/) && line !== 'Tilberedning');
            
        // Map ingredienser og find raavare_ids
        let mappedIngredients = [];
        let tags = new Set();
        
        r.ingredients.forEach(ingText => {
            let raavareId = null;
            let ingLower = ingText.toLowerCase();
            
            // Simpel keyword matching
            for (const item of ingredients) {
                let matchName = item.navn.toLowerCase().replace(' (danske)', '').replace(' (ca. 1,5 kg)', '');
                if (ingLower.includes(matchName) || 
                   (matchName === 'kyllingebryst' && ingLower.includes('kylling')) ||
                   (matchName === 'hel kylling' && ingLower.includes('kylling')) ||
                   (matchName === 'champignon' && ingLower.includes('svampe'))
                ) {
                    raavareId = item.id;
                    tags.add(item.navn);
                    break;
                }
            }
            
            // Edge cases
            if (!raavareId && ingLower.includes('kylling')) { raavareId = 'ing_hel_kylling'; tags.add('Kylling'); }
            if (!raavareId && ingLower.includes('bacon')) tags.add('Gris');
            if (!raavareId && (ingLower.includes('hvidvin') || ingLower.includes('rødvin'))) tags.add('Vin');
            
            mappedIngredients.push({
                text: ingText,
                raavare_id: raavareId,
                amount: null,
                unit: null
            });
        });
        
        let newId = `meny_fixed_${i}_${Date.now()}`;
        
        let recipeObj = {
            id: newId,
            titel: r.title,
            beskrivelse: 'Klassisk kvalitetsopskrift, nu med korrekt data.',
            tidsforbrug_min: 45,
            portioner: 4,
            billed_url: r.imageUrl,
            instruktioner: instArray,
            ingredienser: mappedIngredients,
            tags: Array.from(tags)
        };
        
        sql += `INSERT INTO recipes (id, titel, beskrivelse, tidsforbrug_min, portioner, billed_url, instruktioner, ingredienser, tags) VALUES (\n`;
        sql += `  '${recipeObj.id}',\n`;
        sql += `  '${recipeObj.titel.replace(/'/g, "''")}',\n`;
        sql += `  '${recipeObj.beskrivelse}',\n`;
        sql += `  ${recipeObj.tidsforbrug_min},\n`;
        sql += `  ${recipeObj.portioner},\n`;
        sql += `  '${recipeObj.billed_url}',\n`;
        sql += `  '${JSON.stringify(recipeObj.instruktioner).replace(/'/g, "''")}'::jsonb,\n`;
        sql += `  '${JSON.stringify(recipeObj.ingredienser).replace(/'/g, "''")}'::jsonb,\n`;
        sql += `  '${JSON.stringify(recipeObj.tags).replace(/'/g, "''")}'::jsonb\n`;
        sql += `);\n\n`;
        insertCount++;
    }
    
    fs.writeFileSync('fix_all_recipes.sql', sql);
    console.log(`Genererede SQL for at rydde op og indsætte ${insertCount} perfekte opskrifter!`);
}
generate();
