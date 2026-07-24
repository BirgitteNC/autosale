import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const recipeId = 'meny_Q2hpbGkgY29uIGN';
  
  const newIngredients = [
    { navn: "Hakket oksekød (8-14%)", enhed: "g", mængde: 500, raavare_id: "ing_extra_20" },
    { navn: "Løg", enhed: "stk", mængde: 1, raavare_id: "ing_loeg" },
    { navn: "Hvidløg", enhed: "fed", mængde: 1, raavare_id: "ing_extra_11" },
    { navn: "Hakkede tomater", enhed: "g", mængde: 400, raavare_id: "ing_tomatsovs" },
    { navn: "Frisk chili", enhed: "stk", mængde: 0.5, raavare_id: "ing_frisk_chili" },
    { navn: "Bacon i tern", enhed: "g", mængde: 150, raavare_id: "ing_bacon" },
    { navn: "Salt & Sort Peber", enhed: "smag", mængde: 0, raavare_id: "ing_extra_43" }
  ];

  const { error } = await supabase.from('recipes').update({ 
      ingredienser: newIngredients,
      portioner: 6
  }).eq('id', recipeId);

  if (error) {
    console.error('Fejl ved opdatering af Chili con carne:', error);
  } else {
    console.log('Chili con carne blev succesfuldt opdateret!');
    
    // Verifikation (Rule 7)
    const { data } = await supabase.from('recipes').select('titel, portioner, ingredienser').eq('id', recipeId).single();
    console.log(`\nVerifikation af: ${data.titel} (${data.portioner} personer)`);
    data.ingredienser.forEach(ing => {
        console.log(` - ${ing.mængde} ${ing.enhed} ${ing.navn}`);
    });
  }
}

run().catch(console.error);
