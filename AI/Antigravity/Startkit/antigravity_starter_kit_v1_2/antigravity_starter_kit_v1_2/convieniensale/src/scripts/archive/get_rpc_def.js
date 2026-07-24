import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getDef() {
    const { data, error } = await supabase.rpc('update_store_promotions', {
        p_store_id: '11111111-1111-1111-1111-111111111111',
        p_pin: '1234',
        p_selected_ids: ['ing_hvidvin', 'ing_tomat', 'ing_agurk', 'ing_fars', 'ing_kylling', 'ing_pasta'],
        p_food_waste_ids: ['ing_hvidvin', 'ing_tomat']
    });
    console.log("TEST WITH HVIDVIN:", data, error);
}
getDef();
