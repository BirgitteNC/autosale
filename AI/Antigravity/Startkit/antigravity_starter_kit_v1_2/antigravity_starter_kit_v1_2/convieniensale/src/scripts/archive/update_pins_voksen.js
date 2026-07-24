import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateOldPins() {
  console.log("Opdaterer alle eksisterende PIN-koder til 'Voksen'...");
  const { data: pins, error: fetchErr } = await supabase.from('store_pins').select('*');
  if (fetchErr) {
    console.error("Fejl ved hentning:", fetchErr);
    return;
  }
  
  let updatedCount = 0;
  for (let pin of pins) {
    if (!pin.description || (!pin.description.startsWith('[Voksen]') && !pin.description.startsWith('[Ungarbejder]'))) {
      const newDesc = `[Voksen] ${pin.description || 'Ingen beskrivelse'}`;
      await supabase.from('store_pins').update({ description: newDesc }).eq('id', pin.id);
      updatedCount++;
    }
  }
  console.log(`Færdig! Satte ${updatedCount} PIN koder til Voksen.`);
}

updateOldPins();
