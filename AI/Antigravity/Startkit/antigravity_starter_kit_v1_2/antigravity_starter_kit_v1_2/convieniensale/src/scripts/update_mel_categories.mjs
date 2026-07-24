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
  console.log("Opdaterer kategorier for mel-ingredienser...");

  const { data: ingredients, error: fetchError } = await supabase
    .from('ingredients')
    .select('id, navn, kategori')
    .ilike('navn', '%mel%');

  if (fetchError) {
    console.error("Fejl ved hentning:", fetchError);
    return;
  }

  let updateCount = 0;
  for (const ing of ingredients) {
    const nameLower = ing.navn.toLowerCase();
    
    // Vi flytter alt der indeholder "mel", med undtagelse af "karamel", "pomelo" etc.
    // Hvis det reelt er et bageprodukt (som mel eller krymmel)
    if (
        nameLower.includes('hvedemel') || 
        nameLower.includes('kokosmel') ||
        nameLower.includes('mandelmel') ||
        nameLower.includes('ærtemel') ||
        nameLower.includes('majsmel') ||
        nameLower.includes('boghvedemel') ||
        nameLower.includes('krymmel')
    ) {
       if (ing.kategori !== 'Bagning') {
         const { error: updateError } = await supabase
           .from('ingredients')
           .update({ kategori: 'Bagning' })
           .eq('id', ing.id);
           
         if (updateError) {
           console.error(`Kunne ikke opdatere ${ing.navn}:`, updateError);
         } else {
           console.log(`✅ Flyttede "${ing.navn}" fra '${ing.kategori}' til 'Bagning'`);
           updateCount++;
         }
       }
    } else if (nameLower.includes('karamel')) {
       if (ing.kategori !== 'Slik & Snack') {
         const { error: updateError } = await supabase
           .from('ingredients')
           .update({ kategori: 'Slik & Snack' })
           .eq('id', ing.id);
         if (!updateError) {
             console.log(`✅ Flyttede "${ing.navn}" fra '${ing.kategori}' til 'Slik & Snack'`);
             updateCount++;
         }
       }
    }
  }

  console.log(`\nFærdig! Flyttede ${updateCount} ingredienser.`);
}

run();
