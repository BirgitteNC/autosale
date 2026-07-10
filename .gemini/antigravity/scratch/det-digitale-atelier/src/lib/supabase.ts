import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Opretter en enkelt Supabase client instans (Singleton) for at undgå unødvendige re-renders og connections
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
