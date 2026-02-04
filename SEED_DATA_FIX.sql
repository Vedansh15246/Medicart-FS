-- ========================================================================
-- MEDICART SYSTEM - COMPREHENSIVE DATA SEED SCRIPT
-- This script populates all empty tables with test data
-- Run this after importing the database structure
-- ========================================================================

USE `admin_catalogue_db`;

-- ========================================================================
-- DISABLE FOREIGN KEY CHECKS
-- ========================================================================
SET FOREIGN_KEY_CHECKS=0;

-- ========================================================================
-- CLEAR EXISTING DATA
-- ========================================================================
DELETE FROM `batches`;
DELETE FROM `medicines`;
ALTER TABLE `medicines` AUTO_INCREMENT = 1;
ALTER TABLE `batches` AUTO_INCREMENT = 1;

-- ========================================================================
-- 1. INSERT SAMPLE MEDICINES
-- ========================================================================
INSERT INTO `medicines` 
(`name`, `description`, `dosage`, `form`, `manufacturer`, `price`, `requires_prescription`, `status`, `category`, `in_stock`, `requires_rx`, `sku`, `total_quantity`)
VALUES 
('Aspirin', 'Pain reliever and fever reducer', '500mg', 'Tablet', 'Bayer', 150.00, 0, 'ACTIVE', 'Pain Relief', b'1', b'0', 'ASP-001', 500),
('Amoxicillin', 'Antibiotic for bacterial infections', '250mg', 'Capsule', 'GlaxoSmithKline', 250.00, 1, 'ACTIVE', 'Antibiotics', b'1', b'1', 'AMX-001', 300),
('Metformin', 'Diabetes management medication', '500mg', 'Tablet', 'Cipla', 120.00, 1, 'ACTIVE', 'Diabetes', b'1', b'1', 'MET-001', 400),
('Lisinopril', 'Blood pressure medication', '10mg', 'Tablet', 'Lupin', 180.00, 1, 'ACTIVE', 'Cardiac', b'1', b'1', 'LIS-001', 350),
('Atorvastatin', 'Cholesterol management', '20mg', 'Tablet', 'Ranbaxy', 200.00, 1, 'ACTIVE', 'Cardiac', b'1', b'1', 'ATO-001', 400),
('Omeprazole', 'Acid reflux treatment', '20mg', 'Capsule', 'Dr. Reddy\'s', 140.00, 1, 'ACTIVE', 'Gastrointestinal', b'1', b'1', 'OME-001', 350),
('Vitamin D3', 'Vitamin supplement', '1000IU', 'Tablet', 'Nature\'s Bounty', 80.00, 0, 'ACTIVE', 'Vitamins', b'1', b'0', 'VIT-001', 600),
('Cetirizine', 'Antihistamine for allergies', '10mg', 'Tablet', 'Abbott', 90.00, 0, 'ACTIVE', 'Allergies', b'1', b'0', 'CET-001', 450),
('Ibuprofen', 'Anti-inflammatory pain reliever', '400mg', 'Tablet', 'Pfizer', 100.00, 0, 'ACTIVE', 'Pain Relief', b'1', b'0', 'IBU-001', 550),
('Atenolol', 'Beta-blocker for hypertension', '50mg', 'Tablet', 'AstraZeneca', 160.00, 1, 'ACTIVE', 'Cardiac', b'1', b'1', 'ATE-001', 300);

-- ========================================================================
-- 2. INSERT SAMPLE BATCHES (linked to medicines)
-- NOTE: UNIQUE constraint on (medicine_id) allows only ONE batch per medicine
-- ========================================================================
INSERT INTO `batches` 
(`medicine_id`, `batch_number`, `quantity_available`, `quantity_total`, `manufacturing_date`, `expiry_date`, `cost_price`, `selling_price`, `status`)
VALUES 
(1, 'BATCH-ASP-2026-001', 500, 500, '2024-01-15', '2026-01-15', 100.00, 150.00, 'ACTIVE'),
(2, 'BATCH-AMX-2026-001', 300, 300, '2024-01-20', '2026-01-20', 180.00, 250.00, 'ACTIVE'),
(3, 'BATCH-MET-2026-001', 400, 400, '2024-01-10', '2026-01-10', 90.00, 120.00, 'ACTIVE'),
(4, 'BATCH-LIS-2026-001', 350, 350, '2024-01-25', '2026-01-25', 130.00, 180.00, 'ACTIVE'),
(5, 'BATCH-ATO-2026-001', 400, 400, '2024-02-01', '2026-02-01', 150.00, 200.00, 'ACTIVE'),
(6, 'BATCH-OME-2026-001', 350, 350, '2024-01-05', '2026-01-05', 100.00, 140.00, 'ACTIVE'),
(7, 'BATCH-VIT-2026-001', 600, 600, '2024-01-30', '2026-01-30', 50.00, 80.00, 'ACTIVE'),
(8, 'BATCH-CET-2026-001', 450, 450, '2024-02-05', '2026-02-05', 60.00, 90.00, 'ACTIVE'),
(9, 'BATCH-IBU-2026-001', 550, 550, '2024-01-12', '2026-01-12', 70.00, 100.00, 'ACTIVE'),
(10, 'BATCH-ATE-2026-001', 300, 300, '2024-01-28', '2026-01-28', 110.00, 160.00, 'ACTIVE');

-- ========================================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ========================================================================
SET FOREIGN_KEY_CHECKS=1;

-- ========================================================================
-- Verify data was inserted
-- ========================================================================
SELECT 'MEDICINES TABLE' AS `Status`, COUNT(*) AS `Total Records` FROM `medicines`
UNION ALL
SELECT 'BATCHES TABLE' AS `Status`, COUNT(*) AS `Total Records` FROM `batches`;

-- Display all inserted medicines
SELECT 
    id, 
    name, 
    category, 
    price, 
    sku, 
    total_quantity, 
    in_stock, 
    requires_rx 
FROM `medicines` 
ORDER BY id;

-- Display all inserted batches
SELECT 
    id,
    medicine_id,
    batch_number,
    quantity_available,
    quantity_total,
    selling_price,
    status
FROM `batches`
ORDER BY medicine_id, id;
