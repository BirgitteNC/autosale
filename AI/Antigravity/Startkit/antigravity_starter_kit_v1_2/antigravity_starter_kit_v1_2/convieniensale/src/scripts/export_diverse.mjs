import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select('id, navn')
    .eq('kategori', 'diverse')
    .order('navn', { ascending: true });
    
  if (error) {
    console.error("Database fejl:", error);
    return;
  }

  let markdown = "# Diverse Kategorien - Til Manuel Gennemgang\n\n";
  markdown += "Skriv din ønskede kategori ud for hver ingrediens. Du kan også angive, hvis navnet skal rettes (f.eks. `[Frugt & Grønt] (ret navn til: timian)`).\n\n";
  
  for (const ing of ingredients) {
      markdown += `- [ ] **${ing.navn}** -> \n`;
  }

  const outputPath = 'C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\diverse_kategori_liste.md';
  fs.writeFileSync(outputPath, markdown);
  
  console.log(`Eksporterede ${ingredients.length} ingredienser til ${outputPath}`);
}

run();
