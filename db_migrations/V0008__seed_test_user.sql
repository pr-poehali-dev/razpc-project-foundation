-- Testoviy polzovatel dlya avtotestov auth (parol: secret123)
-- hash format: salt$pbkdf2_sha256
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'test_auth@example.com',
  'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6$0000000000000000000000000000000000000000000000000000000000000000',
  'Test Auth',
  'member'
)
ON CONFLICT (email) DO NOTHING;