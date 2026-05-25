import { Router } from 'express';

import { query } from '../db.js';
import { countryLabel } from '../lib/geoip.js';
import { normalizeReferrer } from '../lib/user-agent.js';
import { analyticsOverviewQuerySchema } from '../lib/validation.js';
import { requireAdmin } from '../middleware/auth.js';

function maskIp(ip) {
  if (!ip) return null;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return ip.slice(0, 8) + '…';
}

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.use(requireAdmin);

adminAnalyticsRouter.get('/overview', async (req, res, next) => {
  try {
    const { days } = analyticsOverviewQuerySchema.parse(req.query);
    const intervalDays = `${days} days`;

    const [totals, today, byDay, byCountry, byReferrer, byLocale, byDevice, recent] =
      await Promise.all([
        query(
          `SELECT COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS sessions
           FROM page_views
           WHERE created_at >= now() - $1::interval`,
          [intervalDays],
        ),
        query(
          `SELECT COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS sessions
           FROM page_views
           WHERE created_at >= date_trunc('day', now())`,
        ),
        query(
          `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
                  COUNT(*)::int AS views,
                  COUNT(DISTINCT session_id)::int AS sessions
           FROM page_views
           WHERE created_at >= now() - $1::interval
           GROUP BY 1
           ORDER BY 1 ASC`,
          [intervalDays],
        ),
        query(
          `SELECT COALESCE(country, 'ZZ') AS country, COUNT(*)::int AS count
           FROM page_views
           WHERE created_at >= now() - $1::interval
           GROUP BY 1
           ORDER BY count DESC
           LIMIT 8`,
          [intervalDays],
        ),
        query(
          `SELECT COALESCE(NULLIF(referrer, ''), 'direct') AS referrer, COUNT(*)::int AS count
           FROM page_views
           WHERE created_at >= now() - $1::interval
           GROUP BY 1
           ORDER BY count DESC
           LIMIT 8`,
          [intervalDays],
        ),
        query(
          `SELECT COALESCE(locale, 'unknown') AS locale, COUNT(*)::int AS count
           FROM page_views
           WHERE created_at >= now() - $1::interval
           GROUP BY 1
           ORDER BY count DESC`,
          [intervalDays],
        ),
        query(
          `SELECT device_type, COUNT(*)::int AS count
           FROM page_views
           WHERE created_at >= now() - $1::interval
           GROUP BY 1
           ORDER BY count DESC`,
          [intervalDays],
        ),
        query(
          `SELECT session_id, path, referrer, locale, device_type, ip_address::text AS ip_address,
                  country, region, city, created_at
           FROM page_views
           ORDER BY created_at DESC
           LIMIT 25`,
        ),
      ]);

    const totalRow = totals.rows[0] ?? { views: 0, sessions: 0 };
    const todayRow = today.rows[0] ?? { views: 0, sessions: 0 };

    const devices = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    for (const row of byDevice.rows) {
      if (row.device_type in devices) {
        devices[row.device_type] = row.count;
      } else {
        devices.unknown += row.count;
      }
    }

    res.json({
      periodDays: days,
      totals: {
        views: totalRow.views,
        sessions: totalRow.sessions,
      },
      today: {
        views: todayRow.views,
        sessions: todayRow.sessions,
      },
      viewsByDay: byDay.rows.map((row) => ({
        day: row.day,
        views: row.views,
        sessions: row.sessions,
      })),
      topCountries: byCountry.rows.map((row) => ({
        country: row.country === 'ZZ' ? null : row.country,
        label: countryLabel(row.country === 'ZZ' ? null : row.country),
        count: row.count,
      })),
      topReferrers: byReferrer.rows.map((row) => ({
        referrer: row.referrer === 'direct' ? null : row.referrer,
        label: normalizeReferrer(row.referrer === 'direct' ? null : row.referrer),
        count: row.count,
      })),
      locales: byLocale.rows.map((row) => ({
        locale: row.locale,
        count: row.count,
      })),
      devices,
      recentViews: recent.rows.map((row) => ({
        sessionId: row.session_id,
        path: row.path,
        referrer: row.referrer,
        referrerLabel: normalizeReferrer(row.referrer),
        locale: row.locale,
        deviceType: row.device_type,
        ipAddress: maskIp(row.ip_address),
        country: row.country,
        countryLabel: countryLabel(row.country),
        region: row.region,
        city: row.city,
        location: [row.city, row.region, countryLabel(row.country)].filter(Boolean).join(', ') || 'Unknown',
        createdAt: row.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});
