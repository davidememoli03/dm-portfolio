import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { query } from '../db.js';
import { resolveGeo } from '../lib/geoip.js';
import { detectDevice } from '../lib/user-agent.js';
import { pageViewSchema } from '../lib/validation.js';

const pageViewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many analytics events.' },
});

export const analyticsRouter = Router();

analyticsRouter.post('/pageview', pageViewLimiter, async (req, res, next) => {
  try {
    const parsed = pageViewSchema.parse(req.body ?? {});
    const ipAddress = req.ip ?? null;
    const userAgent = req.headers['user-agent']?.slice(0, 1000) ?? null;
    const geo = resolveGeo(ipAddress);
    const deviceType = detectDevice(userAgent);

    const duplicate = await query(
      `SELECT id FROM page_views
       WHERE session_id = $1
         AND created_at > now() - interval '30 minutes'
       LIMIT 1`,
      [parsed.sessionId],
    );

    if (duplicate.rowCount > 0) {
      return res.status(204).end();
    }

    await query(
      `INSERT INTO page_views (
         session_id, path, referrer, locale, user_agent, device_type,
         ip_address, country, region, city
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        parsed.sessionId,
        parsed.path,
        parsed.referrer ?? null,
        parsed.locale ?? null,
        userAgent,
        deviceType,
        ipAddress,
        geo.country,
        geo.region,
        geo.city,
      ],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});
