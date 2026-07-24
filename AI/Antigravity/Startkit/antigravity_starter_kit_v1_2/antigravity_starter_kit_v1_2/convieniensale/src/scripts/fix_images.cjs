require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imageFixes = {
    'rec_fisk_1': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&auto=format&fit=crop&q=60', // Fries/Potatoes
    'rec_fisk_2': 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&auto=format&fit=crop&q=60', // Burger/Fish
    'rec_fisk_3': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=60', // Seafood cocktail
    'rec_fisk_4': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60', // Asian style food
    'rec_fisk_5': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&auto=format&fit=crop&q=60'  // Pasta
};

async function run() {
    for (const [id, url] of Object.entries(imageFixes)) {
        const { error } = await supabase.from('recipes').update({ billed_url: url }).eq('id', id);
        if (error) console.error(`Fejl ved opdatering af ${id}:`, error.message);
        else console.log(`Opdateret billede for ${id}`);
    }
    console.log("Færdig med at opdatere billeder!");
}

run();
