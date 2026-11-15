import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/http.js';
import { publicUser } from '../utils/serialize.js';
import { seedDefaults } from '../utils/seed.js';
import {
  changePasswordSchema,
  changePinSchema,
  loginSchema,
  parse,
  pinResetSchema,
  pinSetupSchema,
  pinVerifySchema,
  registerSchema,
  usernameSchema,
} from '../utils/schemas.js';
import {
  CHALLENGE_COOKIE,
  clearChallengeCookie,
  setChallengeCookie,
  signAccessToken,
  verifyToken,
} from '../utils/tokens.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_MS = 5 * 60 * 1000;

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes.' },
});

function requireChallenge(stage) {
  return (req, res, next) => {
    const token = req.cookies[CHALLENGE_COOKIE];
    if (!token) return res.status(401).json({ error: 'Session expired', code: 'NO_SESSION' });
    try {
      const payload = verifyToken(token, 'challenge');
      if (payload.stage !== stage) {
        return res.status(401).json({ error: 'Session expired', code: 'NO_SESSION' });
      }
      req.challengeUserId = payload.sub;
      return next();
    } catch {
      clearChallengeCookie(res);
      return res.status(401).json({ error: 'Session expired', code: 'NO_SESSION' });
    }
  };
}

function startSession(res, user) {
  setChallengeCookie(res, user._id, 'pin');
  return { token: signAccessToken(user._id), user: publicUser(user) };
}

router.get(
  '/username-available',
  asyncHandler(async (req, res) => {
    const result = usernameSchema.safeParse(req.query.username);
    if (!result.success) {
      return res.json({ available: false, reason: result.error.issues[0].message });
    }
    const username = result.data.toLowerCase();
    const exists = await User.exists({ username });
    return res.json({ available: !exists, username });
  })
);

router.post(
  '/register',
  strictLimiter,
  asyncHandler(async (req, res) => {
    const body = parse(registerSchema, req.body);
    const username = body.username.toLowerCase();

    const exists = await User.exists({ username });
    if (exists) {
      return res.status(409).json({ error: 'That username is already taken' });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await User.create({ username, passwordHash });
    await seedDefaults(user._id);

    setChallengeCookie(res, user._id, 'setup');
    return res.status(201).json({ state: 'setup', username, user: publicUser(user) });
  })
);

router.post(
  '/login',
  strictLimiter,
  asyncHandler(async (req, res) => {
    const body = parse(loginSchema, req.body);
    const username = body.username.toLowerCase();
    const user = await User.findOne({ username });

    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

    const stage = user.pinHash ? 'pin' : 'setup';
    setChallengeCookie(res, user._id, stage);
    return res.json({ state: stage, username: user.username, user: publicUser(user) });
  })
);

router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const token = req.cookies[CHALLENGE_COOKIE];
    if (!token) return res.json({ state: 'guest' });

    try {
      const payload = verifyToken(token, 'challenge');
      const user = await User.findById(payload.sub).select('username pinHash');
      if (!user) {
        clearChallengeCookie(res);
        return res.json({ state: 'guest' });
      }
      const stage = user.pinHash ? payload.stage : 'setup';
      return res.json({ state: stage, username: user.username, user: publicUser(user) });
    } catch {
      clearChallengeCookie(res);
      return res.json({ state: 'guest' });
    }
  })
);

router.post(
  '/pin/setup',
  strictLimiter,
  requireChallenge('setup'),
  asyncHandler(async (req, res) => {
    const body = parse(pinSetupSchema, req.body);
    const user = await User.findById(req.challengeUserId);
    if (!user) {
      clearChallengeCookie(res);
      return res.status(401).json({ error: 'Account not found', code: 'NO_SESSION' });
    }

    user.pinHash = await bcrypt.hash(body.pin, 10);
    user.pinFailedAttempts = 0;
    user.pinLockedUntil = null;
    await user.save();

    return res.json(startSession(res, user));
  })
);

router.post(
  '/pin/verify',
  strictLimiter,
  requireChallenge('pin'),
  asyncHandler(async (req, res) => {
    const body = parse(pinVerifySchema, req.body);
    const user = await User.findById(req.challengeUserId);
    if (!user || !user.pinHash) {
      clearChallengeCookie(res);
      return res.status(401).json({ error: 'Session expired', code: 'NO_SESSION' });
    }

    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      const secondsLeft = Math.ceil((user.pinLockedUntil - Date.now()) / 1000);
      return res.status(423).json({
        error: `Too many attempts. Try again in ${Math.ceil(secondsLeft / 60)} min.`,
        code: 'PIN_LOCKED',
        lockedUntil: user.pinLockedUntil,
      });
    }

    if (user.pinLockedUntil) {
      user.pinLockedUntil = null;
      user.pinFailedAttempts = 0;
    }

    const valid = await bcrypt.compare(body.pin, user.pinHash);
    if (!valid) {
      user.pinFailedAttempts += 1;
      if (user.pinFailedAttempts >= MAX_PIN_ATTEMPTS) {
        user.pinFailedAttempts = 0;
        user.pinLockedUntil = new Date(Date.now() + PIN_LOCK_MS);
        await user.save();
        return res.status(423).json({
          error: 'Too many incorrect attempts. Locked for 5 minutes.',
          code: 'PIN_LOCKED',
          lockedUntil: user.pinLockedUntil,
        });
      }
      await user.save();
      return res.status(401).json({
        error: 'Incorrect PIN',
        attemptsLeft: MAX_PIN_ATTEMPTS - user.pinFailedAttempts,
      });
    }

    user.pinFailedAttempts = 0;
    user.pinLockedUntil = null;
    await user.save();

    return res.json(startSession(res, user));
  })
);

router.post(
  '/pin/reset',
  strictLimiter,
  asyncHandler(async (req, res) => {
    const body = parse(pinResetSchema, req.body);
    const user = await User.findOne({ username: body.username.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    user.pinHash = await bcrypt.hash(body.pin, 10);
    user.pinFailedAttempts = 0;
    user.pinLockedUntil = null;
    await user.save();

    return res.json(startSession(res, user));
  })
);

router.post('/logout', (req, res) => {
  clearChallengeCookie(res);
  res.json({ ok: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('username pinHash createdAt');
    if (!user) return res.status(401).json({ error: 'Not signed in' });
    return res.json({ user: publicUser(user) });
  })
);

router.post(
  '/change-pin',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parse(changePinSchema, req.body);
    const user = await User.findById(req.userId);
    if (!user || !user.pinHash) return res.status(400).json({ error: 'PIN is not set up' });

    const valid = await bcrypt.compare(body.currentPin, user.pinHash);
    if (!valid) return res.status(401).json({ error: 'Current PIN is incorrect' });

    user.pinHash = await bcrypt.hash(body.pin, 10);
    await user.save();
    return res.json({ ok: true });
  })
);

router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parse(changePasswordSchema, req.body);
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Not signed in' });

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(body.password, 10);
    await user.save();
    return res.json({ ok: true });
  })
);

export default router;
