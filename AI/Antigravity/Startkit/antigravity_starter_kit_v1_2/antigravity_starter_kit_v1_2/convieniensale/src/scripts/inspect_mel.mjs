import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, navn, kategori')
    .ilike('navn', '%mel%');
    
  if (error) {
    console.error(error);
  } else {
    // Filter out false positives like "smelte" or "melon" if needed, but let's see what we have first
    const melIngredients = data.filter(i => 
       i.navn.toLowerCase().includes('mel ') || 
       i.navn.toLowerCase().endsWith('mel') || 
       i.navn.toLowerCase().includes('mel,')
    );
    console.log("Mel ingredienser:");
    console.dir(melIngredients, { depth: null });
    
    // Check available categories just to be sure
    const { data: catData } = await supabase.from('ingredients').select('kategori');
    const uniqueCategories = [...new Set(catData.map(c => c.kategori))];
    console.log("\nAktuelle kategorier i DB:", uniqueCategories);
  }
}

run();
