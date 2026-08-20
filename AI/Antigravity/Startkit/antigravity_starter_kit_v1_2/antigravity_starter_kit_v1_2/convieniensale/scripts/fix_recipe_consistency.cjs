require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STOP_WORDS = new Set([
  'salt','peber','sukker','vand','olie','smaevs','mel','aeg','smag','lidt',
  'efter','behov','og','med','til','paa','fra','den','det','de','en','et',
  'ca','dl','dL','ml','stk','spsk','tsk','fed','nip','handfuld','smaevsneutral',
  'frisk','toerret','revet','hakket','skaaret','kogt','stegt','bagt','blandet',
  'samt','eller','evt','plus','portioner','portion','strimler','skiver','halve',
]);

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function instrTekst(instruktioner) {
  if (Array.isArray(instruktioner)) return norm(instruktioner.join(' '));
  if (typeof instruktioner === 'string') return norm(instruktioner);
  if (instruktioner && typeof instruktioner === 'object') return norm(Object.values(instruktioner).join(' '));
  return '';
}

// Henter meningsfulde tokens fra et ingrediensnavn
function tokens(navn) {
  return norm(navn).split(' ')
    .filter(o => o.length >= 4 && !STOP_WORDS.has(o));
}

// Stamme-match: tjekker om et ord (eller dets præfiks på 4 tegn) findes i teksten
function matchesInText(navn, tekst) {
  const toks = tokens(navn);
  if (toks.length === 0) return true; // kun stopord — ignorer
  return toks.some(tok => {
    if (tekst.includes(tok)) return true;                          // eksakt
    if (tok.length >= 5 && tekst.includes(tok.slice(0, 5))) return true; // 5-tegns stamme
    if (tok.length >= 4 && tekst.includes(tok.slice(0, 4))) return true; // 4-tegns stamme
    return false;
  });
}

async function hentAlle() {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, titel, ingredienser, instruktioner, beskrivelse')
    .eq('is_deleted', false);
  if (error) throw error;
  return data.filter(r => r.beskrivelse !== 'Importeret fra Meny');
}

async function run() {
  console.log('Henter opskrifter...');
  const recipes = await hentAlle();
  console.log(`${recipes.length} opskrifter analyseres med stamme-matching...\n`);

  const fejl = [];

  for (const r of recipes) {
    const tekst = instrTekst(r.instruktioner);
    if (!tekst || tekst.length < 20) continue;

    const ings = r.ingredienser || [];
    const unikke = [];
    const setSeen = new Set();

    // Find ingredienser der ikke nævnes i vejledningen (efter stamme-match)
    for (const ing of ings) {
      const normNavn = norm(ing.navn);
      if (setSeen.has(normNavn)) {
        // Duplikat-ingrediens — notér altid
        fejl.push({ type: 'DUPLIKAT', recipeId: r.id, titel: r.titel, ing });
        continue;
      }
      setSeen.add(normNavn);
      if (!matchesInText(ing.navn, tekst)) {
        unikke.push(ing);
      }
    }

    if (unikke.length > 0) {
      fejl.push({ type: 'MANGLER_I_VEJLEDNING', recipeId: r.id, titel: r.titel, ings: unikke });
    }
  }

  // ── Vis resultater ────────────────────────────────────────────────────────
  const manglerGruppe = fejl.filter(f => f.type === 'MANGLER_I_VEJLEDNING');
  const duplikatGruppe = fejl.filter(f => f.type === 'DUPLIKAT');

  console.log(`══════════════════════════════════════════════════════`);
  console.log(`INGREDIENSER IKKE NÆVNT I VEJLEDNING (stamme-match): ${manglerGruppe.length} opskrifter`);
  console.log(`══════════════════════════════════════════════════════\n`);
  manglerGruppe.forEach(f => {
    console.log(`⚠️  ${f.titel} (${f.recipeId})`);
    f.ings.forEach(i => console.log(`    - "${i.navn}" (${i.raavare_id})`));
  });

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`DUPLIKATE INGREDIENSER: ${duplikatGruppe.length} tilfælde`);
  console.log(`══════════════════════════════════════════════════════\n`);
  duplikatGruppe.forEach(f => {
    console.log(`⚠️  ${f.titel}: "${f.ing.navn}" er duplikeret`);
  });

  console.log(`\nOPSUMMERING: ${manglerGruppe.length} med manglende match, ${duplikatGruppe.length} duplikater`);
}

run().catch(e => { console.error(e); process.exit(1); });
