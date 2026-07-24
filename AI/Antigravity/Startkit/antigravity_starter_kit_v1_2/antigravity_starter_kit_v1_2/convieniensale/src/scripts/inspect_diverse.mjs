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
    .select('id, navn')
    .eq('kategori', 'diverse');
    
  if (error) {
    console.error(error);
  } else {
    console.log(`Fandt ${data.length} ingredienser i 'diverse'.`);
    const names = data.map(d => d.navn);
    console.log(JSON.stringify(names, null, 2));
  }
}

run();
