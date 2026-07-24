require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: recipes } = await supabase.from('recipes').select('id, titel, ingredienser, instruktioner').ilike('titel', '%ovnstegt kylling%');
    const { data: allIngs } = await supabase.from('ingredients').select('id, navn');
    
    for (const r of recipes) {
        console.log("=== " + r.titel + " ===");
        console.log("FØR:", r.ingredienser.map(i => i.navn).join(', '));
        
        const textToSearch = (r.titel + " " + (r.instruktioner ? r.instruktioner.join(' ') : '')).toLowerCase();
        
        const newIngs = [];
        for (const ing of allIngs) {
            const regex = new RegExp(`\\b${ing.navn.toLowerCase()}\\b`, 'i');
            if (regex.test(textToSearch)) {
                newIngs.push(ing.navn);
            }
        }
        console.log("EFTER (kun søgt i titel og instruktioner):", newIngs.join(', '));
    }
}
run();
