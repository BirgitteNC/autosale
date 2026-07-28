require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanDatabase() {
  console.log('--- STARTING DATABASE CLEANUP (OPTION 1: TARGETED SAFE DELETION) ---');
  const { data: recipes, error } = await supabase.from('recipes').select('*');
  
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  let totalBrokenImages = 0;
  let totalSingleBlocks = 0;
  let totalTimeMismatches = 0;
  let totalPhantomEggs = 0;
  let totalRedundantChicken = 0;
  let totalUpdated = 0;

  for (const r of recipes) {
    let changed = false;
    let updates = {};

    // 1. Fix Broken Image URLs
    if (r.billed_url && r.billed_url.includes('?preset={preset}')) {
      updates.billed_url = r.billed_url.replace('?preset={preset}', '');
      changed = true;
      totalBrokenImages++;
    }

    // 2. Fix Single Block Instructions
    let currentInstructions = r.instruktioner;
    if (currentInstructions && currentInstructions.length === 1 && currentInstructions[0].length > 100) {
      const rawText = currentInstructions[0];
      // Split by . followed by space or by newlines
      const splitArr = rawText.split(/(?<=\.)\s+|\n+/).map(s => s.trim()).filter(s => s.length > 2);
      if (splitArr.length > 1) {
        updates.instruktioner = splitArr;
        currentInstructions = splitArr;
        changed = true;
        totalSingleBlocks++;
      }
    }

    // 3. Fix Time Mismatch
    const fullText = (currentInstructions || []).join(' ').toLowerCase();
    let maxTimeFound = 0;
    const minMatch = fullText.match(/(\d+)\s*min/g);
    if (minMatch) {
      minMatch.forEach(m => {
        const num = parseInt(m);
        if (num > maxTimeFound) maxTimeFound = num;
      });
    }
    const hourMatch = fullText.match(/(\d+)\s*time/g);
    if (hourMatch) {
      hourMatch.forEach(m => {
        const num = parseInt(m) * 60;
        if (num > maxTimeFound) maxTimeFound = num;
      });
    }
    
    // Add 10 mins prep time to the max time found in text
    if (maxTimeFound > 0 && maxTimeFound > (r.tidsforbrug_min || 0)) {
      updates.tidsforbrug_min = maxTimeFound + 10;
      changed = true;
      totalTimeMismatches++;
    }

    // 4. Safe Phantom Ingredient Removal (Option 1)
    if (r.ingredienser && r.ingredienser.length > 0) {
      let currentIngs = [...r.ingredienser];
      let ingChanged = false;

      // Remove Phantom Eggs
      const hasEggIng = currentIngs.find(i => i.navn && i.navn.toLowerCase().includes('æg'));
      if (hasEggIng) {
        if (!fullText.includes('æg') && !fullText.includes('blomme') && !fullText.includes('hvide')) {
          currentIngs = currentIngs.filter(i => i !== hasEggIng);
          ingChanged = true;
          totalPhantomEggs++;
        }
      }

      // Remove redundant Kyllingebryst if Hel Kylling exists
      const hasWholeChicken = currentIngs.find(i => i.navn && i.navn.toLowerCase().includes('hel kylling'));
      if (hasWholeChicken) {
        const hasBreast = currentIngs.find(i => i.navn && i.navn.toLowerCase().includes('kyllingebryst'));
        if (hasBreast) {
          currentIngs = currentIngs.filter(i => i !== hasBreast);
          ingChanged = true;
          totalRedundantChicken++;
        }
      }

      if (ingChanged) {
        updates.ingredienser = currentIngs;
        changed = true;
      }
    }

    if (changed) {
      await supabase.from('recipes').update(updates).eq('id', r.id);
      totalUpdated++;
    }
  }

  console.log('\n--- CLEANUP RESULTS ---');
  console.log(`Successfully updated ${totalUpdated} recipes.`);
  console.log(`- Fixed broken image URLs: ${totalBrokenImages}`);
  console.log(`- Reformatted block instructions: ${totalSingleBlocks}`);
  console.log(`- Corrected cooking times: ${totalTimeMismatches}`);
  console.log(`- Removed phantom eggs: ${totalPhantomEggs}`);
  console.log(`- Removed redundant chicken breasts: ${totalRedundantChicken}`);
  console.log('--- CLEANUP COMPLETE ---');
}

cleanDatabase();
