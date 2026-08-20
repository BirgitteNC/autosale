require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let fixed = 0, skipped = 0;

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function patchIngredienser(recipeId, titel, patchFn, beskrivelse) {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, ingredienser')
    .eq('id', recipeId)
    .single();
  if (error || !data) { console.error(`  ❌ Fandt ikke ${recipeId}: ${error?.message}`); skipped++; return; }

  const before = data.ingredienser || [];
  const after = patchFn(before);
  if (JSON.stringify(before) === JSON.stringify(after)) {
    console.log(`  ⏭️  ${titel} — ingen ændring (${beskrivelse})`);
    skipped++;
    return;
  }

  const removed = before.filter(b => !after.find(a => a.raavare_id === b.raavare_id && a.navn === b.navn));
  const { error: upErr } = await supabase.from('recipes').update({ ingredienser: after }).eq('id', recipeId);
  if (upErr) { console.error(`  ❌ Opdatering fejlede for ${titel}: ${upErr.message}`); skipped++; return; }

  console.log(`  ✅ ${titel}`);
  removed.forEach(r => console.log(`     - fjernet: "${r.navn}" (${r.raavare_id})`));
  fixed++;
}

// Fjern duplikate ingredienser (samme normaliserede navn, behold første)
function fjernDuplikater(ings) {
  const seen = new Set();
  return ings.filter(ing => {
    const key = norm(ing.navn);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Fjern specifik ingrediens fra liste baseret på raavare_id
function fjernRaavare(raavareId) {
  return ings => ings.filter(i => i.raavare_id !== raavareId);
}

async function run() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('  OPSKRIFT-RETTELSER: Duplikater + klart forkerte ingredienser');
  console.log('══════════════════════════════════════════════════════════\n');

  // ── 1. Duplikate ingredienser (38 tilfælde) ──────────────────────────────
  console.log('--- Fjerner duplikat-ingredienser ---');

  const duplikatOpskrifter = [
    { id: 'meny_QnV0dGVyY2hpY2t', titel: 'Butterchicken med kikærter, basmatiris, broccoli og limemarineret rødkål' },
    { id: 'meny_Qm9sbGVyIGkga2F', titel: 'Boller i karry med børnevenlig topping' },
    { id: 'meny_U2xpZGVycyBtZWQ', titel: 'Sliders med torpedorejer og avocadocoleslaw' },
    { id: 'meny_fixed_2_1781879414874', titel: 'Brændende kærlighed med linser' },
    { id: 'meny_R3JpbGxldCBrYWx2', titel: 'Grillet kalvecuvette med jordbær-caprese' },
    { id: 'meny_R3JpbGxldCBva3N', titel: 'Grillet oksecuvette med krydderiblanding og mynte-persillepesto' },
    { id: 'meny_SGVsc3RlZ3QgYWs', titel: 'Helstegt oksemørbrad med pommes anna, palmekålchips, blåbær og rødvinssauce' },
    { id: 'meny_RnJpa2FkZWxsZWJ', titel: 'Frikadelleburger med rødbede-slaw' },
    { id: 'meny_fixed_3_1781879414874', titel: 'Kalveculotte med pocherede grøntsager og kapersmayonnaise' },
    { id: 'meny_Q8Omc2Fyc2FsYXQ', titel: 'Cæsarsalat med ristet blomkål og croutoner' },
    { id: 'meny_SGF2cmVncnluc2N', titel: 'Havregrynscookies med kokos og tranebær' },
    { id: 'meny_QmFjb25zbnVycmV', titel: 'Baconsnurrer med flødeost' },
    { id: 'meny_SMO4c3RzaWxkIG1', titel: 'Høstsild med løvstikke' },
    { id: 'meny_S3J5ZHJlZGUga8O', titel: 'Krydrede kødboller med frisk pasta og tomatsauce' },
    { id: 'meny_RmFzdGVsYXZuc2J', titel: 'Fastelavnsboller med hindbær og crème' },
    { id: 'meny_S3lsbGluZ2V1bmR', titel: 'Kyllingeunderlår med ristet blomkål og gurkemejedressing' },
    { id: 'meny_SGplcnRlciBpIGZ', titel: 'Hjerter i flødesovs med kartoffelmos og kruspersille' },
    { id: 'meny_R2x1dGVuLSBvZyB', titel: 'Gluten- og laktosefrie tykke pandekager med is, flødeskum, blåbær og hasselnødder' },
    { id: 'meny_UmliZXllIG1lZCB', titel: 'Ribeye med saltbagte kartofler, grønne asparges og kryddersmør' },
    { id: 'meny_R3JpbGxlZGUgYmF', titel: 'Grillede bananer med cheesecakecreme' },
    { id: 'meny_SHVtbXVzIG1lZCB', titel: 'Hummus med krydrede kødboller og spidskålsalat' },
    { id: 'meny_w5hsbWFyaW5lcmV', titel: 'Ølmarineret medister med råstegte rødder' },
    { id: 'meny_RmlzaGJ1cmdlciB3', titel: 'Fishburger med avocadosalat' },
    { id: 'meny_bWFkdMOmcnRlIG1', titel: 'madtærte med cherrytomater ricotta og mozzarella' },
    { id: 'meny_R3LDuG5uZSB3cmF', titel: 'Grønne wraps med sprøde falafler og cremet fetadressing' },
    { id: 'meny_VGFjb3MgbWVkIGd', titel: 'Tacos med grillet laks, spidskålsalat og avocado' },
    { id: 'meny_R3JpbGxldCBtZWR', titel: 'Grillet medister med serranoskinke, italiensk kartoffelsalat og asparges' },
    { id: 'meny_R3JpbGxlZGUgc2t', titel: 'Grillede skaftkoteletter med nye kartofler og salsa af tomat og jordbær' },
    { id: 'meny_R3JpbGxlZGUgdG9', titel: 'Grillede tortillas med krydrede kødboller, creme fraiche og rødløg' },
    { id: 'meny_RnJhbnNrIGt5bGx', titel: 'Fransk kylling med grillede små kartofler' },
    { id: 'meny_S2FuZWxzbmVnbGU', titel: 'Kanelsnegle' },
    { id: 'meny_U23DpSBqdWxldMO', titel: 'Små juletærter med frugt og chokolade' },
    { id: 'meny_R3JpbGxldCBsYWt', titel: 'Grillet laks med spidskåls-tzatziki med forårsløg og ærter' },
  ];

  for (const r of duplikatOpskrifter) {
    await patchIngredienser(r.id, r.titel, fjernDuplikater, 'duplikat fjernet');
  }

  // ── 2. Specifikke forkerte ingredienser ──────────────────────────────────
  console.log('\n--- Fjerner klart forkerte ingredienser ---');

  // Laks-opskrift har "Torskefileter" — forkert fiskeart
  await patchIngredienser(
    'meny_TGFrcyBtZWQgcGF',
    'Laks med pasta og langtidsbagte tomater, persille og kapers',
    fjernRaavare('ing_extra_21'),
    'Torskefileter i lakseopskrift'
  );

  // Kanelsnegle har sig selv som ingrediens
  await patchIngredienser(
    'meny_S2FuZWxzbmVnbGU',
    'Kanelsnegle',
    fjernRaavare('ing_extra_38'),
    'Kanelsnegle som sin egen ingrediens'
  );

  // Muslinger med dijonsauce — dobbelt kammusling (ing_extra_21 er "Kammuslinger",
  // ing_meny_auto_526 er "kammusling" — behold auto-versionen, fjern extra
  await patchIngredienser(
    'meny_TXVzbGluZ2VyIG1',
    'Muslinger med dijonsauce',
    ings => {
      // Fjern først ing_extra_21 (Kammuslinger) hvis ing_meny_auto_526 (kammusling) eksisterer
      const hasAuto = ings.some(i => i.raavare_id === 'ing_meny_auto_526');
      if (hasAuto) return ings.filter(i => i.raavare_id !== 'ing_extra_21');
      return fjernDuplikater(ings);
    },
    'dobbelt kammusling'
  );

  // ── Opsummering ──────────────────────────────────────────────────────────
  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`RESULTAT: ${fixed} opskrifter rettet, ${skipped} sprunget over`);
  if (fixed > 0) console.log('✅ Alle rettelser gemt i Supabase');
}

run().catch(e => { console.error(e); process.exit(1); });
