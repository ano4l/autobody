-- Seed a default ADMIN user for first login.
-- Email:    admin@autobody.local
-- Password: Admin@1234   (bcrypt strength 12) — CHANGE ON FIRST LOGIN.
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'System Admin',
  'admin@autobody.local',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN3YCQzqW6e',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
