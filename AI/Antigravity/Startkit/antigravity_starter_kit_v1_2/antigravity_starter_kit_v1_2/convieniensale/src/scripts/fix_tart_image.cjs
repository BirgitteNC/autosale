require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Opdaterer manglende tærte-billede...");
    // Et lækkert billede af en spinattærte / madtærte fra Unsplash
    const nyUrl = 'https://images.unsplash.com/photo-1542288998-0c64c7cc4e87?w=800&auto=format&fit=crop&q=60';
    
    const { error } = await supabase
        .from('recipes')
        .update({ billed_url: nyUrl })
        .eq('id', 'meny_1781947919149');
        
    if (error) {
        console.error("Fejl:", error.message);
    } else {
        console.log("✅ Tærtebilledet blev succesfuldt opdateret!");
    }
}

run();
