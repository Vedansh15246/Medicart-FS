-- Comprehensive seed data for admin_catalogue_db with realistic sales data
-- This creates medicines with categories and batches with quantity sold for revenue-by-category analytics
-- Run: mysql -u root -pRohin admin_catalogue_db < seed_complete_sales_data.sql

USE admin_catalogue_db;

START TRANSACTION;

-- Insert medicines across different categories
LOCK TABLES `medicines` WRITE;

INSERT INTO `medicines` (name, description, price, category, sku, requires_rx, total_quantity, in_stock, created_at, updated_at) VALUES
-- Pain Relief / Analgesics
('Paracetamol 500mg', 'Pain reliever and fever reducer', 5.50, 'Pain Relief', 'PARA-500', 0, 500, 1, NOW(), NOW()),
('Ibuprofen 400mg', 'NSAID for pain and inflammation', 8.75, 'Pain Relief', 'IBU-400', 0, 400, 1, NOW(), NOW()),
('Aspirin 75mg', 'Low-dose aspirin for heart health', 3.25, 'Pain Relief', 'ASP-75', 0, 600, 1, NOW(), NOW()),

-- Antibiotics
('Amoxicillin 500mg', 'Broad-spectrum antibiotic', 12.00, 'Antibiotic', 'AMOX-500', 1, 300, 1, NOW(), NOW()),
('Azithromycin 250mg', 'Macrolide antibiotic', 18.50, 'Antibiotic', 'AZI-250', 1, 200, 1, NOW(), NOW()),

-- Cardiovascular / Cardiac
('Atorvastatin 20mg', 'Cholesterol-lowering statin', 22.00, 'Cardiac', 'ATOR-20', 1, 250, 1, NOW(), NOW()),
('Metoprolol 50mg', 'Beta blocker for hypertension', 15.75, 'Cardiac', 'METO-50', 1, 180, 1, NOW(), NOW()),

-- Gastrointestinal
('Omeprazole 20mg', 'Proton pump inhibitor for acid reflux', 9.50, 'Gastro', 'OMEP-20', 0, 350, 1, NOW(), NOW()),
('Ranitidine 150mg', 'H2 blocker for heartburn', 6.25, 'Gastro', 'RAN-150', 0, 400, 1, NOW(), NOW()),

-- Respiratory
('Salbutamol Inhaler 100mcg', 'Bronchodilator for asthma', 220.00, 'Respiratory', 'SAL-INH', 1, 100, 1, NOW(), NOW()),
('Cetirizine 10mg', 'Antihistamine for allergies', 4.50, 'Respiratory', 'CET-10', 0, 500, 1, NOW(), NOW()),

-- Vitamins & Supplements
('Vitamin D3 1000IU', 'Bone health supplement', 9.99, 'Supplements', 'VIT-D3', 0, 800, 1, NOW(), NOW()),
('Multivitamin Complex', 'Daily multivitamin formula', 14.50, 'Supplements', 'MULTI-VIT', 0, 600, 1, NOW(), NOW()),
('Omega-3 Fish Oil', 'Heart and brain health', 19.99, 'Supplements', 'OMEGA-3', 0, 400, 1, NOW(), NOW()),

-- Dermatology
('Hydrocortisone Cream 1%', 'Topical corticosteroid for skin inflammation', 7.50, 'Dermatology', 'HYDRO-CR', 0, 300, 1, NOW(), NOW()),

-- Diabetes
('Metformin 500mg', 'Diabetes management', 11.25, 'Diabetes', 'METF-500', 1, 350, 1, NOW(), NOW());

UNLOCK TABLES;

-- Get the IDs of inserted medicines for batch creation
SET @paracetamol_id = (SELECT id FROM medicines WHERE sku = 'PARA-500');
SET @ibuprofen_id = (SELECT id FROM medicines WHERE sku = 'IBU-400');
SET @aspirin_id = (SELECT id FROM medicines WHERE sku = 'ASP-75');
SET @amoxicillin_id = (SELECT id FROM medicines WHERE sku = 'AMOX-500');
SET @azithromycin_id = (SELECT id FROM medicines WHERE sku = 'AZI-250');
SET @atorvastatin_id = (SELECT id FROM medicines WHERE sku = 'ATOR-20');
SET @metoprolol_id = (SELECT id FROM medicines WHERE sku = 'METO-50');
SET @omeprazole_id = (SELECT id FROM medicines WHERE sku = 'OMEP-20');
SET @ranitidine_id = (SELECT id FROM medicines WHERE sku = 'RAN-150');
SET @salbutamol_id = (SELECT id FROM medicines WHERE sku = 'SAL-INH');
SET @cetirizine_id = (SELECT id FROM medicines WHERE sku = 'CET-10');
SET @vitd3_id = (SELECT id FROM medicines WHERE sku = 'VIT-D3');
SET @multivit_id = (SELECT id FROM medicines WHERE sku = 'MULTI-VIT');
SET @omega3_id = (SELECT id FROM medicines WHERE sku = 'OMEGA-3');
SET @hydrocortisone_id = (SELECT id FROM medicines WHERE sku = 'HYDRO-CR');
SET @metformin_id = (SELECT id FROM medicines WHERE sku = 'METF-500');

-- Insert batches with realistic sales (quantity_total > quantity_available shows items sold)
LOCK TABLES `batches` WRITE;

INSERT INTO `batches` (batch_number, expiry_date, quantity_available, quantity_total, selling_price, medicine_id) VALUES
-- Pain Relief batches (high volume sales)
('PARA-B001', '2027-12-31', 120, 200, 5.50, @paracetamol_id),    -- 80 units sold
('PARA-B002', '2028-06-30', 180, 250, 5.50, @paracetamol_id),    -- 70 units sold
('IBU-B001', '2027-10-15', 100, 180, 8.75, @ibuprofen_id),       -- 80 units sold
('IBU-B002', '2028-03-20', 150, 220, 8.75, @ibuprofen_id),       -- 70 units sold
('ASP-B001', '2027-08-10', 250, 350, 3.25, @aspirin_id),         -- 100 units sold

-- Antibiotic batches (moderate sales, prescription required)
('AMOX-B001', '2027-11-30', 80, 150, 12.00, @amoxicillin_id),    -- 70 units sold
('AMOX-B002', '2028-01-15', 100, 150, 12.00, @amoxicillin_id),   -- 50 units sold
('AZI-B001', '2027-09-20', 60, 100, 18.50, @azithromycin_id),    -- 40 units sold
('AZI-B002', '2028-02-28', 80, 100, 18.50, @azithromycin_id),    -- 20 units sold

-- Cardiac batches (steady sales)
('ATOR-B001', '2027-12-01', 90, 150, 22.00, @atorvastatin_id),   -- 60 units sold
('ATOR-B002', '2028-04-10', 80, 100, 22.00, @atorvastatin_id),   -- 20 units sold
('METO-B001', '2027-10-25', 60, 100, 15.75, @metoprolol_id),     -- 40 units sold
('METO-B002', '2028-01-30', 70, 80, 15.75, @metoprolol_id),      -- 10 units sold

-- Gastro batches (high volume)
('OMEP-B001', '2027-11-15', 120, 200, 9.50, @omeprazole_id),     -- 80 units sold
('OMEP-B002', '2028-03-05', 140, 150, 9.50, @omeprazole_id),     -- 10 units sold
('RAN-B001', '2027-09-30', 180, 250, 6.25, @ranitidine_id),      -- 70 units sold
('RAN-B002', '2028-02-20', 200, 150, 6.25, @ranitidine_id),      -- No sales (qty_available > qty_total shows restocking)

-- Respiratory batches
('SAL-B001', '2027-12-31', 30, 50, 220.00, @salbutamol_id),      -- 20 units sold (high-value)
('SAL-B002', '2028-05-15', 40, 50, 220.00, @salbutamol_id),      -- 10 units sold
('CET-B001', '2027-08-20', 200, 300, 4.50, @cetirizine_id),      -- 100 units sold
('CET-B002', '2028-01-10', 180, 200, 4.50, @cetirizine_id),      -- 20 units sold

-- Supplements batches (very high volume)
('VD3-B001', '2028-06-30', 300, 500, 9.99, @vitd3_id),           -- 200 units sold
('VD3-B002', '2029-01-15', 250, 300, 9.99, @vitd3_id),           -- 50 units sold
('MULTI-B001', '2028-03-31', 200, 350, 14.50, @multivit_id),     -- 150 units sold
('MULTI-B002', '2028-09-20', 220, 250, 14.50, @multivit_id),     -- 30 units sold
('OMG-B001', '2028-05-10', 150, 250, 19.99, @omega3_id),         -- 100 units sold
('OMG-B002', '2028-11-30', 180, 150, 19.99, @omega3_id),         -- No sales (overstocked)

-- Dermatology batches
('HYD-B001', '2027-07-15', 120, 180, 7.50, @hydrocortisone_id),  -- 60 units sold
('HYD-B002', '2028-02-28', 140, 120, 7.50, @hydrocortisone_id),  -- No sales

-- Diabetes batches (steady prescription sales)
('METF-B001', '2027-12-20', 100, 200, 11.25, @metformin_id),     -- 100 units sold
('METF-B002', '2028-06-15', 140, 150, 11.25, @metformin_id);     -- 10 units sold

UNLOCK TABLES;

COMMIT;

-- Verification queries
SELECT '=== Medicines by Category ===' AS '';
SELECT category, COUNT(*) AS medicine_count, AVG(price) AS avg_price
FROM medicines
GROUP BY category
ORDER BY medicine_count DESC;

SELECT '=== Batches with Sales Data ===' AS '';
SELECT 
    b.id,
    m.name,
    m.category,
    b.quantity_total,
    b.quantity_available,
    (b.quantity_total - b.quantity_available) AS units_sold,
    b.selling_price,
    ((b.quantity_total - b.quantity_available) * b.selling_price) AS revenue
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
WHERE (b.quantity_total - b.quantity_available) > 0
ORDER BY revenue DESC
LIMIT 15;

SELECT '=== Revenue by Category ===' AS '';
SELECT 
    m.category,
    COUNT(DISTINCT b.id) AS batch_count,
    SUM(b.quantity_total - b.quantity_available) AS total_units_sold,
    SUM((b.quantity_total - b.quantity_available) * b.selling_price) AS total_revenue
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
WHERE (b.quantity_total - b.quantity_available) > 0
GROUP BY m.category
ORDER BY total_revenue DESC;
