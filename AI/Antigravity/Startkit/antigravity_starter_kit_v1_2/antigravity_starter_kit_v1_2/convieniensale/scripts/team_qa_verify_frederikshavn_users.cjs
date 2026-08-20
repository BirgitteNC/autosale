require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = process.env.QA_BASE_URL || 'https://menymenu.vercel.app';
const STORE_ID = '1ad9d739-473b-4d12-acec-41804f39165e';

const BRUGERE = [
  { navn: 'Morten', pin: '4271', rolle: 'adult',        beskrivelse: '[Butikschef] Morten - Kolonial' },
  { navn: 'Bjarne', pin: '8034', rolle: 'adult',        beskrivelse: '[Voksen] Bjarne - Grønt'        },
  { navn: 'Gladys', pin: '5519', rolle: 'young_worker', beskrivelse: '[Ungarbejder] Gladys - Slagter'  }
];

let ok = 0, fail = 0;
function check(label, pass, detail) {
  if (pass) { console.log(`  ✅ ${label}${detail ? ' — ' + detail : ''}`); ok++; }
  else       { console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); fail++; }
}

// Login via live API — returnerer cookie-header til videre brug
async function login(pin) {
  const res = await fetch(`${BASE_URL}/api/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeId: STORE_ID, pin })
  });
  const json = await res.json().catch(() => ({}));
  const cookie = res.headers.get('set-cookie') || '';
  return { status: res.status, cookie, ...json };
}

// validate_pin (kræver aktiv session-cookie) — udsteder approvalToken til voksne
async function validatePin(pin, sessionCookie) {
  const res = await fetch(`${BASE_URL}/api/staff/validate_pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
    body: JSON.stringify({ storeId: STORE_ID, pin })
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

// update_promotions (kræver session-cookie, og approvalToken hvis young_worker)
async function updatePromotions(sessionCookie, selectedIds, approvalToken) {
  const body = { selectedIds, foodWasteIds: [] };
  if (approvalToken) body.approvalToken = approvalToken;
  const res = await fetch(`${BASE_URL}/api/update_promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

// Direkte DB-validering (pin mod hash)
async function validerPinModDB(pin) {
  const { data: creds } = await supabase
    .from('staff_credentials')
    .select('id, pin_hash, role, description, is_active')
    .eq('store_id', STORE_ID)
    .eq('is_active', true);
  for (const c of (creds || [])) {
    if (await bcrypt.compare(pin, c.pin_hash)) return c;
  }
  return null;
}

async function run() {
  console.log('══════════════════════════════════════════════════════');
  console.log('  BRUGER-FLOW TEST — Frederikshavn');
  console.log('══════════════════════════════════════════════════════\n');

  // ── 1. Alle 3 PINs validerer direkte mod DB ───────────────────────────────
  console.log('Scenarie 1: Alle 3 brugere validerer PIN direkte mod DB');
  for (const b of BRUGERE) {
    const cred = await validerPinModDB(b.pin);
    check(`${b.navn} (PIN ${b.pin}) validerer`, !!cred, cred ? cred.role : 'ikke fundet');
    if (cred) check(`${b.navn} har korrekt rolle`, cred.role === b.rolle, `${cred.role} = ${b.rolle}`);
  }

  // ── 2. Forkert PIN afvises ────────────────────────────────────────────────
  console.log('\nScenarie 2: Forkert PIN afvises');
  const forkert = await validerPinModDB('0000');
  check('PIN 0000 afvises korrekt', forkert === null);

  // ── 3. Login via live API ─────────────────────────────────────────────────
  console.log('\nScenarie 3: Alle 3 logger ind via live API (/api/staff/login)');
  const mortenLogin = await login('4271');
  check('Morten logger ind', mortenLogin.status === 200, `HTTP ${mortenLogin.status} / rolle: ${mortenLogin.role}`);
  check('Morten er adult', mortenLogin.role === 'adult');
  check('Morten får session-cookie', mortenLogin.cookie.includes('staff_session'));

  const bjarneLogin = await login('8034');
  check('Bjarne logger ind', bjarneLogin.status === 200, `HTTP ${bjarneLogin.status} / rolle: ${bjarneLogin.role}`);
  check('Bjarne er adult', bjarneLogin.role === 'adult');

  const gladysLogin = await login('5519');
  check('Gladys logger ind', gladysLogin.status === 200, `HTTP ${gladysLogin.status} / rolle: ${gladysLogin.role}`);
  check('Gladys er young_worker', gladysLogin.role === 'young_worker');

  const mortenCookie = mortenLogin.cookie;
  const bjarneCookie = bjarneLogin.cookie;
  const gladysCookie = gladysLogin.cookie;

  // ── 4. Morten udsteder approvalToken via validate_pin ────────────────────
  console.log('\nScenarie 4: Morten udsteder godkendelsestoken (validate_pin med sin session)');
  const mortenApproval = await validatePin('4271', mortenCookie);
  check('validate_pin OK for Morten', mortenApproval.status === 200, `HTTP ${mortenApproval.status}`);
  check('Morten får approvalToken', !!mortenApproval.approvalToken);
  const mortenToken = mortenApproval.approvalToken;

  // ── 5. Bjarne udsteder approvalToken ──────────────────────────────────────
  console.log('\nScenarie 5: Bjarne udsteder godkendelsestoken');
  const bjarneApproval = await validatePin('8034', bjarneCookie);
  check('validate_pin OK for Bjarne', bjarneApproval.status === 200, `HTTP ${bjarneApproval.status}`);
  check('Bjarne får approvalToken', !!bjarneApproval.approvalToken);
  const bjarneToken = bjarneApproval.approvalToken;

  // ── 6. Gladys forsøger at sende UDEN godkendelse → 403 ───────────────────
  console.log('\nScenarie 6: Gladys sender uden godkendelse → skal afvises (403)');
  const gladysUden = await updatePromotions(gladysCookie, ['ing_extra_4'], null);
  check('Gladys uden token → 403', gladysUden.status === 403, `HTTP ${gladysUden.status}`);

  // ── 7. Gladys sender MED Mortens godkendelse → 200 ───────────────────────
  console.log('\nScenarie 7: Gladys sender MED Mortens godkendelse → skal godkendes (200)');
  const gladysMedMorten = await updatePromotions(gladysCookie, ['ing_extra_4'], mortenToken);
  check('Gladys + Mortens token → 200', gladysMedMorten.status === 200, `HTTP ${gladysMedMorten.status} ${gladysMedMorten.error || ''}`);

  // ── 8. Gladys sender MED Bjarnes godkendelse → 200 ───────────────────────
  console.log('\nScenarie 8: Gladys sender MED Bjarnes godkendelse → skal godkendes (200)');
  const gladysMedBjarne = await updatePromotions(gladysCookie, ['ing_extra_22'], bjarneToken);
  check('Gladys + Bjarnes token → 200', gladysMedBjarne.status === 200, `HTTP ${gladysMedBjarne.status} ${gladysMedBjarne.error || ''}`);

  // ── 9. Bjarne sender selvstændigt (voksen behøver ikke approval) ──────────
  console.log('\nScenarie 9: Bjarne sender selvstændigt som voksen → 200');
  const bjarneSender = await updatePromotions(bjarneCookie, ['ing_extra_4', 'ing_extra_22'], null);
  check('Bjarne sender uden approval → 200', bjarneSender.status === 200, `HTTP ${bjarneSender.status} ${bjarneSender.error || ''}`);

  // ── 10. Morten sender selvstændigt (butikschef) ───────────────────────────
  console.log('\nScenarie 10: Morten sender selvstændigt som butikschef → 200');
  const mortenSender = await updatePromotions(mortenCookie, ['ing_extra_4'], null);
  check('Morten sender uden approval → 200', mortenSender.status === 200, `HTTP ${mortenSender.status} ${mortenSender.error || ''}`);

  // ── Oprydning ─────────────────────────────────────────────────────────────
  await supabase.rpc('set_active_promotions', {
    p_store_id: STORE_ID, p_selected_ids: [], p_food_waste_ids: []
  });

  console.log(`\n${'═'.repeat(54)}`);
  console.log(`RESULTAT: ${ok} OK, ${fail} fejl`);
  if (fail === 0) console.log('🌟 ALLE BRUGER-FLOWS FUNGERER — klar til demo!\n');
  else console.error(`⚠️  ${fail} ting kræver opmærksomhed inden demo.\n`);
  process.exitCode = fail > 0 ? 1 : 0;
}

run().catch(e => { console.error(e); process.exitCode = 1; });
