-- Datos iniciales (categorías + usuarios demo). Ejecutar después de schema.sql.
-- Los productos vienen en seed-products-generated.sql (node db/generate-seed-products.mjs).
-- Contraseña de las cuentas demo (todas): Demo1234
-- (hashes scrypt generados por la app; ver src/backend/auth/password.ts)

USE shopsmart;

SET NAMES utf8mb4;

INSERT INTO categories (slug, name) VALUES
  ('electronica', 'Electrónica'),
  ('hogar', 'Hogar y Cocina'),
  ('supermercado', 'Supermercado'),
  ('moda', 'Moda'),
  ('deportes', 'Deportes'),
  ('libros', 'Libros')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (email, name, role, password_hash) VALUES
  ('demo@cenitpi.com', 'Demo Comprador', 'customer', 'scrypt$38d5bb1f31d3b374f4ffcbcc9918e88d$944f997763d9c158e40053aa4b1f5fa82dce99708a8e7f37f2166521f0c3b280'),
  ('vendedor@cenitpi.com', 'Vendedor Demo', 'seller', 'scrypt$e550585dfc99648b408a54feb2d67ea6$3383840f1c40d692152cd9dd23c202ca3c456d3b95c4df19828db2005f203c33'),
  ('admin@cenitpi.com', 'Admin Demo', 'admin', 'scrypt$5008db3fb7df5ccfbebb363a89ba4f6a$3241d96b11f433a6ce4131470be41191ecc8bf8b8713f9b046731ca0a243d5f9')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash);
