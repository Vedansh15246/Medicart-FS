-- ============================================================
-- FIX BATCHES TABLE SCHEMA - Add DEFAULT values
-- ============================================================
-- This script adds DEFAULT values to NOT NULL columns
-- to fix Hibernate INSERT failures

USE admin_catalogue_db;

-- Fix quantity_available column
ALTER TABLE batches MODIFY COLUMN quantity_available INT NOT NULL DEFAULT 0;

-- Fix quantity_total column  
ALTER TABLE batches MODIFY COLUMN quantity_total INT NOT NULL DEFAULT 0;

-- Fix selling_price column
ALTER TABLE batches MODIFY COLUMN selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Verify the changes
SHOW CREATE TABLE batches\G
