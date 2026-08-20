import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Slet HttpOnly session cookie ved at sætte Max-Age = 0
  res.setHeader('Set-Cookie', serialize('staff_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  }));

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
