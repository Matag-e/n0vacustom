-- Add shipping_type to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shipping_type TEXT DEFAULT NULL CHECK (shipping_type IN ('national', 'import') OR shipping_type IS NULL);
