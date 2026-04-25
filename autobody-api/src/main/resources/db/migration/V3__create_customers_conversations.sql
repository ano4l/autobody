CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150),
  phone VARCHAR(30) UNIQUE,
  email VARCHAR(150),
  vehicle_make VARCHAR(80),
  vehicle_model VARCHAR(80),
  vehicle_year INT,
  vehicle_vin VARCHAR(30),
  source VARCHAR(20) DEFAULT 'WHATSAPP' CHECK (source IN ('WHATSAPP','WALK_IN','WEB','SHOPIFY')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id),
  wa_thread_id VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ESCALATED','RESOLVED','TIMED_OUT')),
  bot_step VARCHAR(30) DEFAULT 'GREETING',
  escalated BOOLEAN DEFAULT FALSE,
  escalated_to BIGINT REFERENCES users(id),
  part_request TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND')),
  content TEXT,
  media_url TEXT,
  wa_message_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_conversations_wa_thread ON conversations(wa_thread_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
