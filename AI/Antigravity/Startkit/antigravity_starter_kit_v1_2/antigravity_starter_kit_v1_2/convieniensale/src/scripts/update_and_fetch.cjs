const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanSlug(title) {
  return title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function updateAndFetchNext() {
  const reviewList = JSON.parse(fs.readFileSync('qa_needs_review.json', 'utf8'));
  const currentId = reviewList.shift();
  
  // 1. Update the recipe
  const dsPeber = 'ing_meny_auto_fix_peber_' + Date.now();
  const dsFond = 'ing_meny_auto_fix_fond_' + Date.now();
  
  await supabase.from('ingredients').insert([
    { id: dsPeber, navn: 'salt og sort peber', kategori: 'Krydderier' },
    { id: dsFond, navn: 'koncentreret fiskefond, grøntsagsbouillon eller vand', kategori: 'Kolonial' }
  ]);
  
  let newIngs = [
    { navn: 'gulerødder', enhed: 'stk', mængde: 2, raavare_id: 'ing_gulerod' },
    { navn: 'løg', enhed: 'stk', mængde: 4, raavare_id: 'ing_loeg' },
    { navn: 'porre', enhed: 'stk', mængde: 1, raavare_id: 'ing_porre' },
    { navn: 'smør', enhed: 'spsk', mængde: 1, raavare_id: 'ing_meny_auto_82' },
    { navn: 'kartofler', enhed: 'g', mængde: 500, raavare_id: 'ing_kartofler' },
    { navn: 'koncentreret fiskefond, grøntsagsbouillon eller vand', enhed: 'liter', mængde: 1.5, raavare_id: dsFond },
    { navn: 'creme fraiche 38%', enhed: 'g', mængde: 250, raavare_id: 'ing_cremefraiche' },
    { navn: 'salt og sort peber', enhed: 'efter behov', mængde: 0, raavare_id: dsPeber },
    { navn: 'laksefileter uden skind', enhed: 'g', mængde: 250, raavare_id: 'ing_meny_auto_953' }, // from DB laksefileter
    { navn: 'frisk dild', enhed: 'dl', mængde: 1.5, raavare_id: 'ing_meny_auto_457' },
    { navn: 'persille', enhed: 'dl', mængde: 1.5, raavare_id: 'ing_meny_auto_627' },
    { navn: 'friske løvstikkeblade', enhed: 'dl', mængde: 1.5, raavare_id: 'ing_meny_auto_954' }
  ];
  
  await supabase.from('recipes').update({ ingredienser: newIngs }).eq('id', currentId);
  
  // Update progress files
  const p = JSON.parse(fs.readFileSync('qa_progress.json', 'utf8'));
  p.approved_recipes.push(currentId);
  fs.writeFileSync('qa_progress.json', JSON.stringify(p, null, 2));
  fs.writeFileSync('qa_needs_review.json', JSON.stringify(reviewList, null, 2));
  
  console.log('--- UPDATED RECIPE ---');
  
  // 2. Fetch the next target
  if (reviewList.length === 0) return console.log('All done!');
  
  const targetId = reviewList[0];
  const { data: recipe } = await supabase.from('recipes').select('*').eq('id', targetId).single();
  const { data: ingredients } = await supabase.from('ingredients').select('id, navn, kategori');
  
  console.log('\n--- REVIEW TARGET: ' + recipe.titel + ' ---');
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
updateAndFetchNext();
