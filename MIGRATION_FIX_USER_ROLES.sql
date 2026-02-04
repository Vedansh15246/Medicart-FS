-- ====================================================================
-- 🔧 MIGRATION: Fix User Roles Issue
-- ====================================================================
-- Issue: New users (4,5,6,7) have NULL role_id
-- Root Cause: Registration method assumes ROLE_USER exists but it doesn't
-- Solution: 
--   1. Create ROLE_USER if it doesn't exist
--   2. Assign ROLE_USER to all users with NULL role_id
--   3. Update AuthService to handle case when role doesn't exist
-- ====================================================================

USE auth_service_db;

-- ============================================================
-- Step 1: Check if ROLE_USER exists
-- ============================================================
-- If not, the registration will fail with "Role not found" error

SELECT * FROM roles WHERE name = 'ROLE_USER';

-- ============================================================
-- Step 2: Create ROLE_USER if it doesn't exist
-- ============================================================
-- This role should be the default role for new registrations

INSERT INTO roles (name, description, created_at) 
VALUES ('ROLE_USER', 'Standard user role', NOW())
ON DUPLICATE KEY UPDATE 
    description = 'Standard user role';

-- ============================================================
-- Step 3: Verify all roles exist
-- ============================================================
SELECT id, name, description FROM roles ORDER BY id;

-- Expected output:
-- id | name | description
-- 1  | ROLE_ADMIN | Administrator with full system access
-- 2  | ROLE_CUSTOMER | Regular customer
-- 3  | ROLE_PHARMACIST | Pharmacist staff member
-- 4  | ROLE_USER | Standard user role

-- ============================================================
-- Step 4: Fix existing users with NULL role_id
-- ============================================================
-- Users 4, 5, 6, 7 have NULL role_id - assign them ROLE_USER

UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'ROLE_USER')
WHERE role_id IS NULL;

-- Verify the update
SELECT id, email, role_id FROM users WHERE id >= 4;

-- ============================================================
-- Step 5: Verify all users now have roles
-- ============================================================
SELECT 
    u.id, 
    u.email, 
    r.name as role_name,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.id;

-- Expected output:
-- id | email | role_name | created_at
-- 1  | admin@medicart.com | ROLE_ADMIN | ...
-- 2  | customer@medicart.com | ROLE_CUSTOMER | ...
-- 3  | pharmacist@medicart.com | ROLE_PHARMACIST | ...
-- 4  | shaikshahidmail@gmail.com | ROLE_USER | ...
-- 5  | shaikshahid@gmail.com | ROLE_USER | ...
-- 6  | shaikshahid1@gmail.com | ROLE_USER | ...
-- 7  | aman@gmail.com | ROLE_USER | ...

-- ============================================================
-- Step 6: Generate new JWT tokens for users 4-7
-- ============================================================
-- They need to login again to get new JWT tokens with ROLE_USER

-- Run in frontend console:
-- localStorage.clear();  // Clear old tokens
-- location.reload();     // Go back to login page
-- 
-- Then login with:
-- - shaikshahidmail@gmail.com / password
-- - shaikshahid@gmail.com / password
-- - shaikshahid1@gmail.com / password
-- - aman@gmail.com / password

-- ============================================================
-- Step 7: Verify JWT token generation works
-- ============================================================
-- After login, check browser console:
-- 
-- const token = localStorage.getItem('accessToken');
-- const payload = JSON.parse(atob(token.split('.')[1]));
-- console.log(payload);
-- 
-- Expected output:
-- {
--   "scope": "ROLE_USER",
--   "email": "shaikshahidmail@gmail.com",
--   "fullName": "...",
--   "iat": ...,
--   "exp": ...
-- }

-- ============================================================
-- Step 8: Test 403 error is fixed
-- ============================================================
-- Try creating a batch with these users:
--
-- POST /batches
-- Authorization: Bearer {token with ROLE_USER}
-- Content-Type: application/json
--
-- {
--   "medicineId": 1,
--   "batchNo": "TEST-001",
--   "expiryDate": "2025-12-31",
--   "qtyAvailable": 100
-- }
--
-- Expected: 200 OK (batch created successfully)
-- NOT: 403 Forbidden

-- ============================================================
-- SUMMARY OF CHANGES
-- ============================================================
-- ✅ ROLE_USER role created (id=4)
-- ✅ Users 4,5,6,7 assigned ROLE_USER
-- ✅ JWT tokens will now include "scope": "ROLE_USER"
-- ✅ POST /batches with .authenticated() will allow ROLE_USER
-- ✅ No more 403 errors!
