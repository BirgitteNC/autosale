import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const titleReplacements = {
  "Mormors klassiske frikadeller": "Frikadeller",
  "Børnevenlige kyllingedeller med revet grønt": "Kyllingedeller",
  "Hurtig spaghetti bolognese": "Spaghetti Bolognese",
  "Luksus stjerneskud": "Stjerneskud",
  "Gammeldags flæskestegssandwich": "Flæskestegssandwich",
  "Klassiske Fiskefrikadeller": "Fiskefrikadeller",
  "Frikadeller af svinekød": "Frikadeller",
  "Kyllingedeller": "Kyllingedeller"
};

async function runUpdate() {
  console.log("Starter endelig rengøring af titler og 'efter behov'...");
  
  const { data: recipes } = await supabase.from('recipes').select('*');
  let updatedCount = 0;

  for (let recipe of recipes) {
    let needsUpdate = false;
    let newTitle = recipe.titel;
    
    // Fjern tillægsord fra titler
    for (const [oldTitle, cleanTitle] of Object.entries(titleReplacements)) {
      if (recipe.titel === oldTitle || recipe.titel.includes(oldTitle)) {
        newTitle = cleanTitle;
        needsUpdate = true;
        break;
      }
    }
    
    // Tjek om der er andre adjektiver, vi bare skal fjerne
    if (newTitle.toLowerCase().includes("luksus ")) { newTitle = newTitle.replace(/luksus /ig, ""); needsUpdate = true; }
    if (newTitle.toLowerCase().includes("klassiske ")) { newTitle = newTitle.replace(/klassiske /ig, ""); needsUpdate = true; }
    if (newTitle.toLowerCase().includes("hurtig ")) { newTitle = newTitle.replace(/hurtig /ig, ""); needsUpdate = true; }
    if (newTitle.toLowerCase().includes("mormors ")) { newTitle = newTitle.replace(/mormors /ig, ""); needsUpdate = true; }
    if (newTitle.toLowerCase().includes("gammeldags ")) { newTitle = newTitle.replace(/gammeldags /ig, ""); needsUpdate = true; }
    if (newTitle.toLowerCase().includes("børnevenlige ")) { newTitle = newTitle.replace(/børnevenlige /ig, ""); needsUpdate = true; }

    newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);

    // Erstat 'Efter behov' med faste mængder
    let newIngredients = [...(recipe.ingredienser || [])];
    newIngredients = newIngredients.map(ing => {
      if (ing.maengde && ing.maengde.toLowerCase().includes('efter behov')) {
        needsUpdate = true;
        return { ...ing, maengde: '2 knivspids' };
      }
      return ing;
    });

    if (needsUpdate || newTitle !== recipe.titel) {
      console.log(`Opdaterer: ${recipe.titel} -> ${newTitle}`);
      await supabase.from('recipes').update({
        titel: newTitle,
        ingredienser: newIngredients
      }).eq('id', recipe.id);
      updatedCount++;
    }
  }

  console.log(`Færdig! Opdaterede ${updatedCount} opskrifter.`);
}

runUpdate();
