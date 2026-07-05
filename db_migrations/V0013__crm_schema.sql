-- ============ CRM: klienty, zakazy, pozicii, istoriya statusov, zayavki ============

-- Klienty (edinaya baza pokupateley, dlya poiska garantiy i povtornyh prodazh)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    phone VARCHAR(40),
    email VARCHAR(160),
    telegram VARCHAR(80),
    city VARCHAR(120),
    notes TEXT,
    total_spent BIGINT DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Zakazy. Status - polnaya voronka.
-- status: new | approval | paid | assembly | ready | delivered | canceled
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    build_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    source VARCHAR(30) NOT NULL DEFAULT 'manual',   -- site_form | manual | import
    title VARCHAR(200),
    total_amount BIGINT DEFAULT 0,
    paid_amount BIGINT DEFAULT 0,
    cost_amount BIGINT DEFAULT 0,                    -- sebestoimost (dlya finansov)
    comment TEXT,
    manager_id INTEGER,
    warranty_months INTEGER DEFAULT 36,
    warranty_until DATE,
    purchase_date DATE,                              -- data prodazhi (dlya starych zakazov / garantii)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Pozicii zakaza (tovary/uslugi vnutri zakaza)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    name VARCHAR(200) NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    price BIGINT NOT NULL DEFAULT 0,
    cost BIGINT NOT NULL DEFAULT 0,
    position INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Istoriya smeny statusov (dlya otslezhivaniya raboty i analitiki)
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    comment TEXT,
    changed_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);

-- Zayavki / lidy s sayta (do prevrasheniya v zakaz)
-- status: new | in_work | converted | rejected
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160),
    phone VARCHAR(40),
    email VARCHAR(160),
    message TEXT,
    build_id INTEGER,
    build_name VARCHAR(200),
    source VARCHAR(40) NOT NULL DEFAULT 'site',      -- site_buy | site_contact | configurator
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    order_id INTEGER REFERENCES orders(id),
    manager_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);