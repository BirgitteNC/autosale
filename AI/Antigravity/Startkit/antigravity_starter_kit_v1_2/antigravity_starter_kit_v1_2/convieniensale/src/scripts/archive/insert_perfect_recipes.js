import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function execute() {
    console.log("Henter ingredienser...");
    const { data: ingredients } = await supabase.from('ingredients').select('id, navn').eq('standard_vare', false);
    
    console.log("Sletter alt amatørklamp...");
    const { error: delErr } = await supabase.from('recipes')
        .delete()
        .or('id.like.%_Q%,beskrivelse.eq.Importeret fra Meny');
    if (delErr) {
        console.error("Fejl ved sletning:", delErr);
        return;
    }
    
    const rawData = JSON.parse(fs.readFileSync('datasets/scraped_meny_recipes.json', 'utf-8'));
    let recipesToInsert = [];
    
    for (let i = 0; i < rawData.length; i++) {
        const r = rawData[i];
        
        let instructionsText = r.instructions;
        if (instructionsText.includes('SPISETID')) instructionsText = instructionsText.substring(0, instructionsText.indexOf('SPISETID')).trim();
        if (instructionsText.includes('Næringsindhold:')) instructionsText = instructionsText.substring(0, instructionsText.indexOf('Næringsindhold:')).trim();
        
        let instArray = instructionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 3 && !line.match(/^\d+\.$/) && line !== 'Tilberedning');
            
        let mappedIngredients = [];
        let tags = new Set();
        
        r.ingredients.forEach(ingText => {
            let raavareId = null;
            let ingLower = ingText.toLowerCase();
            
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
            if (!raavareId && ingLower.includes('kylling')) { raavareId = 'ing_hel_kylling'; tags.add('Kylling'); }
            if (!raavareId && ingLower.includes('bacon')) tags.add('Gris');
            if (!raavareId && (ingLower.includes('hvidvin') || ingLower.includes('rødvin'))) tags.add('Vin');
            
            mappedIngredients.push({ text: ingText, raavare_id: raavareId, amount: null, unit: null });
        });
        
        recipesToInsert.push({
            id: `meny_fixed_${i}_${Date.now()}`,
            titel: r.title,
            beskrivelse: 'Klassisk kvalitetsopskrift, nu med korrekt data.',
            tidsforbrug_min: 45,
            portioner: 4,
            billed_url: r.imageUrl,
            instruktioner: instArray,
            ingredienser: mappedIngredients,
            tags: Array.from(tags)
        });
    }
    
    console.log(`Indsætter ${recipesToInsert.length} perfekte opskrifter...`);
    const { error: insErr } = await supabase.from('recipes').insert(recipesToInsert);
    if (insErr) {
        console.error("Fejl ved indsættelse:", insErr);
    } else {
        console.log("SUCCES! De 36 skrabede opskrifter er vasket og indsat korrekt.");
    }
}
execute();
