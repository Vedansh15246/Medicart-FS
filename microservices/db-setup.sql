-- ============================================================
-- MEDICART MICROSERVICES DATABASE SETUP SCRIPT
-- All 5 independent databases with tables and seed data
-- ============================================================

-- ============================================================
-- 1. AUTH SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS auth_service_db;
USE auth_service_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Roles junction table (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Roles
INSERT INTO roles (name, description) VALUES 
('ROLE_ADMIN', 'Administrator with full system access'),
('ROLE_CUSTOMER', 'Regular customer'),
('ROLE_PHARMACIST', 'Pharmacist staff member');

-- Seed Users
INSERT INTO users (email, password, full_name, phone, status) VALUES 
('admin@medicart.com', '$2a$10$Q5RLEEzYsU.6k6VhYWf9H.eZVYhxQZb0EFdMH0V.0pW3mQq1GQl5a', 'Admin User', '+1-800-1234', 'ACTIVE'),
('customer@medicart.com', '$2a$10$Q5RLEEzYsU.6k6VhYWf9H.eZVYhxQZb0EFdMH0V.0pW3mQq1GQl5a', 'John Customer', '+1-800-5678', 'ACTIVE'),
('pharmacist@medicart.com', '$2a$10$Q5RLEEzYsU.6k6VhYWf9H.eZVYhxQZb0EFdMH0V.0pW3mQq1GQl5a', 'Jane Pharmacist', '+1-800-9101', 'ACTIVE');

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- admin has ROLE_ADMIN
(2, 2), -- customer has ROLE_CUSTOMER
(3, 3); -- pharmacist has ROLE_PHARMACIST

-- ============================================================
-- 2. ADMIN-CATALOGUE SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS admin_catalogue_db;
USE admin_catalogue_db;

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dosage VARCHAR(100),
    form VARCHAR(50),
    manufacturer VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    requires_prescription BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    medicine_id BIGINT NOT NULL,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    quantity_available INT NOT NULL,
    quantity_total INT NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE NOT NULL,
    cost_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status),
    INDEX idx_medicine_expiry (medicine_id, expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    medicine_id BIGINT,
    file_path VARCHAR(500) NOT NULL,
    uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    INDEX idx_user_id (user_id),
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_uploaded_date (uploaded_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Medicines
INSERT INTO medicines (name, description, dosage, form, manufacturer, price, requires_prescription) VALUES 
('Aspirin', 'Pain reliever and fever reducer', '500mg', 'Tablet', 'Bayer', 5.99, FALSE),
('Amoxicillin', 'Antibiotic for infections', '500mg', 'Capsule', 'GSK', 12.50, TRUE),
('Ibuprofen', 'Anti-inflammatory pain reliever', '400mg', 'Tablet', 'Advil', 7.99, FALSE),
('Vitamin C', 'Immune system booster', '1000mg', 'Tablet', 'Nature Made', 3.50, FALSE),
('Metformin', 'Diabetes management medication', '500mg', 'Tablet', 'Glucophage', 8.99, TRUE),
('Lisinopril', 'Blood pressure medication', '10mg', 'Tablet', 'Pfizer', 6.50, TRUE),
('Omeprazole', 'Acid reflux treatment', '20mg', 'Capsule', 'Prilosec', 9.99, TRUE),
('Cetirizine', 'Allergy relief', '10mg', 'Tablet', 'Zyrtec', 4.99, FALSE);

-- Seed Batches (with FIFO ordering by expiry_date)
INSERT INTO batches (medicine_id, batch_number, quantity_available, quantity_total, manufacturing_date, expiry_date, cost_price, selling_price) VALUES 
-- Aspirin batches
(1, 'ASPIRIN-001', 100, 100, '2024-01-15', '2025-01-15', 2.00, 5.99),
(1, 'ASPIRIN-002', 150, 150, '2024-02-15', '2026-02-15', 2.00, 5.99),

-- Amoxicillin batches (with earlier expiry first for FIFO)
(2, 'AMOXICILLIN-001', 50, 50, '2024-01-10', '2025-01-10', 6.00, 12.50),
(2, 'AMOXICILLIN-002', 75, 75, '2024-03-20', '2026-03-20', 6.00, 12.50),

-- Ibuprofen batches
(3, 'IBUPROFEN-001', 200, 200, '2023-12-01', '2025-12-01', 3.50, 7.99),
(3, 'IBUPROFEN-002', 180, 180, '2024-02-28', '2026-02-28', 3.50, 7.99),

-- Vitamin C batches
(4, 'VITC-001', 300, 300, '2024-01-01', '2025-01-01', 1.00, 3.50),
(4, 'VITC-002', 250, 250, '2024-03-01', '2026-03-01', 1.00, 3.50),

-- Metformin batches
(5, 'METFORMIN-001', 80, 80, '2023-11-15', '2025-11-15', 4.00, 8.99),
(5, 'METFORMIN-002', 120, 120, '2024-02-01', '2026-02-01', 4.00, 8.99),

-- Lisinopril batches
(6, 'LISINOPRIL-001', 60, 60, '2024-01-20', '2025-01-20', 3.00, 6.50),
(6, 'LISINOPRIL-002', 90, 90, '2024-03-15', '2026-03-15', 3.00, 6.50),

-- Omeprazole batches
(7, 'OMEPRAZOLE-001', 40, 40, '2024-02-01', '2025-02-01', 5.00, 9.99),
(7, 'OMEPRAZOLE-002', 70, 70, '2024-04-01', '2026-04-01', 5.00, 9.99),

-- Cetirizine batches
(8, 'CETIRIZINE-001', 150, 150, '2024-01-25', '2025-01-25', 2.00, 4.99),
(8, 'CETIRIZINE-002', 200, 200, '2024-03-10', '2026-03-10', 2.00, 4.99);

-- ============================================================
-- 3. CART-ORDERS SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS cart_orders_db;
USE cart_orders_db;

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_medicine (user_id, medicine_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    address_id BIGINT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items table (with batch tracking for FIFO)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    batch_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. ANALYTICS SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS analytics_db;
USE analytics_db;

-- Sales Analytics table
CREATE TABLE IF NOT EXISTS sales_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity_sold INT NOT NULL,
    revenue DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sale_date (sale_date),
    INDEX idx_medicine_id (medicine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Analytics table
CREATE TABLE IF NOT EXISTS inventory_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255),
    total_stock INT DEFAULT 0,
    low_stock_alert INT DEFAULT 50,
    reorder_level INT DEFAULT 100,
    expiring_soon_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_medicine_id (medicine_id),
    INDEX idx_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard Metrics table
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_date DATE UNIQUE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_customers INT DEFAULT 0,
    avg_order_value DECIMAL(10, 2) DEFAULT 0,
    top_selling_medicine VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_metric_date (metric_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PAYMENT SERVICE DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS payment_db;
USE payment_db;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_order_payment (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table (audit trail)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    transaction_type VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    transaction_id VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- END OF SETUP SCRIPT
-- ============================================================
