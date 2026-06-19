// Vercel Serverless Function
// Fil: api/auth_admin.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { role, password } = req.body;

  if (!role || !password) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Hent rigtige passwords fra Vercel/Node environment, IKKE fra VITE_ (som lækkes til frontend)
  const storeAdminPwd = process.env.STORE_ADMIN_PWD || 'manager'; // Fallback for local dev
  const superAdminPwd = process.env.SUPER_ADMIN_PWD || 'boardroom'; // Fallback for local dev

  if (role === 'manager') {
    if (password === storeAdminPwd) {
      // AUDIT LOGGING: B2B Vilkår Accepteret
      console.log(JSON.stringify({
        event: "AUDIT_SUCCESS",
        type: "B2B_TERMS_ACCEPTED",
        role: "manager",
        timestamp: new Date().toISOString(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      }));
      return res.status(200).json({ success: true });
    }
  } else if (role === 'superadmin') {
    if (password === superAdminPwd) {
      return res.status(200).json({ success: true });
    }
  }

  // Forkert adgangskode
  return res.status(401).json({ error: 'Unauthorized' });
}
