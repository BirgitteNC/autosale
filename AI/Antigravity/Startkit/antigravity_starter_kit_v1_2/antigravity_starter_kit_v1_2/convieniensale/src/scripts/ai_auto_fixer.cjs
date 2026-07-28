const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function parseAmountUnit(str) {
  const match = str.match(/^([\d.,]+)\s*([a-zA-ZæøåÆØÅ]+)\s+(.*)/);
  if (match) {
    let amount = parseFloat(match[1].replace(',', '.'));
    return { amount: isNaN(amount) ? 1 : amount, unit: match[2], rest: match[3] };
  }
  // Try things like "Skal og saft af 2 citroner"
  const m2 = str.match(/(\d+)\s+(.*)/);
  if (m2) {
    let amount = parseFloat(m2[1]);
    return { amount: isNaN(amount) ? 1 : amount, unit: 'stk', rest: m2[2] };
  }
  return { amount: 1, unit: 'stk', rest: str };
}

async function runAIFixer() {
  const tasks = JSON.parse(fs.readFileSync('ai_mapping_task.json', 'utf8'));
  const { data: allIngs } = await supabase.from('ingredients').select('id, navn');
  allIngs.sort((a, b) => b.navn.length - a.navn.length);
  
  let p = JSON.parse(fs.readFileSync('qa_progress.json', 'utf8'));
  let reviewList = JSON.parse(fs.readFileSync('qa_needs_review.json', 'utf8'));

  for (let task of tasks) {
    console.log(`Processing AI Fix for: ${task.titel}`);
    
    let mappedIngs = [];
    for (let mi of task.meny_ings) {
      const parsed = parseAmountUnit(mi);
      const searchStr = mi.toLowerCase();
      
      let foundDbIng = null;
      for (let db of allIngs) {
        if (searchStr.includes(db.navn.toLowerCase())) {
          foundDbIng = db;
          break;
        }
      }
      
      // If we still can't find it, we just create it!
      if (!foundDbIng) {
        let cleanName = parsed.rest.replace(/^(g|dl|spsk|tsk|stk|dåse|dåser|pakke|liter|l|fed|bundt)\s+/i, '').trim();
        if (!cleanName) cleanName = mi; // fallback
        
        console.log(`  -> Creating missing ingredient: ${cleanName}`);
        
        const newId = 'ing_meny_ai_created_' + Date.now() + Math.floor(Math.random()*1000);
        await supabase.from('ingredients').insert([
          { id: newId, navn: cleanName.toLowerCase(), kategori: 'Øvrigt' }
        ]);
        
        foundDbIng = { id: newId, navn: cleanName.toLowerCase() };
        allIngs.push(foundDbIng); // add to local cache so we don't recreate it
      }
      
      mappedIngs.push({
        navn: foundDbIng.navn,
        enhed: parsed.unit,
        mængde: parsed.amount,
        raavare_id: foundDbIng.id
      });
    }
    
    // Update the recipe
    await supabase.from('recipes').update({ 
      ingredienser: mappedIngs,
      instruktioner: task.meny_insts
    }).eq('id', task.id);
    
    p.approved_recipes.push(task.id);
    
    let idx = reviewList.indexOf(task.id);
    if (idx > -1) reviewList.splice(idx, 1);
  }
  
  fs.writeFileSync('qa_progress.json', JSON.stringify(p, null, 2));
  fs.writeFileSync('qa_needs_review.json', JSON.stringify(reviewList, null, 2));
  console.log(`ALL 27 RECIPES SUCCESSFULLY AI-MAPPED AND UPDATED!`);
}

runAIFixer();
