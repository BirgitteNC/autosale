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
  const { data: recipe } = await supabase.from('recipes').select('instruktioner').eq('id', 'meny_R3JpbGxldCBtZWR').single();
  console.log("Instructions for medister recipe:");
  console.dir(recipe.instruktioner, { depth: null });
}

run();
