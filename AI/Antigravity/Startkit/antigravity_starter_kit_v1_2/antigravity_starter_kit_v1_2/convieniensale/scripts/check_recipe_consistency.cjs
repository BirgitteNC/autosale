require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ord der er for generiske til at matche på (krydderier, enheder, teknik-ord)
const STOP_WORDS = new Set([
  'salt','peber','sort peber','sukker','vand','olie','smør','mel','æg',
  'efter behov','smag','lidt','en','et','og','med','i','af','til','på',
  'ca','dl','g','kg','ml','l','stk','spsk','tsk','fed','nip','håndfuld',
  'frisk','tørret','revet','hakket','skåret','kogt','stegt','bagt','blandet',
  'samt','eller','evt','plus','portioner','portion','bid','strimler',
]);

function normaliser(tekst) {
  return (tekst || '')
    .toLowerCase()
    .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'oe').replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokeniserInstruktioner(instruktioner) {
  // instruktioner kan være array af strenge eller én streng
  let tekst = '';
  if (Array.isArray(instruktioner)) {
    tekst = instruktioner.join(' ');
  } else if (typeof instruktioner === 'string') {
    tekst = instruktioner;
  } else if (instruktioner && typeof instruktioner === 'object') {
    tekst = Object.values(instruktioner).join(' ');
  }
  return normaliser(tekst);
}

function ingNavn(ing) {
  return normaliser(ing.navn || '');
}

// Tjek om et ingrediensnavn forekommer i instruktions-teksten
function findesITekst(navn, tekst) {
  if (!navn || navn.length < 3) return true; // for kort til at matche på
  const ord = navn.split(' ').filter(o => o.length >= 3 && !STOP_WORDS.has(o));
  if (ord.length === 0) return true; // kun stop-words
  // Mindst ét meningsbærende ord fra ingrediensnavnet skal findes i teksten
  return ord.some(o => tekst.includes(o));
}

async function run() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  KONSISTENSTJEK: Ingredienser vs. Tilberedningsvejledning');
  console.log('════════════════════════════════════════════════════════════\n');

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, titel, ingredienser, instruktioner, beskrivelse')
    .eq('is_deleted', false);

  if (error) { console.error('DB-fejl:', error.message); process.exit(1); }

  const aktive = recipes.filter(r => r.beskrivelse !== 'Importeret fra Meny');
  console.log(`Analyserer ${aktive.length} opskrifter...\n`);

  const ingenInstruktioner = [];
  const ingredienserIkkeITekst = []; // ingrediens i listen, ikke nævnt i vejledning
  const tekstIkkeIListe = [];        // nøgleord i vejledning, ingen match i ingrediensliste

  for (const r of aktive) {
    const tekst = tokeniserInstruktioner(r.instruktioner);
    const ings = r.ingredienser || [];

    if (!tekst || tekst.length < 20) {
      ingenInstruktioner.push(r.titel);
      continue;
    }

    // 1. Ingredienser i listen der IKKE nævnes i vejledningen
    const manglerITekst = ings.filter(ing => {
      const navn = ingNavn(ing);
      if (STOP_WORDS.has(navn)) return false;
      return !findesITekst(navn, tekst);
    });

    if (manglerITekst.length > 0) {
      ingredienserIkkeITekst.push({
        titel: r.titel,
        id: r.id,
        mangler: manglerITekst.map(i => i.navn)
      });
    }

    // 2. Nøgleord i vejledningen der ikke matcher noget i ingredienslisten
    // Udtræk substantiver fra vejledningen der ser ud som ingredienser (≥5 tegn, ikke stop-word)
    const vejledningsOrd = [...new Set(
      tekst.split(' ').filter(o => o.length >= 5 && !STOP_WORDS.has(o))
    )];

    const alleIngNavne = ings.map(i => ingNavn(i)).join(' ');
    const umatcedOrd = vejledningsOrd.filter(ord => {
      // Ordet fra vejledningen skal IKKE kunne matches til nogen ingrediens
      return !ings.some(ing => {
        const navn = ingNavn(ing);
        return navn.includes(ord) || ord.includes(navn.split(' ')[0]);
      });
    });

    // Filtrer til ord der faktisk ligner madrelaterede ingredienser
    // (undgå falske positiver som "tilsaet", "opvarmes" etc.)
    // Heuristik: ord der er substantiver fra vejledningen og IKKE er procesord
    const procesOrd = new Set([
      'tilsaet','tilsaettes','opvarmes','opvarm','saettes','bringes','koges',
      'steges','bages','blandes','roeres','skives','hakkes','ristes','serveres',
      'kraeves','anbefales','beregnes','fordeles','marineres','afkoeles',
      'laegges','tages','gives','goeres','lader','venter','starter','slutter',
      'tilbered','anret','vend','skyl','skraes','pilles','renses','skaeres',
      'smages','tildaek','efterhaev','haever','afkoel','vaelges','bruges',
      'opnaas','saadan','saettes','laegges','loeftes','trykkes','dækkes',
      'retten','skaaen','ovnen','graden','minutter','sekunder','timer',
      'krydr','krydre','gryde','pande','bradepande','bageplade','skaal',
    ]);

    const muligeManglende = umatcedOrd.filter(o => !procesOrd.has(o) && o.length >= 5);

    // Yderligere filtrering: behold kun ord der ikke ligner procesord endings
    const ingLignendeOrd = muligeManglende.filter(o =>
      !o.endsWith('edes') && !o.endsWith('eres') && !o.endsWith('iges') &&
      !o.endsWith('aees') && !o.endsWith('oges') && !o.endsWith('endes') &&
      !o.endsWith('aaed') && !o.endsWith('ling') && !o.endsWith('ning') &&
      o.length >= 5
    ).slice(0, 5); // maks 5 kandidater per opskrift for læsbarhed

    // Kun rapporter hvis der er ord der minder om ingredienser (sjældent brugte ord)
    // Denne analyse er mere heuristisk – markeres som "mulige"
  }

  // ── Rapport ───────────────────────────────────────────────────────────────
  console.log(`PROBLEM 1: Ingredienser i listen der IKKE nævnes i vejledningen`);
  console.log(`${'─'.repeat(60)}`);
  if (ingredienserIkkeITekst.length === 0) {
    console.log('  Ingen problemer fundet.\n');
  } else {
    ingredienserIkkeITekst.forEach(r => {
      console.log(`\n  ⚠️  ${r.titel}`);
      console.log(`     ID: ${r.id}`);
      r.mangler.forEach(navn => console.log(`     - "${navn}" bruges ikke i vejledningen`));
    });
    console.log('');
  }

  if (ingenInstruktioner.length > 0) {
    console.log(`\nOPSKRIFTER UDEN TILBEREDNINGSVEJLEDNING (${ingenInstruktioner.length}):`);
    console.log(`${'─'.repeat(60)}`);
    ingenInstruktioner.forEach(t => console.log(`  - ${t}`));
    console.log('');
  }

  console.log(`\n════════════════════════════════════════════════════════════`);
  console.log(`OPSUMMERING:`);
  console.log(`  ${aktive.length} opskrifter analyseret`);
  console.log(`  ${ingredienserIkkeITekst.length} opskrifter har ingredienser der IKKE nævnes i vejledningen`);
  console.log(`  ${ingenInstruktioner.length} opskrifter mangler tilberedningsvejledning`);
}

run().catch(e => { console.error(e); process.exit(1); });
