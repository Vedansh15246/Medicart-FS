-- Migration to add missing columns to batches table for sales-by-category analytics
-- Run: mysql -u root -pRohin admin_catalogue_db < migration_add_batch_columns.sql

USE admin_catalogue_db;

-- Add quantity_total column (stores original batch quantity)
ALTER TABLE `batches` 
ADD COLUMN `quantity_total` INT NOT NULL DEFAULT 0 AFTER `qty_available`;

-- Add selling_price column (stores the selling price per unit)
ALTER TABLE `batches` 
ADD COLUMN `selling_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `quantity_total`;

-- Update existing batches: set quantity_total = qty_available (assumes no sales yet)
-- In production, you'd want to calculate this based on actual sales data
UPDATE `batches` 
SET `quantity_total` = `qty_available` 
WHERE `quantity_total` = 0;

-- Update selling prices based on medicine prices
UPDATE `batches` b
INNER JOIN `medicines` m ON b.`medicine_id` = m.`id`
SET b.`selling_price` = m.`price`
WHERE b.`selling_price` = 0.00;

-- Verify the changes
SELECT 
    b.id,
    b.batch_no,
    m.name AS medicine_name,
    m.category,
    b.qty_available,
    b.quantity_total,
    b.selling_price,
    (b.quantity_total - b.qty_available) AS sold_quantity,
    ((b.quantity_total - b.qty_available) * b.selling_price) AS revenue
FROM `batches` b
INNER JOIN `medicines` m ON b.`medicine_id` = m.`id`
ORDER BY m.category, revenue DESC
LIMIT 20;

-- Show category totals
SELECT 
    m.category,
    SUM((b.quantity_total - b.qty_available) * b.selling_price) AS total_revenue
FROM `batches` b
INNER JOIN `medicines` m ON b.`medicine_id` = m.`id`
GROUP BY m.category
ORDER BY total_revenue DESC;
