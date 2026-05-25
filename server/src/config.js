function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback = '') {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function intOption(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolOption(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === '1' || raw.toLowerCase() === 'true';
}

const nodeEnv = optional('NODE_ENV', 'development');
const isProd = nodeEnv === 'production';

export const config = {
  nodeEnv,
  isProd,
  port: intOption('PORT', 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  admin: {
    username: required('ADMIN_USERNAME'),
    passwordHash: required('ADMIN_PASSWORD_HASH'),
  },
  cookie: {
    name: 'dm_admin_token',
    secure: boolOption('COOKIE_SECURE', isProd),
    maxAgeMs: 15 * 60 * 1000,
  },
  contact: {
    perHour: intOption('CONTACT_RATE_LIMIT_PER_HOUR', 5),
  },
  mailer: {
    host: optional('SMTP_HOST'),
    port: intOption('SMTP_PORT', 587),
    user: optional('SMTP_USER'),
    password: optional('SMTP_PASSWORD'),
    from: optional('MAIL_FROM'),
    to: optional('MAIL_TO'),
    adminUrl: optional('ADMIN_URL'),
  },
};

export const SUPPORTED_LOCALES = ['it', 'en'];
export const DEFAULT_LOCALE = 'it';
