import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    console.log("Tester update_store_promotions RPC...");
    const { data: pins } = await supabase.from('store_pins').select('store_id, pin_code').limit(1);
    if (!pins || pins.length === 0) return console.log("Ingen pins fundet");

    const storeId = pins[0].store_id;
    const pin = pins[0].pin_code;
    
    // Simulerer det valgte fra brugerens skærm
    // ['ing_extra_1', 'ing_extra_2'] og nogle food waste
    
    const { data, error } = await supabase.rpc('update_store_promotions', {
        p_store_id: storeId,
        p_pin: pin,
        p_selected_ids: ['ing_laks', 'ing_extra_23'],
        p_food_waste_ids: ['ing_laks']
    });

    if (error) {
        console.error("RPC Fejl:", error);
    } else {
        console.log("RPC Succes:", data);
    }
}
testRpc();
