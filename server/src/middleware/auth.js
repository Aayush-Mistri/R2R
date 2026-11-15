import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Not signed in' });

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.typ !== 'access') throw new Error('Wrong token type');
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired' });
  }
}
