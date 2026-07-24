const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function performBackup() {
  console.log('🚀 Starter fuld database backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, 'archive', `backup_${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

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

  // Backup Recipes
  console.log('Henter recipes...');
  const recipes = await fetchAll('recipes');
  fs.writeFileSync(path.join(backupDir, 'recipes.json'), JSON.stringify(recipes, null, 2));
  console.log(`✅ Gemte ${recipes.length} recipes.`);

  // Backup Ingredients
  console.log('Henter ingredients...');
  const ingredients = await fetchAll('ingredients');
  fs.writeFileSync(path.join(backupDir, 'ingredients.json'), JSON.stringify(ingredients, null, 2));
  console.log(`✅ Gemte ${ingredients.length} ingredients.`);

  // Backup Active Promotions
  console.log('Henter active_promotions...');
  const promos = await fetchAll('active_promotions');
  fs.writeFileSync(path.join(backupDir, 'active_promotions.json'), JSON.stringify(promos, null, 2));
  console.log(`✅ Gemte ${promos.length} promotions.`);
  console.log(`✅ Gemte ${promos.length} promotions.`);

  console.log(`\n🎉 Backup fuldført! Gemt i mappen: ${backupDir}`);
}

performBackup().catch(console.error);
