import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  subject: z
    .string()
    .trim()
    .max(150)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(['it', 'en']).optional().default('it'),
  hp_field: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

const MESSAGE_STATUSES = ['new', 'read', 'archived', 'spam'];

export const messageStatusSchema = z.enum(MESSAGE_STATUSES);

export const updateMessageSchema = z.object({
  status: messageStatusSchema,
});

export const listMessagesQuerySchema = z.object({
  status: messageStatusSchema.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const pageViewSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  path: z.string().trim().max(200).optional().default('/'),
  locale: z.enum(['it', 'en']).optional(),
  referrer: z.string().trim().max(500).optional(),
});

export const analyticsOverviewQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});
