const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanSlug(title) {
  return title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function extractTruth() {
  const reviewList = JSON.parse(fs.readFileSync('qa_needs_review.json', 'utf8'));
  const aiTasks = [];
  
  for (let i = 0; i < reviewList.length; i++) {
    const targetId = reviewList[i];
    const { data: recipe } = await supabase.from('recipes').select('id, titel, billed_url').eq('id', targetId).single();
    
    if (!recipe) continue;
    
    let slug = '';
    const slugMatch = recipe.billed_url ? recipe.billed_url.match(/dagrofa-dk\/([^/]+)\//) : null;
    if (slugMatch) slug = slugMatch[1];
    else slug = cleanSlug(recipe.titel);
    
    try {
      const res = await fetch('https://meny.dk/opskrift/' + slug);
      if (res.status === 404) {
        console.log(`[DELETING 404] ${recipe.titel}`);
        await supabase.from('recipes').update({ is_deleted: true }).eq('id', recipe.id);
      } else {
        const html = await res.text();
        const scriptRegex = /<script[^>]*>(.*?)<\/script>/gs;
        let match;
        let menyIngs = [];
        let menyInsts = [];
        
        while ((match = scriptRegex.exec(html)) !== null) {
          if (match[1].includes('"@type"') && match[1].includes('"Recipe"')) {
            try {
              const data = JSON.parse(match[1]);
              const r = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
              if (r) {
                menyIngs = r.recipeIngredient || [];
                const instNode = r.recipeInstructions;
                if (Array.isArray(instNode)) {
                  if (instNode.length > 0 && instNode[0]['@type'] === 'HowToSection') {
                     menyInsts = instNode[0].itemListElement.map(s => s.text);
                  } else {
                     menyInsts = instNode.map(s => s.text);
                  }
                }
              }
            } catch(e) {}
          }
        }
        
        if (menyIngs.length > 0) {
          aiTasks.push({
            id: recipe.id,
            titel: recipe.titel,
            meny_ings: menyIngs,
            meny_insts: menyInsts
          });
          console.log(`[EXTRACTED] ${recipe.titel} (${menyIngs.length} ingredients)`);
        } else {
          console.log(`[NO INGREDIENTS] ${recipe.titel}`);
          await supabase.from('recipes').update({ is_deleted: true }).eq('id', recipe.id);
        }
      }
    } catch(e) {
      console.log('Fetch error:', e.message);
    }
  }
  
  fs.writeFileSync('ai_mapping_task.json', JSON.stringify(aiTasks, null, 2));
  console.log(`\nDONE! Prepared ${aiTasks.length} recipes for AI mapping.`);
}

extractTruth();
