import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const CHALLENGE_COOKIE = 'fm_challenge';

export const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId), typ: 'access' }, env.jwtSecret, { expiresIn: '12h' });

export function signChallengeToken(userId, stage) {
  return jwt.sign({ sub: String(userId), typ: 'challenge', stage }, env.jwtSecret, {
    expiresIn: stage === 'setup' ? '30m' : '30d',
  });
}

export function verifyToken(token, expectedType) {
  const payload = jwt.verify(token, env.jwtSecret);
  if (payload.typ !== expectedType) throw new Error('Invalid token type');
  return payload;
}

export function challengeCookieOptions(stage) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    path: '/',
    maxAge: stage === 'setup' ? 30 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000,
  };
}

export function setChallengeCookie(res, userId, stage) {
  res.cookie(CHALLENGE_COOKIE, signChallengeToken(userId, stage), challengeCookieOptions(stage));
}

export function clearChallengeCookie(res) {
  res.clearCookie(CHALLENGE_COOKIE, { httpOnly: true, sameSite: 'lax', secure: env.isProd, path: '/' });
}
