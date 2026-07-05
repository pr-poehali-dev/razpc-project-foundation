-- Hranilishche redaktiruemogo kontenta sayta (inline-editor)

CREATE TABLE IF NOT EXISTS site_content (
    content_key VARCHAR(120) PRIMARY KEY,
    content_value TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_site_content_updated ON site_content(updated_at);