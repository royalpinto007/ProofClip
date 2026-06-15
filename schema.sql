-- ProofClip schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS accounts (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  api_key     TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'free',  -- free | starter | pro | agency
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS spaces (
  id          TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  accent      TEXT NOT NULL DEFAULT '#6366f1',
  logo_url    TEXT,
  branding    INTEGER NOT NULL DEFAULT 1,     -- 1 = show "Powered by ProofClip"
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
CREATE INDEX IF NOT EXISTS idx_spaces_account ON spaces(account_id);

CREATE TABLE IF NOT EXISTS testimonials (
  id          TEXT PRIMARY KEY,
  space_id    TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'form',   -- form | screenshot | x | instagram | gumroad | youtube | manual
  name        TEXT,
  handle      TEXT,
  company     TEXT,
  avatar_url  TEXT,
  rating      INTEGER,                         -- 1..5, null if not given
  text        TEXT,
  image_url   TEXT,                            -- screenshot import
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | approved | hidden
  permission  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (space_id) REFERENCES spaces(id)
);
CREATE INDEX IF NOT EXISTS idx_testimonials_space ON testimonials(space_id, status);

CREATE TABLE IF NOT EXISTS widgets (
  id          TEXT PRIMARY KEY,
  space_id    TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'wall',    -- wall | grid | carousel | single
  config      TEXT NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (space_id) REFERENCES spaces(id)
);
CREATE INDEX IF NOT EXISTS idx_widgets_space ON widgets(space_id);

CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  space_id    TEXT NOT NULL,
  widget_id   TEXT,
  testimonial_id TEXT,
  type        TEXT NOT NULL,                   -- view | click
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_space ON events(space_id, type);

CREATE TABLE IF NOT EXISTS api_key_resets (
  id          TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
CREATE INDEX IF NOT EXISTS idx_api_key_resets_token ON api_key_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_api_key_resets_account ON api_key_resets(account_id);
