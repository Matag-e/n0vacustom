
-- Alter code column to be nullable for automatic promotions
ALTER TABLE public.coupons ALTER COLUMN code DROP NOT NULL;

-- Ensure buy_x_get_y promotions can exist without code
-- (Already handled by nullable code, but let's make it clear)
COMMENT ON COLUMN public.coupons.code IS 'Nullable for automatic promotions (like buy_x_get_y)';
