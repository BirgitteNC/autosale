import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Supabase has no default exec_sql RPC unless we created one. We can query pg_policies?
// No, the postgrest API doesn't expose pg_policies by default.
// Let's just create a SQL script that drops ALL policies dynamically.
