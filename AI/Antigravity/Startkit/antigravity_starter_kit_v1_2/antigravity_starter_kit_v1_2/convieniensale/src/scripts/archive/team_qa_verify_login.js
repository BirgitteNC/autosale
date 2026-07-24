import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function runTeamQA() {
    console.log("=== TEAM QA TEST: Nyt Login Flow & RPC ===");

    // 1. Simuler at Hanne åbner terminalen og henter butikker
    console.log("1. Henter butikker...");
    const { data: stores, error: storesError } = await supabase.from('stores').select('id, name').eq('is_active', true);
    if (storesError) {
        console.error("FEJL: Kunne ikke hente butikker:", storesError);
        return;
    }
    
    const domusVista = stores.find(s => s.id === '11111111-1111-1111-1111-111111111111');
    if (!domusVista) {
         console.error("FEJL: Fandt ikke Meny Domus Vista i listen.");
         return;
    }
    console.log(`   -> Succes: Fandt butik '${domusVista.name}' (${domusVista.id})`);

    // 2. Simuler at Hanne vælger butikken og taster 1234
    console.log("\n2. Forsøger login med valgt butik og pinkode '1234'...");
    const { data: pinData, error: pinError } = await supabase
        .from('store_pins')
        .select('store_id, description')
        .eq('store_id', domusVista.id)
        .eq('pin_code', '1234')
        .single();
        
    if (pinError) {
        console.error("FEJL under login (PGRST116 eller anden fejl):", pinError);
        return;
    }
    console.log(`   -> Succes: Logget ind! Rolle-beskrivelse: '${pinData.description}'`);

    // 3. Simuler at Hanne vælger varer og trykker Send
    console.log("\n3. Forsøger at sende data via RPC update_store_promotions...");
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_store_promotions', {
        p_store_id: domusVista.id,
        p_pin: '1234',
        p_selected_ids: ['ing_tomat', 'ing_agurk'],
        p_food_waste_ids: ['ing_tomat']
    });

    if (rpcError) {
        console.error("FEJL: Sikkerhedsfejl fra RPC:", rpcError);
        return;
    }

    console.log(`   -> Succes: RPC returnerede:`, rpcData);
    console.log("\n=== TEAM QA TEST BESTÅET 100% ===");
}

runTeamQA();
