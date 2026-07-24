import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function exportIngs() {
    const { data: ings } = await supabase.from('ingredients').select('id, navn');
    
    let out = "const ingMap = {\n";
    ings.forEach(i => {
        // Create safe key
        let key = i.navn.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        out += `  '${key}': '${i.id}', // ${i.navn}\n`;
    });
    out += "};\n";
    
    fs.writeFileSync('scripts/ing_map.js', out);
    console.log("Mapped", ings.length, "ingredients");
}
exportIngs();
