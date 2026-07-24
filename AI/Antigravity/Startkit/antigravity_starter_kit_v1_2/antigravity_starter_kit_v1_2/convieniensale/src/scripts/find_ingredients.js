import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMatches() {
    const searchTerms = [
        "hvidløg", "løg", "chili", "bacontern", "hakket oksekød", "koriander", 
        "spidskommen", "paprika", "røget paprika", "kanel", "tomatpuré", 
        "flået tomat", "oksebouillon", "kidneybønner", "mørk chokolade", "salt", "peber"
    ];

    console.log("Søger efter råvare-ID'er...");
    const { data: rawMaterials } = await supabase.from('raw_materials').select('id, name');

    for (let term of searchTerms) {
        const matches = rawMaterials.filter(r => r.name.toLowerCase().includes(term.toLowerCase()));
        if (matches.length > 0) {
            console.log(`\nMatch for '${term}':`);
            matches.slice(0, 3).forEach(m => console.log(` - ${m.name} (${m.id})`));
        } else {
            console.log(`\nIngen match for '${term}'. Vi kan bruge en autogenereret id.`);
        }
    }
}
findMatches().catch(console.error);
