-- Katalog RazPC: komplektuyushchie, sborki i ih svyazi

CREATE TABLE IF NOT EXISTS components (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    spec VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS builds (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    tagline VARCHAR(200),
    price INTEGER NOT NULL,
    old_price INTEGER,
    image_url TEXT,
    tier VARCHAR(40),
    performance_badge VARCHAR(60),
    status VARCHAR(20) DEFAULT 'in_stock',
    warranty VARCHAR(60) DEFAULT '3 goda',
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS build_components (
    id SERIAL PRIMARY KEY,
    build_id INTEGER NOT NULL REFERENCES builds(id),
    component_id INTEGER NOT NULL REFERENCES components(id),
    position INTEGER DEFAULT 0,
    is_highlight BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_build_components_build ON build_components(build_id);
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);