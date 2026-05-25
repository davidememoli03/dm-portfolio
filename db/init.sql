CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
    CREATE TYPE message_status AS ENUM ('new', 'read', 'archived', 'spam');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  subject       TEXT,
  message       TEXT NOT NULL,
  locale        TEXT NOT NULL DEFAULT 'it',
  status        message_status NOT NULL DEFAULT 'new',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at       TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_status_created ON messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages (email);

CREATE TABLE IF NOT EXISTS admin_audit (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  message_id  UUID REFERENCES messages(id) ON DELETE SET NULL,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit (created_at DESC);

CREATE TABLE IF NOT EXISTS page_views (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    TEXT NOT NULL,
  path          TEXT NOT NULL DEFAULT '/',
  referrer      TEXT,
  locale        TEXT,
  user_agent    TEXT,
  device_type   TEXT NOT NULL DEFAULT 'unknown',
  ip_address    INET,
  country       TEXT,
  region        TEXT,
  city          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views (country);
