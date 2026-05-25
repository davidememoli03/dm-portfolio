import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { loginSchema } from '../lib/validation.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.cookie.secure,
    path: '/api/admin',
    maxAge: config.cookie.maxAgeMs,
  };
}

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body ?? {});

    const usernameMatches = username === config.admin.username;
    const passwordMatches = await bcrypt.compare(password, config.admin.passwordHash);

    if (!usernameMatches || !passwordMatches) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ sub: username, role: 'admin' }, config.jwtSecret, {
      expiresIn: Math.floor(config.cookie.maxAgeMs / 1000),
    });

    res.cookie(config.cookie.name, token, cookieOptions());
    res.json({ ok: true, username });
  } catch (err) {
    next(err);
  }
});

adminAuthRouter.post('/logout', (_req, res) => {
  res.clearCookie(config.cookie.name, { ...cookieOptions(), maxAge: 0 });
  res.status(204).end();
});

adminAuthRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});
