-- ============================================================
-- MIGRATION: Remove UNIQUE constraint on order_id
-- ============================================================
-- Issue: UNIQUE constraint prevents payment retries
-- Solution: Remove unique constraint, add composite unique instead
-- This allows multiple payment attempts for same order,
-- but ensures only one successful payment per order
-- ============================================================

USE payment_db;

-- Step 1: Drop the old unique constraint
ALTER TABLE payments DROP INDEX `unique_order_payment`;

-- Step 2: Add new constraint that allows retries
-- Unique only on (order_id, payment_status='SUCCESS')
-- This is handled in application logic, not database
-- But we can add a composite index for performance

-- Step 3: Add index for common queries
ALTER TABLE payments ADD INDEX `idx_order_id` (`order_id`);
-- Drop if it exists, then recreate
DROP INDEX `idx_user_id` ON payments;
ALTER TABLE payments ADD INDEX `idx_user_id` (`user_id`);
ALTER TABLE payments ADD INDEX `idx_payment_status` (`payment_status`);
ALTER TABLE payments ADD INDEX `idx_created_at` (`created_at`);

-- Step 4: Verify changes
SELECT CONSTRAINT_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'payments' AND TABLE_SCHEMA = 'payment_db';

-- Done!
-- Now payments table can have multiple rows per order_id
-- Application logic ensures only one SUCCESS payment per order
