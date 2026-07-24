require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

// Clean up keys if they have \r\n explicitly in the string
const url = process.env.VITE_SUPABASE_URL ? process.env.VITE_SUPABASE_URL.replace(/\\r\\n/g, '').trim() : '';
const key = process.env.VITE_SUPABASE_ANON_KEY ? process.env.VITE_SUPABASE_ANON_KEY.replace(/\\r\\n/g, '').trim() : '';

const supabase = createClient(url, key);

async function run() {
  console.log('Starter opskrift-indsættelse...');
  
  // Authenticate to bypass RLS (any authenticated user can insert according to RLS)
  let { data: authData, error: authErr } = await supabase.auth.signUp({
      email: 'admin_demo_22@meny.dk',
      password: 'DemoPassword123!'
  });
  
  if (authErr && authErr.message.includes('already registered')) {
      const loginRes = await supabase.auth.signInWithPassword({
          email: 'admin_demo_22@meny.dk',
          password: 'DemoPassword123!'
      });
      authData = loginRes.data;
      authErr = loginRes.error;
  }
  
  if (authErr) {
      console.error('Kunne ikke godkende bruger:', authErr.message);
      return;
  }
  console.log('Logget ind som authenticated bruger');

  // Find ingredienser
  const searchTerms = [
    'rødspætte', 'rugmel', 'flagesalt', 'sort peber', 'smør', 
    'vindruekerneolie', 'kartofler', 'spidskål', 'persille', 'citron', 'olivenolie'
  ];

  const { data: allIngs } = await supabase.from('ingredients').select('*');
  if (!allIngs) return console.log('Fejl ved hentning af ingredienser');

  const matchedIds = [];
  const unmatched = [];

  for (const term of searchTerms) {
    const match = allIngs.find(i => i.navn.toLowerCase().includes(term.toLowerCase()) || term.toLowerCase().includes(i.navn.toLowerCase()));
    if (match) {
       matchedIds.push({ raavare_id: match.id });
    } else {
       unmatched.push(term);
    }
  }

  console.log('Fundne ingredienser count:', matchedIds.length);
  console.log('Mangler:', unmatched.join(', '));

  // Opret recipe objekt
  const recipeData = {
    titel: "Rugmelstegt rødspætte og varm kålsalat med kartofler og persilledressing",
    beskrivelse: "Importeret manuelt for at sikre persille og kartofler findes sammen. Måltidstype: Hovedret",
    tidsforbrug_min: 45,
    tags: ["Hovedret", "Fisk"],
    billed_url: "https://www.spisetid.dk/wp-content/uploads/2019/10/rugmelstegt-roedspaette-med-varm-kaalsalat.jpg",
    ingredienser: matchedIds,
    instruktioner: `1. Skrub kartoflerne og vend dem med 1 spsk. vindruekerneolie, salt og peber.
2. Kom dem i en stor bradepande med bagepapir og steg dem ved 200°C i 20 min.
3. Skær imens kålen i grove stykker – hvis du bruger rosenkål skal de halveres.
4. Tag kartoflerne ud og vend kålen med dem.
5. Kom det hele tilbage i ovnen i 15 min.
6. Til dressing hakkes persillen fint og blandes med citronsaft-, skal og olivenolie.
7. Smag til med salt og peber og vend dressingen i de varme kartofler og kålen.
8. Til fiskene blandes rugmel med flagesalt og godt med sort peber.
9. Kom det i en dyb tallerken og vend fiskene i blandingen.
10. Varm smør og olie i en eller to pander og steg fiskene gyldne, ca. 5-6 min. pr. side, afhængig af tykkelse.`
  };

  const { data, error } = await supabase.from('recipes').insert([recipeData]).select();
  
  if (error) {
     console.error('Fejl ved indsættelse af opskrift:', error);
  } else {
     console.log('Opskrift indsat med succes!', data[0].id);
  }
}

run();
