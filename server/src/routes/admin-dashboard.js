import { Router } from 'express';

import { query } from '../db.js';
import { countryLabel } from '../lib/geoip.js';
import { analyticsOverviewQuerySchema } from '../lib/validation.js';
import { requireAdmin } from '../middleware/auth.js';

const MESSAGE_STATUSES = ['new', 'read', 'archived', 'spam'];

export const adminDashboardRouter = Router();

adminDashboardRouter.use(requireAdmin);

adminDashboardRouter.get('/overview', async (req, res, next) => {
  try {
    const { days } = analyticsOverviewQuerySchema.parse(req.query);
    const intervalDays = `${days} days`;

    const [
      messagesByStatus,
      messagesToday,
      messagesByDay,
      recentMessages,
      viewsTotals,
      viewsToday,
      viewsByDay,
      topCountries,
      byDevice,
    ] = await Promise.all([
      query(`SELECT status, COUNT(*)::int AS count FROM messages GROUP BY status`),
      query(
        `SELECT COUNT(*)::int AS count FROM messages WHERE created_at >= date_trunc('day', now())`,
      ),
      query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
         FROM messages
         WHERE created_at >= now() - $1::interval
         GROUP BY 1
         ORDER BY 1 ASC`,
        [intervalDays],
      ),
      query(
        `SELECT id, name, email, subject, status, created_at
         FROM messages
         ORDER BY created_at DESC
         LIMIT 5`,
      ),
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
         LIMIT 5`,
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
    ]);

    const statusCounts = Object.fromEntries(MESSAGE_STATUSES.map((status) => [status, 0]));
    for (const row of messagesByStatus.rows) {
      statusCounts[row.status] = row.count;
    }

    const devices = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    for (const row of byDevice.rows) {
      if (row.device_type in devices) {
        devices[row.device_type] = row.count;
      } else {
        devices.unknown += row.count;
      }
    }

    const viewsRow = viewsTotals.rows[0] ?? { views: 0, sessions: 0 };
    const viewsTodayRow = viewsToday.rows[0] ?? { views: 0, sessions: 0 };
    const messagesTodayRow = messagesToday.rows[0] ?? { count: 0 };

    res.json({
      periodDays: days,
      messages: {
        byStatus: statusCounts,
        total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        today: messagesTodayRow.count,
        byDay: messagesByDay.rows.map((row) => ({ day: row.day, count: row.count })),
        recent: recentMessages.rows.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          subject: row.subject,
          status: row.status,
          createdAt: row.created_at,
        })),
      },
      traffic: {
        totals: { views: viewsRow.views, sessions: viewsRow.sessions },
        today: { views: viewsTodayRow.views, sessions: viewsTodayRow.sessions },
        byDay: viewsByDay.rows.map((row) => ({
          day: row.day,
          views: row.views,
          sessions: row.sessions,
        })),
        topCountries: topCountries.rows.map((row) => ({
          country: row.country === 'ZZ' ? null : row.country,
          label: countryLabel(row.country === 'ZZ' ? null : row.country),
          count: row.count,
        })),
        devices,
      },
    });
  } catch (err) {
    next(err);
  }
});
