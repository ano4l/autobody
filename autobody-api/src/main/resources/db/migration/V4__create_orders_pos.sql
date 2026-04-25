CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id),
  source VARCHAR(20) NOT NULL CHECK (source IN ('WALK_IN','SHOPIFY','WHATSAPP','WEB')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','FULFILLED','CANCELLED','REFUNDED')),
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  shopify_order_id VARCHAR(100),
  notes TEXT,
  handled_by BIGINT REFERENCES users(id),
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  part_id BIGINT NOT NULL REFERENCES parts(id),
  qty INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opening_float NUMERIC(10,2) DEFAULT 0,
  closing_float NUMERIC(10,2),
  notes TEXT
);

CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_shopify ON orders(shopify_order_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_part ON order_items(part_id);
CREATE INDEX idx_pos_sessions_user ON pos_sessions(user_id);
CREATE INDEX idx_pos_sessions_open ON pos_sessions(closed_at) WHERE closed_at IS NULL;
