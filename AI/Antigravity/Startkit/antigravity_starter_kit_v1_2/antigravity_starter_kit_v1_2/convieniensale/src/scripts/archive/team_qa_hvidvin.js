import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function getRPC() {
    // We can't easily get the definition via RPC, so let's run the exact same call with Hvidvin
    const storeId = '11111111-1111-1111-1111-111111111111'; // Meny Domus Vista
    console.log("Testing with Hvidvin...");
    const { data, error } = await supabase.rpc('update_store_promotions', {
        p_store_id: storeId,
        p_pin: '1234',
        p_selected_ids: ['ing_hvidvin', 'ing_tomat'],
        p_food_waste_ids: ['ing_hvidvin']
    });
    console.log("Result:", data);
    console.log("Error:", error);
}

getRPC();
