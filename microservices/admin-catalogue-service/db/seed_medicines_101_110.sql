-- Seed medicines for admin_catalogue_db
-- Inserts medicines with IDs 101..110 to match sample orders
-- Run: mysql -u root -pRohin admin_catalogue_db < seed_medicines_101_110.sql

USE admin_catalogue_db;

START TRANSACTION;

LOCK TABLES `medicines` WRITE;

INSERT INTO `medicines` (
  `id`,
  `name`,
  `description`,
  `price`,
  `category`,
  `sku`,
  `requires_rx`,
  `total_quantity`,
  `in_stock`,
  `created_at`,
  `updated_at`
) VALUES
  (101, 'Paracetamol 500mg', 'Paracetamol 500mg tablet - pain reliever and fever reducer', 5.50, 'Analgesic', 'MED101', 0, 120, b'1', NOW(), NOW()),
  (102, 'Amoxicillin 250mg', 'Amoxicillin 250mg capsule - antibiotic', 12.00, 'Antibiotic', 'MED102', 1, 80, b'1', NOW(), NOW()),
  (103, 'Atorvastatin 10mg', 'Atorvastatin 10mg - cholesterol lowering agent', 18.50, 'Cardiac', 'MED103', 1, 60, b'1', NOW(), NOW()),
  (104, 'Omeprazole 20mg', 'Omeprazole 20mg - proton pump inhibitor', 8.75, 'Gastro', 'MED104', 0, 90, b'1', NOW(), NOW()),
  (105, 'Hydrocortisone Cream 1%', 'Topical hydrocortisone 1% for mild inflammations', 6.25, 'Dermatology', 'MED105', 0, 120, b'1', NOW(), NOW()),
  (106, 'Ibuprofen 200mg', 'Ibuprofen 200mg tablet - NSAID for pain and inflammation', 7.00, 'Analgesic', 'MED106', 0, 100, b'1', NOW(), NOW()),
  (107, 'Salbutamol Inhaler', 'Salbutamol inhaler 100mcg - bronchodilator', 220.00, 'Respiratory', 'MED107', 1, 40, b'1', NOW(), NOW()),
  (108, 'Vitamin D 1000IU', 'Vitamin D3 1000 IU softgel supplement', 9.99, 'Supplements', 'MED108', 0, 75, b'1', NOW(), NOW()),
  (109, 'Cough Syrup 100ml', 'Cough syrup - expectorant formulation', 45.00, 'Analgesic', 'MED109', 0, 110, b'1', NOW(), NOW()),
  (110, 'Special Chemotherapy Drug', 'Placeholder high-value oncology drug sample', 1299.00, 'Oncology', 'MED110', 1, 20, b'1', NOW(), NOW());

UNLOCK TABLES;

COMMIT;

-- Verify inserted rows
-- SELECT id, name, category, price, requires_rx, sku FROM medicines WHERE id BETWEEN 101 AND 110 ORDER BY id;

-- If these IDs already exist in your DB and you want to upsert instead of failing, use the following variant:
-- INSERT INTO `medicines` (id, name, description, price, category, sku, requires_rx, total_quantity, in_stock)
-- VALUES (...)
-- ON DUPLICATE KEY UPDATE
--   category=VALUES(category), name=VALUES(name), price=VALUES(price), requires_rx=VALUES(requires_rx), sku=VALUES(sku), description=VALUES(description);
