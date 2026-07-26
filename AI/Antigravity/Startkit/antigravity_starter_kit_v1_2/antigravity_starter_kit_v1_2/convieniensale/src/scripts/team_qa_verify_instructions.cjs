require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanInstructions() {
  console.log('--- START QA VERIFICATION ---');
  console.log('Fetching recipes to clean instructions...');
  const { data: recipes, error } = await supabase.from('recipes').select('id, titel, instruktioner');
  
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  let updatedCount = 0;
  let thaiSaladBefore = null;
  let thaiSaladAfter = null;

  for (const r of recipes) {
    if (!r.instruktioner) continue;
    
    if (r.titel.includes('Thai salat')) {
      thaiSaladBefore = [...r.instruktioner];
    }

    let changed = false;
    const newInstructions = r.instruktioner.filter(line => {
      let trimmed = line.trim();
      
      // Remove step numbers like "1.", "12."
      if (trimmed.match(/^\d+\.$/)) return false;
      
      // Remove specific headers
      if (['Sådan gør du', 'Fremgangsmåde', 'Tilberedning'].includes(trimmed)) return false;
      
      // Remove "Tilberedning af..." lines
      if (trimmed.startsWith('Tilberedning af ')) return false;
      
      // Remove single-word tags (capitalized words with no spaces)
      if (trimmed.match(/^[A-ZÆØÅ][a-zæøåA-ZÆØÅ]+$/)) return false;
      
      return true;
    });

    if (newInstructions.length !== r.instruktioner.length) {
      changed = true;
      await supabase.from('recipes').update({ instruktioner: newInstructions }).eq('id', r.id);
      updatedCount++;
    }

    if (r.titel.includes('Thai salat')) {
      thaiSaladAfter = newInstructions;
    }
  }

  console.log(`Successfully cleaned instructions for ${updatedCount} recipes.`);
  console.log('\n--- VERIFYING THAI SALAD INSTRUCTIONS ---');
  console.log('BEFORE (Length: ' + thaiSaladBefore.length + '):');
  console.log(thaiSaladBefore.join('\n'));
  console.log('\nAFTER (Length: ' + thaiSaladAfter.length + '):');
  console.log(thaiSaladAfter.join('\n'));
  
  if (thaiSaladAfter.length === 7) {
    console.log('\nSUCCESS: Garbage completely removed from Thai salad!');
  } else {
    console.log('\nWARNING: Thai salad has ' + thaiSaladAfter.length + ' lines left.');
  }

  console.log('--- END QA VERIFICATION ---');
}

cleanInstructions();
