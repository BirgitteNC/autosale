import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testValid() {
    const storeId = '11111111-1111-1111-1111-111111111111';
    const pin = '1234';

    // Let's get 6 valid ingredients
    const { data: ings } = await supabase.from('ingredients').select('id').limit(6);
    const selectedIds = ings.map(i => i.id);

    console.log("Sending IDs:", selectedIds);

    const { data, error } = await supabase.rpc('update_store_promotions', {
        p_store_id: storeId,
        p_pin: pin,
        p_selected_ids: selectedIds,
        p_food_waste_ids: []
    });

    console.log("Result:", { data, error });
}
testValid();
