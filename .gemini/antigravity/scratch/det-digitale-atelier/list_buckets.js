const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
  if (error) console.error('Error:', error);
  else console.log('User profiles:', data);
}

main();
