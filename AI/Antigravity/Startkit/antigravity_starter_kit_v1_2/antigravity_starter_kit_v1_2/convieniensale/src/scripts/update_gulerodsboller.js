import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const newIngredients = [
    { navn: "gær", enhed: "g", mængde: 50, raavare_id: "ing_meny_auto_gaer" },
    { navn: "kærnemælk", enhed: "liter", mængde: 1, raavare_id: "ing_meny_auto_kaernemaelk" },
    { navn: "gulerødder", enhed: "stk", mængde: 4, raavare_id: "ing_extra_4" },
    { navn: "groft salt", enhed: "spsk", mængde: 1, raavare_id: "ing_extra_43" },
    { navn: "honning", enhed: "spsk", mængde: 1, raavare_id: "ing_meny_auto_honning" },
    { navn: "ristede pinjekerner", enhed: "g", mængde: 35, raavare_id: "ing_meny_auto_pinjekerner" },
    { navn: "revet appelsinskal (usprøjtet)", enhed: "spsk", mængde: 2, raavare_id: "ing_meny_auto_appelsinskal" },
    { navn: "grahamsmel", enhed: "g", mængde: 600, raavare_id: "ing_meny_auto_grahamsmel" },
    { navn: "hvedemel", enhed: "g", mængde: 650, raavare_id: "ing_meny_auto_hvedemel" }
  ];

  const instruktioner = [
    "Der bliver ca. 16-18 boller.",
    "Lun kærnemælken og rør gæren ud.",
    "Rør groftrevne gulerødder og de øvrige ingredienser i dejen - hold lidt af melet tilbage.",
    "Sørg for at dejen ikke bliver for fast.",
    "Lad dejen hæve lunt, tildækket ca. 1 time.",
    "Sæt store spiseskefulde af dejen på plader med bagepapir og lad bollerne efterhæve 8-10 minutter.",
    "Bag bollerne gyldne og sprøde ved 200 grader i 20-25 minutter, og afkøl på en bagerist. Opskrift og styling: Udviklet af Vibeke Lehn."
  ];

  const tags = ["Brød og kager", "Brød og boller", "Allergen: Gluten (hvedemel/grahamsmel)", "Allergen: Mælk/Laktose (kærnemælk)"];

  // 184 kcal per 100g = 552 per 300g
  // 6.2g protein per 100g = 18.6 per 300g (afrundet til 19)
  const payload = {
      ingredienser: newIngredients,
      instruktioner: instruktioner,
      tags: tags,
      portioner: 16, // Opskriften er til ca. 16 stk (selvom der står 2 personer, 16 boller giver mere mening for udregning)
      kalorier_per_300g: 552,
      protein_per_300g: 19,
      tidsforbrug_min: 90 // Inkluderer 1 times hævning og bagning
  };

  const { error } = await supabase.from('recipes').update(payload).eq('titel', 'Gulerodsboller');

  if (error) {
    console.error('Fejl ved opdatering af Gulerodsboller:', error);
  } else {
    console.log('Gulerodsboller blev succesfuldt opdateret med det FULDE datasæt og allergener!');
  }
}

run().catch(console.error);
