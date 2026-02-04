-- ============================================================
-- MIGRATION SCRIPT TO FIX BATCHES TABLE
-- Run this if the batches table is missing the quantity_total column
-- ============================================================

USE admin_catalogue_db;

-- Check if quantity_total column exists and add if it doesn't
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS quantity_total INT NOT NULL DEFAULT 0 AFTER quantity_available;

-- Update existing rows to sync quantity_total with quantity_available
UPDATE batches SET quantity_total = quantity_available WHERE quantity_total = 0;

-- Add any missing columns from the schema
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) AFTER manufacturing_date;

ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10, 2) AFTER cost_price;

ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS manufacturing_date DATE BEFORE expiry_date;

-- Verify the table structure
DESCRIBE batches;

-- Show sample data
SELECT * FROM batches LIMIT 5;
