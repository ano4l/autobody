CREATE TABLE posibolt_sync_state (
  id BIGINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  configured BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'NOT_CONFIGURED' CHECK (status IN ('NOT_CONFIGURED','IDLE','RUNNING','SUCCESS','FAILED')),
  last_started_at TIMESTAMPTZ,
  last_finished_at TIMESTAMPTZ,
  last_successful_sync_at TIMESTAMPTZ,
  last_error TEXT,
  products_synced INT NOT NULL DEFAULT 0,
  stock_synced INT NOT NULL DEFAULT 0,
  orders_synced INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO posibolt_sync_state (id) VALUES (1);

ALTER TABLE parts ADD COLUMN posibolt_product_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN posibolt_order_id VARCHAR(100);

CREATE INDEX idx_parts_posibolt_product ON parts(posibolt_product_id);
CREATE INDEX idx_orders_posibolt_order ON orders(posibolt_order_id);
