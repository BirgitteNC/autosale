require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verify() {
  console.log('--- START QA VERIFICATION ---');
  console.log('Checking recipes with title "Mormors vintertarteletter"...');
  
  const { data, error } = await supabase
    .from('recipes')
    .select('id, titel, instruktioner, ingredienser')
    .ilike('titel', '%tarteletter%');
    
  if (error) {
    console.error('Error fetching recipes:', error);
    process.exit(1);
  }
  
  console.log(`Found ${data.length} recipe(s) for tartlets.`);
  
  if (data.length === 1) {
    console.log('SUCCESS: Only 1 recipe found (duplicates successfully removed).');
    const recipe = data[0];
    
    console.log('\n--- VERIFYING RECIPE INTEGRITY ---');
    console.log(`Title: ${recipe.titel}`);
    
    // Check if it has chicken
    const hasChicken = recipe.ingredienser.some(i => i.navn.toLowerCase().includes('kylling'));
    console.log(`Contains Chicken: ${hasChicken ? 'YES' : 'NO'}`);
    
    // Check if it has tartlets
    const hasTartlets = recipe.ingredienser.some(i => i.navn.toLowerCase().includes('tarteletter'));
    console.log(`Contains Tartlets: ${hasTartlets ? 'YES' : 'NO'}`);
    
    if (hasChicken && hasTartlets && recipe.ingredienser.length > 5) {
       console.log('SUCCESS: The surviving recipe is the fully intact, correct version!');
    } else {
       console.error('FAIL: The surviving recipe seems to be missing core ingredients.');
    }
  } else {
    console.error(`FAIL: Expected 1 recipe, found ${data.length}.`);
  }
  
  console.log('--- END QA VERIFICATION ---');
}

verify();
