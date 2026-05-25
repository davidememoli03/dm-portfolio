import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { config } from '../config.js';
import { query } from '../db.js';
import { mailer } from '../lib/mailer.js';
import { contactSchema } from '../lib/validation.js';

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.contact.perHour,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

export const contactRouter = Router();

contactRouter.post('/', contactLimiter, async (req, res, next) => {
  try {
    const parsed = contactSchema.parse(req.body ?? {});

    // Honeypot field: bots fill it. Pretend success but skip persistence.
    if (parsed.hp_field && parsed.hp_field.trim() !== '') {
      return res.status(201).json({ id: null });
    }

    const ipAddress = req.ip ?? null;
    const userAgent = req.headers['user-agent']?.slice(0, 1000) ?? null;

    const insertResult = await query(
      `INSERT INTO messages (name, email, subject, message, locale, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        parsed.name,
        parsed.email,
        parsed.subject ?? null,
        parsed.message,
        parsed.locale,
        ipAddress,
        userAgent,
      ],
    );

    const id = insertResult.rows[0].id;

    if (mailer.enabled) {
      mailer.notifyNewMessage({
        id,
        name: parsed.name,
        email: parsed.email,
        subject: parsed.subject,
        message: parsed.message,
        locale: parsed.locale,
      });
    }

    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});
