-- Add shipping columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_id TEXT,
ADD COLUMN IF NOT EXISTS shipping_method TEXT;
