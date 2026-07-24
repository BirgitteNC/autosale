const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchAll(table) {
  let allData = [];
  let start = 0;
  const limit = 1000;
  while(true) {
    const { data, error } = await supabase.from(table).select('*').range(start, start + limit - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < limit) break;
    start += limit;
  }
  return allData;
}

async function runDeduplication() {
  console.log('🚀 Starter Deduplikering af Råvarer...');

  // 1. Hent alle råvarer
  const ingredients = await fetchAll('ingredients');
  console.log(`Fandt ${ingredients.length} råvarer i alt.`);

  // 2. Gruppér efter navn
  const groups = {};
  ingredients.forEach(ing => {
    const key = ing.navn.trim().toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(ing);
  });

  const duplicateGroups = Object.values(groups).filter(g => g.length > 1);
  console.log(`Fandt ${duplicateGroups.length} råvarer med kloner.`);

  if (duplicateGroups.length === 0) {
    console.log('✅ Ingen kloner fundet. Systemet er allerede rent.');
    return;
  }

  // 3. Find Master IDs og byg mapping
  const idToMaster = {};
  const idsToDelete = [];
  
  duplicateGroups.forEach(group => {
    // Sorter efter oprettelsesdato (ældste bliver master)
    group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const master = group[0];
    const clones = group.slice(1);
    
    clones.forEach(clone => {
      idToMaster[clone.id] = master.id;
      idsToDelete.push(clone.id);
    });
  });

  console.log(`Klar til at omdirigere ${Object.keys(idToMaster).length} forkerte referencer til deres Master ID.`);
  console.log(`Klar til at slette ${idsToDelete.length} klonede rækker fra databasen.`);

  // 4. Opdater Opskrifter (Recipes)
  console.log('\nHenter og opdaterer recipes...');
  const recipes = await fetchAll('recipes');
  let recipesUpdated = 0;

  for (const recipe of recipes) {
    if (!recipe.ingredienser || !Array.isArray(recipe.ingredienser)) continue;
    
    let needsUpdate = false;
    const updatedIngs = recipe.ingredienser.map(ing => {
      if (ing.raavare_id && idToMaster[ing.raavare_id]) {
        ing.raavare_id = idToMaster[ing.raavare_id];
        needsUpdate = true;
      }
      return ing;
    });

    if (needsUpdate) {
      const { error } = await supabase
        .from('recipes')
        .update({ ingredienser: updatedIngs })
        .eq('id', recipe.id);
      
      if (error) throw error;
      recipesUpdated++;
    }
  }
  console.log(`✅ Opdaterede ${recipesUpdated} opskrifter.`);

  // 5. Opdater Active Promotions
  console.log('\nHenter og opdaterer active_promotions...');
  const promos = await fetchAll('active_promotions');
  let promosUpdated = 0;

  for (const promo of promos) {
    let needsUpdate = false;
    
    const updateArray = (arr) => {
      if (!arr || !Array.isArray(arr)) return arr;
      return arr.map(id => {
        if (idToMaster[id]) {
          needsUpdate = true;
          return idToMaster[id];
        }
        return id;
      });
    };

    const newSelected = updateArray(promo.selected_ingredients);
    const newWaste = updateArray(promo.food_waste_ingredients);

    if (needsUpdate) {
      const { error } = await supabase
        .from('active_promotions')
        .update({
          selected_ingredients: newSelected,
          food_waste_ingredients: newWaste
        })
        .eq('id', promo.id);
        
      if (error) throw error;
      promosUpdated++;
    }
  }
  console.log(`✅ Opdaterede ${promosUpdated} skærm-promotions.`);

  // 6. Slet klonerne!
  console.log('\nSletter kloner fra databasen (dette gøres i batches af 100 for at undgå timeouts)...');
  let deletedCount = 0;
  
  // Batch sletning
  for (let i = 0; i < idsToDelete.length; i += 100) {
    const batch = idsToDelete.slice(i, i + 100);
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .in('id', batch);
      
    if (error) throw error;
    deletedCount += batch.length;
    console.log(`Slettet ${deletedCount} ud af ${idsToDelete.length}...`);
  }

  console.log('\n🎉 DEDUPLIKERING FULDFØRT! Databasen er nu 100% konsistent.');
}

runDeduplication().catch(console.error);
