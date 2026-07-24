import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- QA BEVISFØRELSE: DATA ER I DATABASEN ---');
  
  // Tjek is_deleted kolonnen
  const { data: cols, error: err1 } = await supabase.from('recipes').select('is_deleted').limit(1);
  if (err1) {
    console.log('Fejl: is_deleted kolonnen eksisterer ikke! Brugeren skal oprette den.');
  } else {
    console.log('1. Kolonnen "is_deleted" findes i tabellen (Godkendt!)');
  }

  // Tjek Gullasch for at bevise at mængderne er korrekte på menneske-dansk
  const { data: recipes, error: err2 } = await supabase.from('recipes').select('titel, ingredienser').eq('id', 'meny_R3VsbGFzY2ggbWV').limit(1);
  
  if (recipes && recipes.length > 0) {
    console.log(`\n2. Slår opskriften "${recipes[0].titel}" op for at tjekke mængder og danske tegn (æ, ø, å):`);
    
    recipes[0].ingredienser.forEach(ing => {
      console.log(`   - ${ing.mængde} ${ing.enhed} ${ing.navn} (ID: ${ing.raavare_id})`);
    });
  } else {
    console.log('Kunne ikke finde Gullasch!');
  }
}

run();
