require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RELEVANTE_KATEGORIER = new Set([
  'Grønt','Frugt/Grønt','Slagter','Kød','Fisk','Fiskeafdeling',
  'Mejeri','Mælk og mejeriprodukter','Kolonial','Basisvarer',
]);

const IGNORER_NAVNE = new Set([
  'dild','salt','peber','sukker','vand','olie','smør','mel','æg','mælk',
  'fløde','løg','hvidløg','tomat','citron','lime','ost','æble','pære',
  'fisk','kød','kylling','svin','laks','ris','pasta','kartofler','gulerod',
]);

function norm(s) {
  return (s || '').toLowerCase()
    .replace(/æ/g,'ae').replace(/ø/g,'oe').replace(/å/g,'aa')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function instrTekst(i) {
  if (Array.isArray(i)) return norm(i.join(' '));
  if (typeof i === 'string') return norm(i);
  if (i && typeof i === 'object') return norm(Object.values(i).join(' '));
  return '';
}
function erHeltOrd(søg, tekst) {
  const escaped = søg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`).test(tekst);
}

async function run() {
  console.log('Henter data...');
  const [{ data: recipes }, { data: allIngs }] = await Promise.all([
    supabase.from('recipes').select('id,titel,ingredienser,instruktioner,beskrivelse').eq('is_deleted', false),
    supabase.from('ingredients').select('id,navn,kategori'),
  ]);

  const aktive = recipes.filter(r => r.beskrivelse !== 'Importeret fra Meny');
  console.log(`${aktive.length} opskrifter, ${allIngs.length} kendte råvarer\n`);

  const ingLookup = allIngs
    .filter(ing => RELEVANTE_KATEGORIER.has(ing.kategori))
    .filter(ing => !IGNORER_NAVNE.has(ing.navn.toLowerCase().trim()))
    .map(ing => ({ ...ing, normNavn: norm(ing.navn) }))
    .filter(ing => ing.normNavn.length >= 5);

  let totalTilfoejede = 0;
  let opskrifterRettet = 0;

  for (const r of aktive) {
    const tekst = instrTekst(r.instruktioner);
    if (!tekst || tekst.length < 20) continue;

    const recipeIngIds = new Set((r.ingredienser || []).map(i => i.raavare_id));
    const recipeIngNormer = new Set((r.ingredienser || []).map(i => norm(i.navn)));

    const mangler = [];
    for (const ing of ingLookup) {
      if (recipeIngIds.has(ing.id)) continue;
      if (recipeIngNormer.has(ing.normNavn)) continue;
      if (!erHeltOrd(ing.normNavn, tekst)) continue;
      mangler.push(ing);
    }

    // Fjern dobbelte (kortere navn subsumeret af længere)
    const unikke = mangler.filter((ing, _, arr) =>
      !arr.some(other =>
        other.id !== ing.id &&
        other.normNavn.length > ing.normNavn.length &&
        other.normNavn.includes(ing.normNavn)
      )
    );

    if (unikke.length === 0) continue;

    // Tilføj til ingredienslisten
    const nyeIngs = unikke.map(ing => ({
      raavare_id: ing.id,
      navn: ing.navn,
      maengde: null,
      enhed: null,
    }));
    const opdateret = [...(r.ingredienser || []), ...nyeIngs];

    const { error } = await supabase
      .from('recipes')
      .update({ ingredienser: opdateret })
      .eq('id', r.id);

    if (error) {
      console.error(`❌ Fejl ved ${r.titel}: ${error.message}`);
      continue;
    }

    console.log(`✅ ${r.titel}`);
    unikke.forEach(ing => console.log(`   + "${ing.navn}" [${ing.kategori}]`));
    totalTilfoejede += unikke.length;
    opskrifterRettet++;
  }

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`${opskrifterRettet} opskrifter opdateret, ${totalTilfoejede} ingredienser tilføjet`);
}

run().catch(e => { console.error(e); process.exit(1); });
