import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Simple auth check to ensure only authorized callers (like Vercel Cron) can trigger this
  const authHeader = req.headers.authorization;
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ error: 'Cron is not configured' });
  }
  if (authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Slet forsøg ældre end rate-limit-vinduet (1 time) — ældre data bidrager alligevel ikke til rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('login_attempts')
      .delete()
      .lt('attempt_time', oneHourAgo);

    if (error) throw error;

    return res.status(200).json({ success: true, message: `Cleaned up old attempts.` });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return res.status(500).json({ error: 'Internal cron error' });
  }
}
