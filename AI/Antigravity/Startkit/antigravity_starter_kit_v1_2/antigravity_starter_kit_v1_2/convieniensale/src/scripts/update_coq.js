import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const newIngredients = [
    { navn: "salt & sort peber", enhed: "smag", mængde: 0, raavare_id: "ing_extra_43" },
    { navn: "stor kylling", enhed: "stk", mængde: 1, raavare_id: "ing_hel_kylling" },
    { navn: "skalotteløg", enhed: "stk", mængde: 6, raavare_id: "ing_meny_auto_skalotteloeg" },
    { navn: "persillerod", enhed: "stk", mængde: 1, raavare_id: "ing_meny_auto_persillerod" },
    { navn: "gulerødder", enhed: "stk", mængde: 2, raavare_id: "ing_extra_4" },
    { navn: "champignoner", enhed: "g", mængde: 250, raavare_id: "ing_meny_auto_champignon" },
    { navn: "hvidløg", enhed: "fed", mængde: 2, raavare_id: "ing_extra_11" },
    { navn: "bacontern", enhed: "g", mængde: 150, raavare_id: "ing_bacon" },
    { navn: "smør", enhed: "spsk", mængde: 1, raavare_id: "ing_meny_auto_smoer" },
    { navn: "olivenolie", enhed: "spsk", mængde: 1, raavare_id: "ing_extra_12" },
    { navn: "hvedemel", enhed: "spsk", mængde: 2, raavare_id: "ing_meny_auto_hvedemel" },
    { navn: "rødvin, gerne pinot noir", enhed: "flaske", mængde: 1, raavare_id: "ing_meny_auto_roedvin" },
    { navn: "laurbærblad", enhed: "stk", mængde: 1, raavare_id: "ing_extra_37" },
    { navn: "timianblade", enhed: "stk", mængde: 3, raavare_id: "ing_extra_48" },
    { navn: "hønsefond", enhed: "dl", mængde: 4, raavare_id: "ing_meny_auto_hoensefond" },
    { navn: "bredbladet persille til servering", enhed: "bundt", mængde: 1, raavare_id: "ing_extra_25" },
    { navn: "flute (tilbehør)", enhed: "smag", mængde: 0, raavare_id: "ing_meny_auto_flute" },
    { navn: "kogte kartofler eller rodfrugtmos (tilbehør)", enhed: "smag", mængde: 0, raavare_id: "ing_kartoffel" }
  ];

  const instruktioner = [
    "Partér kyllingen i 4 bryststykker, 4 lårstykker og 2 vinger.",
    "Krydr med salt og peber.",
    "Skær løg i både, og skær persillerod og gulerødder i tern eller skiver.",
    "Skær champignon i skiver, og hak hvidløg fint.",
    "Steg bacon sprødt i en gryde.",
    "Tag det op, og læg det til side.",
    "Kom smør og olivenolie i gryden, og brun kyllingen grundigt på alle sider.",
    "Tag den op, og læg den til side.",
    "Kom løg, persillerod, gulerødder og champignon i gryden og steg i 5-7 min., til det begynder at tage farve.",
    "Tilsæt hvidløg det sidste minut.",
    "Drys melet over, og rør rundt.",
    "Hæld vinen i gryden, og rør godt rundt.",
    "Kom laurbærblade og timian i, og kom kylling og bacon tilbage i gryden.",
    "Hæld fond ved, læg låg på, og lad retten simre i 45 min.",
    "Smag til med salt og peber.",
    "Servér med et drys persille."
  ];

  const tags = [
      "Fjerkræ", 
      "Hovedret", 
      "SPISETID opskrift", 
      "Allergen: Gluten (hvedemel)", 
      "Allergen: Mælk/Laktose (smør)", 
      "Allergen: Selleri (hønsefond)", 
      "Allergen: Svovldioxid/Sulfitter (rødvin)"
  ];

  // 132 kcal per 100g = 396 per 300g
  // 9.7g protein per 100g = 29.1 per 300g (afrundet til 29)
  const payload = {
      ingredienser: newIngredients,
      instruktioner: instruktioner,
      tags: tags,
      portioner: 4,
      kalorier_per_300g: 396,
      protein_per_300g: 29,
      tidsforbrug_min: 75 // (forberedelse + 45 min simretid)
  };

  const { error } = await supabase.from('recipes').update(payload).eq('titel', 'Coq au vin');

  if (error) {
    console.error('Fejl ved opdatering af Coq au vin:', error);
  } else {
    console.log('Coq au vin blev succesfuldt opdateret med det FULDE datasæt og allergener!');
  }
}

run().catch(console.error);
