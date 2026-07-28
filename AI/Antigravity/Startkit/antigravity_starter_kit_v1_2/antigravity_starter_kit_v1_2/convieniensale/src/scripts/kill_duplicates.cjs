const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function killDuplicates() {
  const p = JSON.parse(fs.readFileSync('qa_progress.json', 'utf8'));
  const reviewList = JSON.parse(fs.readFileSync('qa_needs_review.json', 'utf8'));
  
  const { data: recipes } = await supabase.from('recipes').select('id, titel, is_deleted').eq('is_deleted', false);
  
  // Group by title
  const groups = {};
  for (let r of recipes) {
    const t = r.titel.toLowerCase().trim();
    if (!groups[t]) groups[t] = [];
    groups[t].push(r.id);
  }
  
  let deletedCount = 0;
  
  for (let t in groups) {
    if (groups[t].length > 1) {
      // Find one to keep
      let keepId = null;
      // Prefer approved ones
      for (let id of groups[t]) {
        if (p.approved_recipes.includes(id)) {
          keepId = id;
          break;
        }
      }
      // If no approved, keep the first one
      if (!keepId) keepId = groups[t][0];
      
      // Delete the rest
      for (let id of groups[t]) {
        if (id !== keepId) {
          await supabase.from('recipes').update({ is_deleted: true }).eq('id', id);
          deletedCount++;
          
          // Remove from reviewList if it's there
          const idx = reviewList.indexOf(id);
          if (idx > -1) {
            reviewList.splice(idx, 1);
          }
        }
      }
    }
  }
  
  fs.writeFileSync('qa_needs_review.json', JSON.stringify(reviewList, null, 2));
  
  console.log(`--- KILLED ${deletedCount} DUPLICATES ---`);
  console.log(`Remaining in Review List: ${reviewList.length}`);
  
  if (reviewList.length === 0) return console.log('All done!');
  
  const targetId = reviewList[0];
  const { data: recipe } = await supabase.from('recipes').select('*').eq('id', targetId).single();
  const { data: ingredients } = await supabase.from('ingredients').select('id, navn, kategori');
  
  function cleanSlug(title) {
    return title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  console.log('\n--- NEXT REVIEW TARGET: ' + recipe.titel + ' ---');
  console.log('ID:', recipe.id);
  console.log('Image:', recipe.billed_url);
  
  console.log('\n--- CURRENT DB INGREDIENTS ---');
  if (recipe.ingredienser) {
    recipe.ingredienser.forEach(ri => {
      const dbIng = ingredients.find(i => i.id === ri.raavare_id);
      console.log('- ' + (ri.navn || 'UNDEFINED') + ' (' + ri.mængde + ' ' + ri.enhed + ') -> ' + (dbIng ? dbIng.kategori : 'MANGLER!'));
    });
  }
  
  console.log('\n--- FETCHING MENY.DK TRUTH ---');
  let slug = '';
  const slugMatch = recipe.billed_url ? recipe.billed_url.match(/dagrofa-dk\/([^/]+)\//) : null;
  if (slugMatch) slug = slugMatch[1];
  else slug = cleanSlug(recipe.titel);
  
  try {
    const res = await fetch('https://meny.dk/opskrift/' + slug);
    if (res.status === 404) {
      console.log('HTTP 404 NOT FOUND (Opskriften findes ikke på Meny.dk mere)');
    } else {
      const html = await res.text();
      const scriptRegex = /<script[^>]*>(.*?)<\/script>/gs;
      let match;
      let menyIngs = [];
      while ((match = scriptRegex.exec(html)) !== null) {
        if (match[1].includes('"@type"') && match[1].includes('"Recipe"')) {
          try {
            const data = JSON.parse(match[1]);
            const r = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
            if (r) menyIngs = r.recipeIngredient;
          } catch(e) {}
        }
      }
      console.log(menyIngs);
    }
  } catch(e) {
    console.log('Fetch error:', e.message);
  }
}
killDuplicates();
