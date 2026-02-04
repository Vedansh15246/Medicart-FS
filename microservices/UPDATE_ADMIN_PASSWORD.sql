-- ============================================================
-- Update Admin Password to "admin123"
-- Bcrypt hash of "admin123" is: $2a$10$8u7kxVqZaAT0uKTNm/DXau3zPhRVP7Yma5tOxqAQhqKRVNgPR5OPy
-- ============================================================

USE auth_service_db;

-- Update admin@medicart.com password
UPDATE users 
SET password = '$2a$10$8u7kxVqZaAT0uKTNm/DXau3zPhRVP7Yma5tOxqAQhqKRVNgPR5OPy'
WHERE email = 'admin@medicart.com';

-- Verify the update
SELECT id, email, full_name, password FROM users WHERE email = 'admin@medicart.com';
