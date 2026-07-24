import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Tester signUp for en fiktiv butik...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test_store_123@meny.dk',
    password: '123456'
  });
  if (error) {
    console.error("SignUp fejlede:", error.message);
  } else {
    console.log("SignUp success!", data.user ? "Bruger oprettet" : "Mangler bekræftelse");
  }
}
test();
