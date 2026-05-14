-- Datos iniciales (categorías + usuarios demo). Ejecutar después de schema.sql.
-- Los productos vienen en seed-products-generated.sql (node db/generate-seed-products.mjs).

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
  ('demo@cenitpi.com', 'Demo Comprador', 'customer', NULL),
  ('vendedor@cenitpi.com', 'Vendedor Demo', 'seller', NULL),
  ('admin@cenitpi.com', 'Admin Demo', 'admin', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);
