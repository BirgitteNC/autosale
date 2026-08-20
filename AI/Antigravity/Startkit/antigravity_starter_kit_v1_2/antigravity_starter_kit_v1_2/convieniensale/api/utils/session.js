import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

export function requireStaffSession(req) {
  const cookies = parse(req.headers?.cookie || '');
  const token = cookies.staff_session;

  if (!token) {
    throw new Error('Unauthorized: Mangler session cookie');
  }

  const secret = process.env.SESSION_SIGNING_KEY;
  if (!secret) {
    throw new Error('Internal Error: Missing SESSION_SIGNING_KEY');
  }

  try {
    const sessionData = jwt.verify(token, secret);
    
    if (!sessionData.storeId || !sessionData.role) {
      throw new Error('Unauthorized: Ugyldig payload');
    }

    return sessionData;
  } catch (error) {
    throw new Error('Unauthorized: Ugyldig eller udløbet session', { cause: error });
  }
}
