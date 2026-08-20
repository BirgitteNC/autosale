require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Kun kategorier der er relevante for matching-algoritmen
const RELEVANTE_KATEGORIER = new Set([
  'Grønt','Frugt/Grønt','Slagter','Kød','Fisk','Fiskeafdeling',
  'Mejeri','Mælk og mejeriprodukter','Kolonial','Basisvarer',
]);

// Generiske enkeltord der er for korte/brede til at matche på
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

function instrTekst(instruktioner) {
  if (Array.isArray(instruktioner)) return norm(instruktioner.join(' '));
  if (typeof instruktioner === 'string') return norm(instruktioner);
  if (instruktioner && typeof instruktioner === 'object') return norm(Object.values(instruktioner).join(' '));
  return '';
}

// Tjek om en streng forekommer som helt ord (word-boundary) i teksten
function erHeltOrd(søg, tekst) {
  // Kræv at søgestrengen er omgivet af ikke-bogstav-tegn eller start/slut
  const escaped = søg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`);
  return re.test(tekst);
}

async function run() {
  console.log('Henter data...');
  const [{ data: recipes }, { data: allIngs }] = await Promise.all([
    supabase.from('recipes').select('id,titel,ingredienser,instruktioner,beskrivelse').eq('is_deleted', false),
    supabase.from('ingredients').select('id,navn,kategori'),
  ]);

  const aktive = recipes.filter(r => r.beskrivelse !== 'Importeret fra Meny');
  console.log(`${aktive.length} opskrifter, ${allIngs.length} kendte råvarer\n`);

  // Byg opslag: kun relevante kategorier, navne >= 5 tegn, ikke for generiske
  const ingLookup = allIngs
    .filter(ing => RELEVANTE_KATEGORIER.has(ing.kategori))
    .filter(ing => !IGNORER_NAVNE.has(ing.navn.toLowerCase().trim()))
    .map(ing => ({ ...ing, normNavn: norm(ing.navn) }))
    .filter(ing => ing.normNavn.length >= 5);

  const fund = [];

  for (const r of aktive) {
    const tekst = instrTekst(r.instruktioner);
    if (!tekst || tekst.length < 20) continue;

    const recipeIngIds = new Set((r.ingredienser || []).map(i => i.raavare_id));
    const recipeIngNormer = new Set((r.ingredienser || []).map(i => norm(i.navn)));

    const mangler = [];

    for (const ing of ingLookup) {
      // Allerede i listen?
      if (recipeIngIds.has(ing.id)) continue;
      if (recipeIngNormer.has(ing.normNavn)) continue;

      // Er ingrediensnavnet (som helt ord) nævnt i instruktionerne?
      if (!erHeltOrd(ing.normNavn, tekst)) continue;

      // Undgå at en kortere ingrediens skjuler en længere (f.eks. "rejer" vs "kæmperejer")
      mangler.push(ing);
    }

    // Fjern dobbelte: hvis 2 ingredienser begge matcher, og den ene er del af den anden — behold kun den specifikke
    const unikke = mangler.filter((ing, _, arr) => {
      return !arr.some(other =>
        other.id !== ing.id &&
        other.normNavn.length > ing.normNavn.length &&
        other.normNavn.includes(ing.normNavn)
      );
    });

    if (unikke.length > 0) {
      fund.push({ r, unikke, tekst });
    }
  }

  fund.sort((a, b) => b.unikke.length - a.unikke.length);

  console.log(`══════════════════════════════════════════════════════`);
  console.log(`INGREDIENSER NÆVNT I VEJLEDNING MEN MANGLER I LISTEN`);
  console.log(`══════════════════════════════════════════════════════\n`);

  let totalMangler = 0;
  for (const { r, unikke, tekst } of fund) {
    console.log(`⚠️  ${r.titel}`);
    console.log(`   ID: ${r.id}`);
    for (const ing of unikke) {
      const idx = tekst.indexOf(ing.normNavn);
      const ctx = idx >= 0
        ? '…' + tekst.slice(Math.max(0, idx - 20), idx + ing.normNavn.length + 30) + '…'
        : '';
      console.log(`   + "${ing.navn}" [${ing.kategori}]`);
      if (ctx) console.log(`     Kontekst: ${ctx}`);
      totalMangler++;
    }
    console.log();
  }

  console.log(`══════════════════════════════════════════════════════`);
  console.log(`${fund.length} opskrifter med mulige manglende ingredienser (${totalMangler} ingredienser i alt)`);
}

run().catch(e => { console.error(e); process.exit(1); });
