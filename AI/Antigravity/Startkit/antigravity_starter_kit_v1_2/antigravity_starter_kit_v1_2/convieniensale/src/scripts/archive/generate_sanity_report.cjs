require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: recipes } = await supabase.from('recipes').select('titel, billed_url, ingredienser').order('titel');
    
    let md = `# Opskrifts-Sanity Check (Alle Opskrifter)\n\nHerunder findes en komplet liste af alle ${recipes.length} opskrifter, der nu udgør det rengjorte system.\n\nAlle dummy-opskrifter (med Unsplash-billeder og falske "Variant"-navne) er blevet slettet fra databasen. Opskrifterne herunder burde alle være de 100% ægte opskrifter med deres rigtige billeder fra Meny.\n\n`;

    recipes.forEach(r => {
        md += `## ${r.titel}\n\n`;
        md += `![Billede af ${r.titel}](${r.billed_url})\n\n`;
        md += `**Ingredienser:**\n`;
        const ings = r.ingredienser || [];
        ings.forEach(i => {
            md += `- ${i.navn}\n`;
        });
        md += `\n---\n\n`;
    });

    fs.writeFileSync('C:/Users/birgi/.gemini/antigravity/brain/022f7582-d5ab-4f47-8508-71d318cfff35/sanity_report.md', md);
    console.log('Sanity report genereret.');
}

run();
