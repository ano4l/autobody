CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(100),
  phone VARCHAR(30),
  email VARCHAR(150),
  lead_time_days INT DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parts (
  id BIGSERIAL PRIMARY KEY,
  sku VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  make VARCHAR(80),
  model VARCHAR(80),
  year_range_start INT,
  year_range_end INT,
  qty_on_hand INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 2,
  cost_price NUMERIC(12,2),
  sell_price NUMERIC(12,2) NOT NULL,
  location VARCHAR(80),
  supplier_id BIGINT REFERENCES suppliers(id),
  shopify_product_id VARCHAR(100),
  shopify_variant_id VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_movements (
  id BIGSERIAL PRIMARY KEY,
  part_id BIGINT NOT NULL REFERENCES parts(id),
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('SALE','RECEIVE','ADJUST','WRITE_OFF','RETURN')),
  qty INT NOT NULL,
  reference VARCHAR(100),
  notes TEXT,
  performed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parts_sku ON parts(sku);
CREATE INDEX idx_parts_make_model ON parts(make, model);
CREATE INDEX idx_parts_active ON parts(active);
CREATE INDEX idx_stock_movements_part ON stock_movements(part_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);
