import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storeId, pin } = req.body;
  
  if (!storeId || !pin) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  // Sikker hashing af IP (med pepper) for rate limiting og GDPR compliance
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
    // Basic Rate Limiting
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

    // Hent PIN hash for butikken
    const { data: credentials, error: credError } = await supabase
      .from('staff_credentials')
      .select('id, pin_hash, role, is_active, department')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (credError || !credentials || credentials.length === 0) {
      await logAttempt(supabase, ip, storeId, false);
      return res.status(401).json({ error: 'Login kunne ikke gennemføres' });
    }

    // Find matchende PIN
    let validUser = null;
    for (const cred of credentials) {
      if (await bcrypt.compare(pin, cred.pin_hash)) {
        validUser = cred;
        break;
      }
    }

    if (!validUser) {
      await logAttempt(supabase, ip, storeId, false);
      return res.status(401).json({ error: 'Login kunne ikke gennemføres' });
    }

    await logAttempt(supabase, ip, storeId, true);

    const sessionData = {
      storeId,
      role: validUser.role,
      department: validUser.department
    };

    // Bruger det allerede validerede 'pepper' som jwt secret
    const token = jwt.sign(sessionData, pepper, { expiresIn: '8h' });

    // Sæt HttpOnly cookie
    res.setHeader('Set-Cookie', serialize('staff_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60,
      path: '/'
    }));

    return res.status(200).json({ 
      success: true, 
      storeId, 
      role: validUser.role,
      department: validUser.department
    });

  } catch (error) {
    console.error("Login error:", error);
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
