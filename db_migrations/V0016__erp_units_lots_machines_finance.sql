-- ============================================================
-- ERP RazPC: model->ekzemplyary, partii, kompyutery, finansy, dolgi
-- ============================================================

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    kind VARCHAR(30) DEFAULT 'cash',
    balance NUMERIC(14,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS counterparties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    kind VARCHAR(30) DEFAULT 'supplier',
    phone VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lots (
    id SERIAL PRIMARY KEY,
    lot_number VARCHAR(30) UNIQUE NOT NULL,
    source VARCHAR(40) DEFAULT 'purchase',
    purchase_method VARCHAR(60),
    supplier_id INTEGER REFERENCES suppliers(id),
    counterparty_id INTEGER REFERENCES counterparties(id),
    account_id INTEGER REFERENCES accounts(id),
    purchase_cost NUMERIC(14,2) DEFAULT 0,
    purchase_date DATE DEFAULT CURRENT_DATE,
    comment TEXT,
    is_disassembly BOOLEAN DEFAULT FALSE,
    machine_title VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lots_source ON lots(source);
CREATE INDEX IF NOT EXISTS idx_lots_supplier ON lots(supplier_id);

CREATE TABLE IF NOT EXISTS product_models (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    category_id INTEGER REFERENCES inventory_categories(id),
    manufacturer VARCHAR(150),
    model VARCHAR(200),
    default_sale_price NUMERIC(12,2) DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 2,
    photo_url VARCHAR(500),
    specs JSONB DEFAULT '{}'::jsonb,
    component_id INTEGER,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pm_category ON product_models(category_id);
CREATE INDEX IF NOT EXISTS idx_pm_sku ON product_models(sku);

CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    machine_number VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(200),
    build_date DATE DEFAULT CURRENT_DATE,
    builder_id INTEGER REFERENCES users(id),
    labor_cost NUMERIC(12,2) DEFAULT 0,
    parts_cost NUMERIC(14,2) DEFAULT 0,
    total_cost NUMERIC(14,2) DEFAULT 0,
    sale_price NUMERIC(14,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'assembling',
    sold_at TIMESTAMP,
    order_id INTEGER,
    owner_customer_id INTEGER REFERENCES customers(id),
    comment TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

CREATE TABLE IF NOT EXISTS inventory_units (
    id SERIAL PRIMARY KEY,
    unit_number VARCHAR(30) UNIQUE NOT NULL,
    model_id INTEGER NOT NULL REFERENCES product_models(id),
    serial_number VARCHAR(200),
    lot_id INTEGER REFERENCES lots(id),
    machine_id INTEGER REFERENCES machines(id),
    condition VARCHAR(30) DEFAULT 'new',
    status VARCHAR(40) DEFAULT 'in_stock',
    location_id INTEGER REFERENCES storage_locations(id),
    purchase_cost NUMERIC(12,2) DEFAULT 0,
    sale_price NUMERIC(12,2) DEFAULT 0,
    sold_price NUMERIC(12,2),
    sold_at TIMESTAMP,
    order_id INTEGER,
    sold_to_customer_id INTEGER REFERENCES customers(id),
    received_at DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_units_model ON inventory_units(model_id);
CREATE INDEX IF NOT EXISTS idx_units_lot ON inventory_units(lot_id);
CREATE INDEX IF NOT EXISTS idx_units_machine ON inventory_units(machine_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON inventory_units(status);
CREATE INDEX IF NOT EXISTS idx_units_serial ON inventory_units(serial_number);

CREATE TABLE IF NOT EXISTS unit_events (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES inventory_units(id),
    event_type VARCHAR(40) NOT NULL,
    comment TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    machine_id INTEGER REFERENCES machines(id),
    lot_id INTEGER REFERENCES lots(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_uevents_unit ON unit_events(unit_id);

CREATE TABLE IF NOT EXISTS machine_events (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    event_type VARCHAR(40) NOT NULL,
    comment TEXT,
    unit_id INTEGER REFERENCES inventory_units(id),
    customer_id INTEGER REFERENCES customers(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mevents_machine ON machine_events(machine_id);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    op_type VARCHAR(30) NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    direction INTEGER NOT NULL DEFAULT 1,
    to_account_id INTEGER REFERENCES accounts(id),
    comment TEXT,
    lot_id INTEGER REFERENCES lots(id),
    unit_id INTEGER REFERENCES inventory_units(id),
    machine_id INTEGER REFERENCES machines(id),
    order_id INTEGER,
    counterparty_id INTEGER REFERENCES counterparties(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(op_type);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    counterparty_id INTEGER NOT NULL REFERENCES counterparties(id),
    kind VARCHAR(20) NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    comment TEXT,
    due_date DATE,
    lot_id INTEGER REFERENCES lots(id),
    order_id INTEGER,
    is_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_debts_cp ON debts(counterparty_id);

CREATE TABLE IF NOT EXISTS erp_counters (
    name VARCHAR(30) PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
);
INSERT INTO erp_counters (name, value) VALUES ('unit', 0), ('lot', 0), ('machine', 0)
ON CONFLICT (name) DO NOTHING;