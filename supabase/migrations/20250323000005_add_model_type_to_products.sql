
-- Add model_type column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_type TEXT;

-- Create an index for faster filtering by model_type if needed
CREATE INDEX IF NOT EXISTS idx_products_model_type ON public.products(model_type);
