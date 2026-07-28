const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanSlug(title) {
  return title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function fixImages() {
  const { data: recipes, error } = await supabaseAdmin.from('recipes').select('id, titel, billed_url').eq('is_deleted', false);
  if (error) return console.log('Error fetching recipes:', error);
  
  console.log(`Starting Image QA Crawler for ${recipes.length} recipes...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let recipe of recipes) {
    // delay to prevent rate limit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let slug = '';
    const slugMatch = recipe.billed_url ? recipe.billed_url.match(/dagrofa-dk\/([^/]+)\//) : null;
    if (slugMatch) {
      slug = slugMatch[1];
    } else {
      slug = cleanSlug(recipe.titel);
    }
    
    let url = `https://meny.dk/opskrift/${slug}`;
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        console.log(`[404] Could not find ${recipe.titel} on Meny.dk`);
        failCount++;
        continue;
      }
      
      const html = await res.text();
      const scriptRegex = /<script[^>]*>(.*?)<\/script>/gs;
      let match;
      let newImageUrl = null;
      
      while ((match = scriptRegex.exec(html)) !== null) {
        if (match[1].includes('"@type"') && match[1].includes('"Recipe"')) {
          try {
            const data = JSON.parse(match[1]);
            const r = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
            if (r && r.image) {
              newImageUrl = typeof r.image === 'string' ? r.image : (r.image.url || r.image[0]);
            }
          } catch(e) {}
        }
      }
      
      if (newImageUrl) {
        if (newImageUrl !== recipe.billed_url) {
           await supabaseAdmin.from('recipes').update({ billed_url: newImageUrl }).eq('id', recipe.id);
           console.log(`[UPDATED] ${recipe.titel}`);
        } else {
           console.log(`[OK] ${recipe.titel} (Already correct)`);
        }
        successCount++;
      } else {
        console.log(`[NO IMAGE FOUND] ${recipe.titel}`);
        failCount++;
      }
      
    } catch(e) {
      console.log(`[ERROR] ${recipe.titel}: ${e.message}`);
      failCount++;
    }
  }
  
  console.log(`\nDONE! Successfully verified/updated ${successCount} recipes. Failed on ${failCount}.`);
}

fixImages();
