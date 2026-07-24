import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: allRecipes } = await supabase.from('recipes').select('id, titel, beskrivelse, tags');
    
    const curated = allRecipes.filter(r => r.id.startsWith('meny_') && !r.id.includes('_Q')); // 'Q29x...' is base64
    const scraped = allRecipes.filter(r => r.id.includes('_Q'));
    
    console.log(`Total recipes: ${allRecipes.length}`);
    console.log(`Curated (nice IDs): ${curated.length}`);
    console.log(`Scraped (base64 IDs): ${scraped.length}`);
    
    // Check if any scraped recipes were actually curated by Sussie (e.g., have tags, or missing 'Importeret')
    const scrapedModified = scraped.filter(r => r.tags && r.tags.length > 0 || r.beskrivelse !== 'Importeret fra Meny');
    console.log(`Scraped but modified by Sussie: ${scrapedModified.length}`);
    
    // Check ingredient coverage for the 65 curated recipes
    const { data: ingredients } = await supabase.from('ingredients').select('id, navn').eq('standard_vare', false);
    console.log(`Total focus ingredients: ${ingredients.length}`);
    
    const { data: curatedRecipesData } = await supabase.from('recipes').select('ingredienser').neq('beskrivelse', 'Importeret fra Meny');
    
    let coveredIds = new Set();
    curatedRecipesData.forEach(r => {
        if(r.ingredienser) {
            r.ingredienser.forEach(ing => {
                if(ing.raavare_id) coveredIds.add(ing.raavare_id);
            });
        }
    });
    
    let uncovered = ingredients.filter(i => !coveredIds.has(i.id));
    console.log(`Ingredients without ANY curated recipe: ${uncovered.length}`);
    if (uncovered.length > 0) {
        console.log("Some uncovered ingredients:", uncovered.slice(0, 5).map(i => i.navn));
    }
}
check();
