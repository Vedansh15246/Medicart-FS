-- ============================================================
-- MIGRATION SCRIPT: Rebuild addresses table to match JPA entity
-- Run this on cart_orders_service_db to fix address insertion errors
-- ============================================================

USE cart_orders_service_db;

-- STEP 1: Drop the existing addresses table if it has wrong schema
DROP TABLE IF EXISTS addresses;

-- STEP 2: Create the correct addresses table matching the JPA entity
CREATE TABLE addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT '',
    street_address VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL DEFAULT '',
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    phone VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 3: Verify the table structure
DESCRIBE addresses;

-- STEP 4: Show detailed column information
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'addresses' AND TABLE_SCHEMA = 'cart_orders_service_db'
ORDER BY ORDINAL_POSITION;
