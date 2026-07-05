-- Sistema avtorizacii i roley RazPC

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    code VARCHAR(30) PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    description VARCHAR(200),
    level INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Spravochnik roley (level = uroven dostupa)
INSERT INTO roles (code, title, description, level) VALUES
('admin', 'Administrator', 'Polniy dostup ko vsem funkciyam i vydacha roley', 100),
('manager', 'Menedzher', 'Rabota s zakazami i zayavkami', 60),
('builder', 'Sborshchik', 'Rabota so sborkami i konfiguraciyami', 50),
('moderator', 'Moderator', 'Moderaciya kontenta i otzyvov', 40),
('forum', 'Uchastnik foruma', 'Rasshirennye prava na forume', 20),
('member', 'Uchastnik', 'Obychniy zaregistrirovanniy polzovatel', 10)
ON CONFLICT (code) DO NOTHING;