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
    { navn: "hvidløg", enhed: "fed", mængde: 1, raavare_id: "ing_extra_11" },
    { navn: "løg", enhed: "stk", mængde: 1, raavare_id: "ing_loeg" },
    { navn: "rød chilipeber", enhed: "stk", mængde: 0.5, raavare_id: "ing_frisk_chili" },
    { navn: "bacontern", enhed: "g", mængde: 150, raavare_id: "ing_bacon" },
    { navn: "hakket oksekød (ca. 6% fedt)", enhed: "g", mængde: 500, raavare_id: "ing_extra_20" },
    { navn: "stødt koriander", enhed: "tsk", mængde: 2, raavare_id: "ing_meny_auto_koriander" },
    { navn: "stødt spidskommen", enhed: "spsk", mængde: 2, raavare_id: "ing_meny_auto_spidskommen" },
    { navn: "paprika", enhed: "tsk", mængde: 2, raavare_id: "ing_meny_auto_paprika" },
    { navn: "røget paprika", enhed: "tsk", mængde: 1, raavare_id: "ing_meny_auto_roegpaprika" },
    { navn: "kanelstænger", enhed: "stk", mængde: 2, raavare_id: "ing_meny_auto_kanelstang" },
    { navn: "koncentreret tomatpuré", enhed: "dåse", mængde: 1, raavare_id: "ing_tomatpure" },
    { navn: "flået tomat", enhed: "dåse", mængde: 1, raavare_id: "ing_tomatsovs" },
    { navn: "oksebouillon (1 terning)", enhed: "dl", mængde: 1, raavare_id: "ing_bouillon" },
    { navn: "kidneybønner", enhed: "dåse", mængde: 2, raavare_id: "ing_kidneyboenner" },
    { navn: "mørk chokolade (ca. 70% kakao)", enhed: "g", mængde: 20, raavare_id: "ing_meny_auto_chokolade" },
    { navn: "salt & sort peber", enhed: "smag", mængde: 0, raavare_id: "ing_extra_43" }
  ];

  const instruktioner = [
    "Skær løg i tern og hak hvidløg fint.",
    "Flæk chilien og fjern kernerne.",
    "Hak chilien fint.",
    "Brun bacon og tilsæt hakket oksekød.",
    "Når kødet bruner tilsættes løg, som steges med i 5 min.",
    "Tilsæt hvidløg, chili og tørrede krydderier.",
    "Kom tomatpuré i og steg det et minut, før flåede tomater, oksebouillon og bønner tilsættes.",
    "Lad retten simre i 25 min.",
    "Tilsæt til sidst chokolade og smag til med salt og sort peber."
  ];

  const tags = ["Gryderet", "Okse", "Hovedret", "Allergen: Selleri (bouillon)", "Allergen: Soja/Mælk (chokolade)"];

  const payload = {
      ingredienser: newIngredients,
      instruktioner: instruktioner,
      tags: tags,
      portioner: 6,
      kalorier_per_300g: 315,
      protein_per_300g: 28,
      tidsforbrug_min: 40
  };

  const { error } = await supabase.from('recipes').update(payload).eq('id', recipeId);

  if (error) {
    console.error('Fejl ved opdatering af Chili con carne:', error);
  } else {
    console.log('Chili con carne blev succesfuldt opdateret med det FULDE datasæt!');
  }
}

run().catch(console.error);
