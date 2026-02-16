-- Add breakdown columns to orders table
-- This allows us to store subtotal, GST, and delivery charges separately

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DOUBLE,
ADD COLUMN IF NOT EXISTS gst_amount DOUBLE,
ADD COLUMN IF NOT EXISTS delivery_charge DOUBLE;

-- Update existing orders with calculated values
-- Subtotal = totalAmount / 1.18 (removing 18% GST, assuming no delivery charge was included)
-- For simplicity, we'll set existing orders to have the totalAmount as subtotal
UPDATE orders 
SET 
    subtotal = totalAmount,
    gst_amount = 0,
    delivery_charge = 0
WHERE subtotal IS NULL;

-- Add comment to explain the columns
ALTER TABLE orders MODIFY COLUMN subtotal DOUBLE COMMENT 'Sum of medicine prices before GST and delivery';
ALTER TABLE orders MODIFY COLUMN gst_amount DOUBLE COMMENT '18% GST amount';
ALTER TABLE orders MODIFY COLUMN delivery_charge DOUBLE COMMENT 'Delivery fee (0 if order > 500)';
