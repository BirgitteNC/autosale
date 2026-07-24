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
  const { data: ingredients, error } = await supabase.from('ingredients').select('id, navn, kategori');
  if (error) { console.error("Database fejl:", error); return; }

  let dirtyCount = 0;
  for (const ing of ingredients) {
      const name = ing.navn.toLowerCase();
      if (
          name.includes('skiver') || 
          name.includes('tern') || 
          name.includes('håndfuld') || 
          name.includes('evt.') || 
          name.includes('lunken') || 
          name.includes('ekstra') || 
          name.includes('pynt') ||
          name.includes('god ') ||
          name.includes('stilke ') ||
          name.includes('kvist') ||
          name.includes('til ristning') ||
          name.includes('lidt ')
      ) {
          dirtyCount++;
          console.log(`- ${ing.navn} (ID: ${ing.id})`);
      }
  }
  
  console.log(`\nFandt i alt ${dirtyCount} potentielt 'beskidte' ingredienser ud af ${ingredients.length}`);
}

run();
