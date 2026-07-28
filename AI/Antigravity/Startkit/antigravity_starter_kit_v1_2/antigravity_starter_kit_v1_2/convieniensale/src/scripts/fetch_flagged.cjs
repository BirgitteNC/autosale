const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanSlug(title) {
  return title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function fetchReviewTarget() {
  const reviewList = JSON.parse(fs.readFileSync('qa_needs_review.json', 'utf8'));
  if (reviewList.length === 0) return console.log('All done!');
  
  const targetId = reviewList[0];
  const { data: recipe } = await supabase.from('recipes').select('*').eq('id', targetId).single();
  const { data: ingredients } = await supabase.from('ingredients').select('id, navn, kategori');
  
  console.log('--- REVIEW TARGET: ' + recipe.titel + ' ---');
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
  const slugMatch = recipe.billed_url.match(/dagrofa-dk\/([^/]+)\//);
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
fetchReviewTarget();
