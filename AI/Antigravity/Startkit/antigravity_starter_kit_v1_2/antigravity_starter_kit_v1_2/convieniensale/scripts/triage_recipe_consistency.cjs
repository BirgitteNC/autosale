require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generiske madlavningsord der sjældent er eksplicit nævnt i vejledningen
const FALSE_POSITIVE_STEMS = new Set([
  'sort','fris','fris','hvid','grov','lunk','smag','nøyt','neut',
  'dijon','senn','flor','stød','kniv','krydr','have','stødt',
  'kanel','anis','karry','timian','oregano','rosmarin','basilik',
  'laurbær','nelliker','allehånde','muskat','paprika',
]);

const STOP_WORDS = new Set([
  'salt','peber','sukker','vand','olie','smaevs','mel','aeg','smag','lidt',
  'efter','behov','og','med','til','paa','fra','den','det','de','en','et',
  'ca','dl','dL','ml','stk','spsk','tsk','fed','nip','handfuld','smaevsneutral',
  'frisk','toerret','revet','hakket','skaaret','kogt','stegt','bagt','blandet',
  'samt','eller','evt','plus','portioner','portion','strimler','skiver','halve',
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
function tokens(navn) {
  return norm(navn).split(' ').filter(o => o.length >= 4 && !STOP_WORDS.has(o));
}
function matchesInText(navn, tekst) {
  const toks = tokens(navn);
  if (toks.length === 0) return true;
  return toks.some(tok => {
    if (tekst.includes(tok)) return true;
    if (tok.length >= 5 && tekst.includes(tok.slice(0,5))) return true;
    if (tok.length >= 4 && tekst.includes(tok.slice(0,4))) return true;
    return false;
  });
}
function likelyFalsePositive(navn) {
  const toks = tokens(navn);
  return toks.every(tok => FALSE_POSITIVE_STEMS.has(tok.slice(0,4)));
}

// Find 50-char context rundt om et token i teksten
function findContext(tok, tekst, maxLen=60) {
  const idx = tekst.indexOf(tok.slice(0,4));
  if (idx === -1) return '(ikke fundet i tekst)';
  const start = Math.max(0, idx-20);
  const end = Math.min(tekst.length, idx+maxLen);
  return '…' + tekst.slice(start, end).replace(/\s+/g,' ') + '…';
}

async function run() {
  const { data, error } = await supabase
    .from('recipes')
    .select('id,titel,ingredienser,instruktioner,beskrivelse')
    .eq('is_deleted', false);
  if (error) throw error;

  const recipes = data.filter(r => r.beskrivelse !== 'Importeret fra Meny');

  const flagged = [];
  for (const r of recipes) {
    const tekst = instrTekst(r.instruktioner);
    if (!tekst || tekst.length < 20) continue;
    const ings = r.ingredienser || [];
    const fejl = [];
    const seen = new Set();
    for (const ing of ings) {
      const k = norm(ing.navn);
      if (seen.has(k)) continue;
      seen.add(k);
      if (!matchesInText(ing.navn, tekst)) {
        const fp = likelyFalsePositive(ing.navn);
        fejl.push({ ing, fp });
      }
    }
    if (fejl.length > 0) flagged.push({ r, tekst, fejl });
  }

  // Sorter: ægte fejl først, false positives sidst
  flagged.sort((a,b) => {
    const aFP = a.fejl.every(f=>f.fp);
    const bFP = b.fejl.every(f=>f.fp);
    if (aFP && !bFP) return 1;
    if (!aFP && bFP) return -1;
    return 0;
  });

  let nr = 1;
  for (const { r, tekst, fejl } of flagged) {
    const allFP = fejl.every(f => f.fp);
    const prefix = allFP ? '🟡' : '🔴';
    console.log(`\n${prefix} #${nr++}  ${r.titel}`);
    console.log(`   ID: ${r.id}`);
    for (const { ing, fp } of fejl) {
      const tok = tokens(ing.navn)[0] || '';
      const ctx = tok ? findContext(tok, tekst) : '';
      console.log(`   ${fp?'⚠️ (sandsynlig FP)':'❗'} "${ing.navn}" (${ing.raavare_id})`);
      if (ctx && !fp) console.log(`      Tekst-kontekst: ${ctx}`);
    }
    console.log(`   Instruktioner (start): ${tekst.slice(0,120)}…`);
  }

  const roed = flagged.filter(f => !f.fejl.every(x=>x.fp)).length;
  const gul = flagged.filter(f => f.fejl.every(x=>x.fp)).length;
  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`🔴 ${roed} opskrifter med sandsynlige ÆGTE fejl`);
  console.log(`🟡 ${gul} opskrifter sandsynligvis false positives`);
}

run().catch(e => { console.error(e); process.exit(1); });
