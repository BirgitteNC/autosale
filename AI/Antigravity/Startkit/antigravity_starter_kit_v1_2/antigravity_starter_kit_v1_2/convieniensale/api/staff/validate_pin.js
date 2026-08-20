import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { requireStaffSession } from '../utils/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storeId, pin } = req.body;
  
  if (!storeId || !pin) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  let sessionData;
  try {
    sessionData = requireStaffSession(req);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  // Tjek at storeId i payload stemmer overens med forespørgslen
  if (sessionData.storeId !== storeId) {
    return res.status(403).json({ error: 'Forbidden: Butiks-ID mismatch' });
  }

  const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const pepper = process.env.SESSION_SIGNING_KEY;
  if (!pepper) {
    console.error('CRITICAL: Manglende SESSION_SIGNING_KEY til pepper-hash!');
    return res.status(500).json({ error: 'Internal server error (konfiguration)' });
  }
  const ip = crypto.createHash('sha256').update(rawIp + pepper).digest('hex');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Basic Rate Limiting (samme som i login)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('success', false)
      .gte('attempt_time', oneHourAgo);

    if (countError) {
      console.warn("Rate limit check failed, failing closed", countError);
      res.setHeader('Retry-After', '300');
      return res.status(429).json({ error: 'Systemet er midlertidigt utilgængeligt (for mange forsøg)' });
    }

    if (count >= 20) {
      res.setHeader('Retry-After', '3600');
      return res.status(429).json({ error: 'For mange forsøg fra denne adresse. Prøv igen senere.' });
    }

    const { data: credentials, error: credError } = await supabase
      .from('staff_credentials')
      .select('id, pin_hash, role, is_active')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (credError || !credentials || credentials.length === 0) {
      console.error(JSON.stringify({ event: "AUDIT_FAILURE", type: "VALIDATE_PIN", storeId, reason: "Ugyldig butik" }));
      await logAttempt(supabase, ip, storeId, false);
      return res.status(401).json({ error: 'Ugyldig butik' });
    }

    let validUser = null;
    for (const cred of credentials) {
      if (await bcrypt.compare(pin, cred.pin_hash)) {
        validUser = cred;
        break;
      }
    }

    if (!validUser) {
      console.error(JSON.stringify({ event: "AUDIT_FAILURE", type: "VALIDATE_PIN", storeId, reason: "Ugyldig PIN" }));
      await logAttempt(supabase, ip, storeId, false);
      return res.status(401).json({ error: 'Ugyldig PIN' });
    }

    await logAttempt(supabase, ip, storeId, true);

    let approvalToken = null;
    if (validUser.role === 'adult') {
      const secret = process.env.SESSION_SIGNING_KEY;
      if (!secret) throw new Error('Missing SESSION_SIGNING_KEY');
      approvalToken = jwt.sign(
        { storeId, type: 'adult_approval' },
        secret,
        { expiresIn: '10m' }
      );
    }

    return res.status(200).json({ 
      valid: true, 
      role: validUser.role,
      approvalToken 
    });

  } catch (error) {
    console.error("Validerings fejl:", error);
    return res.status(500).json({ error: 'Internal error' });
  }
}

async function logAttempt(supabase, ip, storeId, success) {
  await supabase.from('login_attempts').insert({
    ip_address: ip,
    store_id: storeId,
    success: success
  });
}
