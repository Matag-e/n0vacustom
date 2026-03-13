-- Clear existing orders and order items
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;

-- Add stock column to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 10;

-- Update existing products to have some stock if needed (though default handles it)
UPDATE public.products SET stock = 10 WHERE stock IS NULL;
