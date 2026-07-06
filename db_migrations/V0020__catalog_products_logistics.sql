-- ============ RazPC: katalog komplektuyushchih + logistika ============

-- Postavshchiki (dropshipping)
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    lead_days INTEGER NOT NULL DEFAULT 3,        -- srok postavki do masterskoy
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kategorii tovarov (rasshiryaemo)
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(40) UNIQUE NOT NULL,            -- cpu, gpu, monitor, ...
    title VARCHAR(80) NOT NULL,
    icon VARCHAR(40) NOT NULL DEFAULT 'Package',
    -- svyaz s konfiguratorom: kakomu slotu sootvetstvuet (null = ne uchastvuet)
    config_slot VARCHAR(40),                      -- cpu|motherboard|gpu|ram|storage|psu|cooler|case|fan
    sort_order INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tovary (komplektuyushchie)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES product_categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    brand VARCHAR(60) NOT NULL,
    name VARCHAR(180) NOT NULL,
    condition VARCHAR(10) NOT NULL DEFAULT 'new', -- new|used
    -- ceny (dropshipping)
    purchase_price INTEGER NOT NULL DEFAULT 0,    -- zakupochnaya
    price INTEGER NOT NULL DEFAULT 0,             -- roznichnaya
    old_price INTEGER,
    -- nalichie / sroki
    in_stock BOOLEAN NOT NULL DEFAULT FALSE,      -- na sklade masterskoy => lead 0
    stock_qty INTEGER NOT NULL DEFAULT 0,
    warranty_months INTEGER NOT NULL DEFAULT 12,
    -- ves i gabarity dlya rascheta dostavki
    weight_g INTEGER NOT NULL DEFAULT 500,
    length_mm INTEGER NOT NULL DEFAULT 200,
    width_mm INTEGER NOT NULL DEFAULT 150,
    height_mm INTEGER NOT NULL DEFAULT 60,
    -- kontent
    short_desc VARCHAR(400),
    image_url TEXT,
    images JSONB NOT NULL DEFAULT '[]',           -- galereya
    short_specs JSONB NOT NULL DEFAULT '[]',      -- ['4 yadra', ...]
    -- strukturirovannye harakteristiki po razdelam:
    -- { "Obshchie": {"Socket":"AM5"}, "Pamyat": {...} }
    specs JSONB NOT NULL DEFAULT '{}',
    -- ploskie polya sovmestimosti (dlya konfiguratora, bez dublirovaniya v UI)
    compat JSONB NOT NULL DEFAULT '{}',           -- {"socket":"AM5","memoryType":"DDR5",...}
    perf_score INTEGER,                           -- dlya ocenki proizvoditelnosti
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Goroda (spravochnik)
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    region VARCHAR(120),
    zone INTEGER NOT NULL DEFAULT 3,              -- zona dostavki 1..4
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 100
);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Punkty vydachi (PVZ) - universalnaya struktura (provider dlya budushchih sluzhb)
CREATE TABLE IF NOT EXISTS pickup_points (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(30) NOT NULL DEFAULT 'cdek',
    external_code VARCHAR(60),
    city_id INTEGER NOT NULL REFERENCES cities(id),
    address VARCHAR(300) NOT NULL,
    work_hours VARCHAR(120),
    lat NUMERIC(10,6),
    lon NUMERIC(10,6),
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_pvz_city ON pickup_points(city_id);

-- Ves i gabarity dlya gotovyh PK
ALTER TABLE builds ADD COLUMN IF NOT EXISTS weight_g INTEGER NOT NULL DEFAULT 9000;
ALTER TABLE builds ADD COLUMN IF NOT EXISTS length_mm INTEGER NOT NULL DEFAULT 500;
ALTER TABLE builds ADD COLUMN IF NOT EXISTS width_mm INTEGER NOT NULL DEFAULT 250;
ALTER TABLE builds ADD COLUMN IF NOT EXISTS height_mm INTEGER NOT NULL DEFAULT 500;