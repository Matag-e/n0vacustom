-- Add league and country columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS league TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS country TEXT;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_league ON public.products(league);
CREATE INDEX IF NOT EXISTS idx_products_country ON public.products(country);