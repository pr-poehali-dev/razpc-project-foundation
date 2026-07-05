-- ============================================================
-- MODUL SKLAD (WAREHOUSE) - centralnyy modul upravleniya zapasami
-- Yadro: inventory_items. Iz nego v budushchem berut dannye:
-- katalog, konfigurator, sborki, CRM, zakazy, analitika.
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    phone VARCHAR(50),
    email VARCHAR(200),
    website VARCHAR(300),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(120) NOT NULL,
    icon VARCHAR(60),
    sort_order INTEGER DEFAULT 0,
    component_type VARCHAR(40),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS storage_locations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(120) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    category_id INTEGER REFERENCES inventory_categories(id),
    manufacturer VARCHAR(150),
    model VARCHAR(200),
    serial_number VARCHAR(200),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_qty INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 2,
    purchase_price NUMERIC(12,2) DEFAULT 0,
    avg_purchase_price NUMERIC(12,2) DEFAULT 0,
    last_purchase_price NUMERIC(12,2) DEFAULT 0,
    sale_price NUMERIC(12,2) DEFAULT 0,
    condition VARCHAR(30) DEFAULT 'new',
    status VARCHAR(40) DEFAULT 'in_stock',
    supplier_id INTEGER REFERENCES suppliers(id),
    location_id INTEGER REFERENCES storage_locations(id),
    photo_url VARCHAR(500),
    specs JSONB DEFAULT '{}'::jsonb,
    component_id INTEGER,
    received_at DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inv_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inv_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inv_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inv_location ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inv_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inv_serial ON inventory_items(serial_number);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES inventory_items(id),
    operation VARCHAR(30) NOT NULL,
    qty_change INTEGER NOT NULL DEFAULT 0,
    qty_after INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,2),
    from_location_id INTEGER REFERENCES storage_locations(id),
    to_location_id INTEGER REFERENCES storage_locations(id),
    order_id INTEGER,
    build_id INTEGER,
    supplier_id INTEGER REFERENCES suppliers(id),
    comment TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mov_item ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_mov_operation ON inventory_movements(operation);
CREATE INDEX IF NOT EXISTS idx_mov_created ON inventory_movements(created_at DESC);

CREATE TABLE IF NOT EXISTS inventory_price_history (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES inventory_items(id),
    price_type VARCHAR(20) NOT NULL,
    old_price NUMERIC(12,2),
    new_price NUMERIC(12,2),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_price_item ON inventory_price_history(item_id);

CREATE TABLE IF NOT EXISTS inventory_audits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    status VARCHAR(20) DEFAULT 'open',
    started_by INTEGER REFERENCES users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_audit_lines (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER NOT NULL REFERENCES inventory_audits(id),
    item_id INTEGER NOT NULL REFERENCES inventory_items(id),
    expected_qty INTEGER NOT NULL DEFAULT 0,
    actual_qty INTEGER,
    discrepancy INTEGER,
    comment TEXT,
    checked_by INTEGER REFERENCES users(id),
    checked_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_line_audit ON inventory_audit_lines(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_line_item ON inventory_audit_lines(item_id);

INSERT INTO inventory_categories (code, title, icon, component_type, sort_order) VALUES
    ('cpu', 'Процессоры', 'Cpu', 'CPU', 10),
    ('gpu', 'Видеокарты', 'Gpu', 'GPU', 20),
    ('motherboard', 'Материнские платы', 'CircuitBoard', 'MOTHERBOARD', 30),
    ('ram', 'Оперативная память', 'MemoryStick', 'RAM', 40),
    ('ssd', 'SSD', 'HardDrive', 'SSD', 50),
    ('hdd', 'HDD', 'HardDrive', 'HDD', 60),
    ('psu', 'Блоки питания', 'Plug', 'PSU', 70),
    ('case', 'Корпуса', 'Box', 'CASE', 80),
    ('cooling', 'Системы охлаждения', 'Snowflake', NULL, 90),
    ('fans', 'Вентиляторы', 'Fan', NULL, 100),
    ('monitor', 'Мониторы', 'Monitor', NULL, 110),
    ('peripheral', 'Периферия', 'Keyboard', NULL, 120),
    ('cables', 'Кабели', 'Cable', NULL, 130),
    ('other', 'Прочее', 'Package', NULL, 140)
ON CONFLICT (code) DO NOTHING;

INSERT INTO storage_locations (code, title, sort_order) VALUES
    ('main', 'Основной склад', 10),
    ('showcase', 'Витрина', 20),
    ('workshop', 'Мастерская', 30),
    ('transit', 'В пути', 40)
ON CONFLICT (code) DO NOTHING;