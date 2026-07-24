import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env fra src mappen
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Fejl: Mangler VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY i .env');
  process.exit(1);
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function runQA() {
  console.log('🛡️  STARTER QA BEVISFØRELSE: SIKKERHED & RLS PÅ MEDARBEJDER PINS 🛡️\n');

  // 1. Hacker-testen: Kan den offentlige (anon) adgang læse koderne direkte?
  console.log('🚨 TEST 1: Direkte aflæsning af store_pins via Anon-nøglen (Hacker Forsøg)');
  console.log('Forventet resultat: Fejl eller TOMT array (RLS skal blokere)');
  
  const { data: hackerData, error: hackerError } = await supabaseAnon
    .from('store_pins')
    .select('*');
    
  if (hackerError) {
    console.log(`✅ SUCCES: Databasen afviste forespørgslen aktivt! (${hackerError.message})`);
  } else if (!hackerData || hackerData.length === 0) {
    console.log('✅ SUCCES: Databasen returnerede et tomt array pga. RLS! Hackeren kan intet se.');
  } else {
    console.log('❌ FEJL: Tabellen returnerede data! RLS ER IKKE AKTIVERET ELLER VIRKER IKKE!');
    console.log(hackerData);
  }
  
  console.log('--------------------------------------------------');

  // 2. Auth-testen: Kan vi logge ind via den sikre RPC uden at bryde RLS?
  console.log('\n🔐 TEST 2: Validering via ny sikker RPC (verify_staff_pin)');
  
  // Vi skal bruge et rigtigt butiks-ID til testen. Hvis vi har admin rettigheder, finder vi en PIN.
  if (!supabaseAdmin) {
     console.log('⚠️ Mangler SUPABASE_SERVICE_ROLE_KEY i .env til at finde en test-pin. Springer Test 2 over.');
     return;
  }

  const { data: pinData } = await supabaseAdmin.from('store_pins').select('*').limit(1).single();
  
  if (!pinData) {
     console.log('⚠️ Ingen eksisterende PIN koder i databasen at teste med.');
  } else {
     const testStoreId = pinData.store_id;
     const testPin = pinData.pin_code;
     
     console.log(`Tester login med RPC for Butik: ${testStoreId} og PIN: ****`);
     
     const { data: rpcData, error: rpcError } = await supabaseAnon.rpc('verify_staff_pin', {
       p_store_id: testStoreId,
       p_pin_code: testPin
     });
     
     if (rpcError) {
        console.log(`❌ FEJL: RPC fejlede: ${rpcError.message}`);
     } else {
        const result = rpcData && rpcData.length > 0 ? rpcData[0] : null;
        if (result && result.is_valid) {
           console.log(`✅ SUCCES: RPC returnerede TRUE! Medarbejderen blev logget ind blindt med rolle: ${result.role_description}`);
        } else {
           console.log('❌ FEJL: RPC returnerede false til trods for at koden var korrekt.');
        }
     }
     
     // Test forkert pin
     console.log(`\nTester login med forkert PIN (0000) for at sikre at den afviser:`);
     const { data: rpcDataFail } = await supabaseAnon.rpc('verify_staff_pin', {
       p_store_id: testStoreId,
       p_pin_code: '0000'
     });
     const resultFail = rpcDataFail && rpcDataFail.length > 0 ? rpcDataFail[0] : null;
     if (resultFail && !resultFail.is_valid) {
        console.log('✅ SUCCES: RPC afviste korrekt (is_valid: false) den forkerte kode.');
     } else {
        console.log('❌ FEJL: RPC godkendte den forkerte kode!');
     }
  }

  console.log('\n🏆 QA BEVISFØRELSE AFSLUTTET 🏆');
}

runQA();
