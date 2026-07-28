const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanSlug(title) {
  let slug = title.toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return slug;
}

function parseAmountUnit(str) {
  // Very basic parser for "150 g sorte oliven", "1 pakke tærtedej"
  const match = str.match(/^([\d.,]+)\s*([a-zA-Z]+)\s+(.*)/);
  if (match) {
    let amount = parseFloat(match[1].replace(',', '.'));
    return { amount: isNaN(amount) ? 1 : amount, unit: match[2], rest: match[3] };
  }
  return { amount: 1, unit: 'stk', rest: str };
}

async function runAutoScraper() {
  const progressPath = 'qa_progress.json';
  if (!fs.existsSync(progressPath)) {
    fs.writeFileSync(progressPath, JSON.stringify({ current_index: 0, total_recipes: 190, approved_recipes: [] }));
  }
  let progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));

  const reviewPath = 'qa_needs_review.json';
  let reviewList = fs.existsSync(reviewPath) ? JSON.parse(fs.readFileSync(reviewPath, 'utf8')) : [];

  const { data: allIngs } = await supabase.from('ingredients').select('id, navn');
  
  // Sort by length descending for longest-match-first
  allIngs.sort((a, b) => b.navn.length - a.navn.length);

  const { data: recipes } = await supabase.from('recipes').select('*').order('id');
  const pending = recipes.filter(r => !progress.approved_recipes.includes(r.id) && !reviewList.includes(r.id));
  
  console.log(`Starting auto-scraper. ${pending.length} recipes remaining.`);
  
  // Process all remaining
  for (let recipe of pending) {
    console.log(`\nProcessing: ${recipe.titel}`);
    
    // Add small delay to avoid rate limit
    await new Promise(r => setTimeout(r, 200));
    
    // 1. Get exact URL from billed_url instead of guessing from title
    let slug = '';
    const slugMatch = recipe.billed_url.match(/dagrofa-dk\/([^/]+)\//);
    if (slugMatch) {
      slug = slugMatch[1];
    } else {
      slug = cleanSlug(recipe.titel);
    }
    let url = `https://meny.dk/opskrift/${slug}`;
    
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        // Try fallback with id if possible? Or just flag it
        console.log(`  -> 404 Not Found at ${url}`);
        reviewList.push(recipe.id);
        continue;
      }
      
      const html = await res.text();
      const scriptRegex = /<script[^>]*>(.*?)<\/script>/gs;
      let match;
      let jsonLd = null;
      while ((match = scriptRegex.exec(html)) !== null) {
        if (match[1].includes('"@type"') && match[1].includes('"Recipe"')) {
          try {
            const data = JSON.parse(match[1]);
            jsonLd = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
          } catch(e) {}
        }
      }
      
      if (!jsonLd || !jsonLd.recipeIngredient) {
        console.log(`  -> Failed to parse JSON-LD`);
        reviewList.push(recipe.id);
        continue;
      }
      
      // We have Meny.dk truth!
      const menyIngs = jsonLd.recipeIngredient; // Array of strings
      const menyInstNode = jsonLd.recipeInstructions; // Array of objects
      let newInst = [];
      if (Array.isArray(menyInstNode)) {
        if (menyInstNode[0]['@type'] === 'HowToSection') {
           newInst = menyInstNode[0].itemListElement.map(s => s.text);
        } else {
           newInst = menyInstNode.map(s => s.text);
        }
      }
      
      // Match ingredients
      let mappedIngs = [];
      let success = true;
      let unresolved = [];
      
      for (let mi of menyIngs) {
        const parsed = parseAmountUnit(mi);
        const searchStr = mi.toLowerCase();
        
        let foundDbIng = null;
        for (let db of allIngs) {
          if (searchStr.includes(db.navn.toLowerCase())) {
            foundDbIng = db;
            break; // found longest match
          }
        }
        
        if (foundDbIng) {
          mappedIngs.push({
            navn: foundDbIng.navn,
            enhed: parsed.unit,
            mængde: parsed.amount,
            raavare_id: foundDbIng.id
          });
        } else {
          success = false;
          unresolved.push(mi);
        }
      }
      
      if (!success) {
        console.log(`  -> FLAGGED: Could not map ingredients:`, unresolved);
        reviewList.push(recipe.id);
      } else {
        // Update DB!
        let tidsforbrug = recipe.tidsforbrug_min; // keep original unless parseable
        
        await supabaseAdmin.from('recipes').update({
           ingredienser: mappedIngs,
           instruktioner: newInst,
           portioner: jsonLd.recipeYield ? parseInt(jsonLd.recipeYield) : recipe.portioner
        }).eq('id', recipe.id);
        
        console.log(`  -> SUCCESS: Perfectly mapped and updated!`);
        progress.approved_recipes.push(recipe.id);
      }
      
    } catch(e) {
      console.log(`  -> ERROR: ${e.message}`);
      reviewList.push(recipe.id);
    }
  }
  
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  fs.writeFileSync(reviewPath, JSON.stringify(reviewList, null, 2));
  console.log('\nBatch complete. Run again for next batch.');
}

runAutoScraper();
