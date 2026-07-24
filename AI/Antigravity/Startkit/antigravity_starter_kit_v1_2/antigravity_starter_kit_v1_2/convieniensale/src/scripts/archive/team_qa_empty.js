import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testEmpty() {
    const { data, error } = await supabase.rpc('update_store_promotions', {
        p_store_id: '11111111-1111-1111-1111-111111111111',
        p_pin: '1234',
        p_selected_ids: [],
        p_food_waste_ids: []
    });
    console.log("Empty arrays test:", data, error);
}

testEmpty();
