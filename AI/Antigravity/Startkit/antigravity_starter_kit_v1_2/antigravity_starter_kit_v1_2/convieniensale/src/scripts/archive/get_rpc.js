import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function getRpc() {
    // Vi kan query pg_proc for at læse RPC definition
    const { data, error } = await supabase.from('pg_proc').select('proname, prosrc').eq('proname', 'update_store_promotions');
    if (error) {
        console.log("Kunne ikke læse pg_proc (forventet via REST), prøver RPC kald med forkerte parametre for at få en fejl:");
        const { error: rpcErr } = await supabase.rpc('update_store_promotions', { p_invalid: 1 });
        console.log(rpcErr);
    } else {
        console.log(data);
    }
}
getRpc();
