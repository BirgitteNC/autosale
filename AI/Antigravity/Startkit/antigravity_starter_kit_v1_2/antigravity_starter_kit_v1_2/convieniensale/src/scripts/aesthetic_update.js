import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL: Manglende Supabase URL eller Service/Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanRecipes() {
  console.log("Starter rensning af opskrifter...");
  
  const { data: recipes, error } = await supabase.from('recipes').select('*');
  if (error) {
    console.error("Fejl ved hentning af opskrifter:", error);
    return;
  }

  let updatedCount = 0;

  for (let recipe of recipes) {
    let needsUpdate = false;
    let newIngredients = [...(recipe.ingredienser || [])];
    
    // 1. Fjern overskydende 'ing_salt' fra Æbleskiver (det var "Ris" der blev mappet til salt)
    if (recipe.titel.toLowerCase().includes('æbleskive')) {
       const initialLen = newIngredients.length;
       // Behold kun én instans af salt
       let saltFound = false;
       newIngredients = newIngredients.filter(ing => {
         if (ing.raavare_id === 'ing_salt') {
           if (!saltFound) {
             saltFound = true;
             return true;
           }
           return false; // Fjern ekstra salt (som oprindeligt var f.eks. ris)
         }
         return true;
       });
       if (newIngredients.length !== initialLen) {
         needsUpdate = true;
       }
    }

    // 2. Fjern scrape fejl i instruktioner
    const badLines = ["kolonial", "kød", "mejeri", "frugt & grønt", "frugt og grønt", "frost", "drikkevarer", "køl", "kager", "søde sager", "brød og kager", "jul", "vinter", "tilbehør"];
    
    let instArray = Array.isArray(recipe.instruktioner) ? recipe.instruktioner : (typeof recipe.instruktioner === 'string' ? recipe.instruktioner.split(/[\n,]+/) : []);
    const initialInstLen = instArray.length;
    
    instArray = instArray.map(i => i.trim()).filter(inst => {
       if (!inst) return false;
       const lower = inst.toLowerCase();
       return !badLines.includes(lower);
    });

    if (instArray.length !== initialInstLen || (typeof recipe.instruktioner === 'string')) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: updateErr } = await supabase.from('recipes').update({
        ingredienser: newIngredients,
        instruktioner: instArray
      }).eq('id', recipe.id);
      
      if (updateErr) {
        console.error(`Kunne ikke opdatere ${recipe.id}:`, updateErr);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Opdatering færdig. Ændrede ${updatedCount} opskrifter.`);
}

cleanRecipes();
