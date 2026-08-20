import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Endpointet forventer en gyldig Supabase-brugersessionstoken i Authorization headeren.
  // Det sikrer at brugeren er autentificeret og har de rette rettigheder,
  // som vi efterfølgende validerer via email og butiks-ID.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Admin adgang krævet' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Ugyldig session' });
  }

  const { storeId, pin, role, description } = req.body;
  if (!storeId || !pin || !role) {
    return res.status(400).json({ error: 'Mangler påkrævede felter' });
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN skal være præcis 4 cifre' });
  }

  if (role !== 'adult' && role !== 'young_worker') {
    return res.status(400).json({ error: 'Ugyldig rolle' });
  }

  if (!user.email || !user.email.startsWith(`store_${storeId}@`)) {
    return res.status(403).json({ error: 'Forbidden: Du har ikke adgang til at oprette PINs for denne butik' });
  }

  try {
    // Hash PIN koden på serveren (Aldrig i databasen via RPC!)
    const pinHash = await bcrypt.hash(pin, 10);

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Indsæt den hashede pin direkte i tabellen ved hjælp af service_role
    const { error } = await supabase.from('staff_credentials').insert({
      store_id: storeId,
      pin_hash: pinHash,
      role: role,
      description: description || ''
    });

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Credential created successfully' });
  } catch (error) {
    console.error("Error creating credential:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
