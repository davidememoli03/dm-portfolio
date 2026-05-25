import { Router } from 'express';

import { query, withClient } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { listMessagesQuerySchema, updateMessageSchema } from '../lib/validation.js';

async function logAudit(client, action, messageId, ipAddress) {
  await client.query(
    `INSERT INTO admin_audit (action, message_id, ip_address) VALUES ($1, $2, $3)`,
    [action, messageId, ipAddress],
  );
}

function messageRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    locale: row.locale,
    status: row.status,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
    readAt: row.read_at,
    updatedAt: row.updated_at,
  };
}

function messageSummary(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    preview: row.message.length > 240 ? `${row.message.slice(0, 240)}...` : row.message,
    locale: row.locale,
    status: row.status,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

export const adminMessagesRouter = Router();

adminMessagesRouter.use(requireAdmin);

adminMessagesRouter.get('/', async (req, res, next) => {
  try {
    const { status, search, page, pageSize } = listMessagesQuerySchema.parse(req.query);

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(
        `(name ILIKE $${idx} OR email ILIKE $${idx} OR subject ILIKE $${idx} OR message ILIKE $${idx})`,
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM messages ${where}`, params);
    const total = countResult.rows[0]?.total ?? 0;

    const offset = (page - 1) * pageSize;
    const listParams = [...params, pageSize, offset];
    const listResult = await query(
      `SELECT id, name, email, subject, message, locale, status, created_at, read_at
       FROM messages
       ${where}
       ORDER BY created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    res.json({
      items: listResult.rows.map(messageSummary),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

adminMessagesRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await withClient(async (client) => {
      const existing = await client.query(
        `SELECT * FROM messages WHERE id = $1`,
        [id],
      );

      if (existing.rowCount === 0) {
        throw new ApiError(404, 'Message not found');
      }

      const row = existing.rows[0];

      if (row.status === 'new') {
        const updated = await client.query(
          `UPDATE messages
             SET status = 'read', read_at = now(), updated_at = now()
             WHERE id = $1
             RETURNING *`,
          [id],
        );
        await logAudit(client, 'mark_read', id, req.ip ?? null);
        return updated.rows[0];
      }

      return row;
    });

    res.json(messageRow(message));
  } catch (err) {
    next(err);
  }
});

adminMessagesRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateMessageSchema.parse(req.body ?? {});

    const updated = await withClient(async (client) => {
      const result = await client.query(
        `UPDATE messages
           SET status = $2::message_status,
               read_at = CASE
                 WHEN $2::text = 'read' AND read_at IS NULL THEN now()
                 WHEN $2::text = 'new' THEN NULL
                 ELSE read_at
               END,
               updated_at = now()
           WHERE id = $1
           RETURNING *`,
        [id, status],
      );

      if (result.rowCount === 0) {
        throw new ApiError(404, 'Message not found');
      }

      await logAudit(client, `status:${status}`, id, req.ip ?? null);
      return result.rows[0];
    });

    res.json(messageRow(updated));
  } catch (err) {
    next(err);
  }
});

adminMessagesRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await withClient(async (client) => {
      const result = await client.query(`DELETE FROM messages WHERE id = $1`, [id]);
      if (result.rowCount === 0) {
        throw new ApiError(404, 'Message not found');
      }
      await logAudit(client, 'delete', null, req.ip ?? null);
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
