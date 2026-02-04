-- ============================================================
-- FIX: Allow Multiple Batches Per Medicine
-- ============================================================
-- Problem: Unique constraint (medicine_id, batch_number) prevented 
--          multiple batches for the same medicine
-- Solution: Drop the unique constraint to allow multiple batches
-- ============================================================

USE admin_catalogue_db;

-- Drop the unique constraint
ALTER TABLE batches 
DROP CONSTRAINT UK7m5b87j08fvngd8ki2dwl93g6;

-- Verify the constraint is dropped
SHOW CREATE TABLE batches;

-- ============================================================
-- Now you can create multiple batches for the same medicine!
-- Example: Medicine ID 1 can now have batch_number 10, 11, 12, etc.
-- ============================================================
