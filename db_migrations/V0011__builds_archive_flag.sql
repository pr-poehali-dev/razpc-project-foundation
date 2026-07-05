-- Arhivirovanie sborok: skrytie iz kataloga bez udaleniya

ALTER TABLE builds ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_builds_archived ON builds(is_archived);