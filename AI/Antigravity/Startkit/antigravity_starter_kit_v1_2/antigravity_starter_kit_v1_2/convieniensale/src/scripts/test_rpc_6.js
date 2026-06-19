import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    const { data: pins } = await supabase.from('store_pins').select('store_id, pin_code').limit(1);
    const storeId = pins[0].store_id;
    const pin = pins[0].pin_code;
    
    // Simulate exactly what the user selected in the screenshot
    const selected = [
        'ing_laks', 
        'ing_extra_23', // Fiskefars
        'ing_extra_1', // Tomater
        'ing_extra_2', // Agurk
        'ing_champignon', 
        'ing_peberfrugt'
    ];
    const waste = [
        'ing_extra_23', 
        'ing_extra_1'
    ];
    
    const { data, error } = await supabase.rpc('update_store_promotions', {
        p_store_id: storeId,
        p_pin: pin,
        p_selected_ids: selected,
        p_food_waste_ids: waste
    });

    if (error) {
        console.error("RPC Fejl:", error);
    } else {
        console.log("RPC Succes:", data);
    }
}
testRpc();
