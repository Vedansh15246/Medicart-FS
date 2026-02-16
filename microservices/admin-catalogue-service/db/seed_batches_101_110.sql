-- Seed batches for admin_catalogue_db to power sales-by-category
-- Uses columns from admin_catalogue_db schema: batch_number, expiry_date, quantity_available, quantity_total, selling_price, medicine_id
-- Run: mysql -u root -pRohin admin_catalogue_db < seed_batches_101_110.sql

USE admin_catalogue_db;

START TRANSACTION;

LOCK TABLES `batches` WRITE;

INSERT INTO `batches` (
  `batch_number`,
  `expiry_date`,
  `quantity_available`,
  `quantity_total`,
  `selling_price`,
  `medicine_id`
) VALUES
  ('B-101-A', '2027-12-31', 40, 100, 5.50, 101),
  ('B-102-A', '2027-10-15', 20, 80, 12.00, 102),
  ('B-103-A', '2028-01-20', 15, 60, 18.50, 103),
  ('B-104-A', '2027-08-10', 35, 90, 8.75, 104),
  ('B-105-A', '2027-06-05', 50, 120, 6.25, 105),
  ('B-106-A', '2027-11-25', 30, 100, 7.00, 106),
  ('B-107-A', '2026-12-31', 10, 40, 220.00, 107),
  ('B-108-A', '2028-03-30', 25, 75, 9.99, 108),
  ('B-109-A', '2027-05-01', 60, 110, 45.00, 109),
  ('B-110-A', '2027-09-01', 5, 20, 1299.00, 110);

UNLOCK TABLES;

COMMIT;

-- Verify
-- SELECT id, batch_number, medicine_id, quantity_total, quantity_available, selling_price FROM batches WHERE medicine_id BETWEEN 101 AND 110;
