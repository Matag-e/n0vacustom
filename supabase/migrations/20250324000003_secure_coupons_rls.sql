-- Migration: Secure coupons table with RLS
-- This migration ensures that Row Level Security (RLS) is enabled and correctly configured for the coupons table.

-- 1. Enable RLS on coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean state
DROP POLICY IF EXISTS "Active coupons are viewable by everyone" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

-- 3. Policy: Admins can do everything
-- This policy uses the profiles table to check for the 'admin' role.
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Secure validation access
-- We already have validate_coupon and get_active_auto_promos functions with SECURITY DEFINER.
-- These functions handle public access to coupon data safely.
-- No additional public SELECT policy is needed for the coupons table itself,
-- which prevents users from listing all available coupons through the API.

-- 5. Ensure the functions have the latest schema (including new columns from 20250324000002_robust_coupons.sql)
DROP FUNCTION IF EXISTS public.validate_coupon(TEXT);
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  type TEXT,
  value DECIMAL,
  min_purchase_amount DECIMAL,
  min_quantity INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN,
  is_first_purchase BOOLEAN,
  usage_limit_per_user INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.code, c.type, c.value, c.min_purchase_amount, c.min_quantity, 
    c.usage_limit, c.usage_count, c.expires_at, c.active,
    c.is_first_purchase, c.usage_limit_per_user
  FROM public.coupons c
  WHERE c.active = true 
    AND c.code = p_code
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.usage_limit IS NULL OR c.usage_count < c.usage_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS public.get_active_auto_promos();
CREATE OR REPLACE FUNCTION public.get_active_auto_promos()
RETURNS TABLE (
  id UUID,
  code TEXT,
  type TEXT,
  value DECIMAL,
  min_purchase_amount DECIMAL,
  min_quantity INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN,
  is_first_purchase BOOLEAN,
  usage_limit_per_user INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.code, c.type, c.value, c.min_purchase_amount, c.min_quantity, 
    c.usage_limit, c.usage_count, c.expires_at, c.active,
    c.is_first_purchase, c.usage_limit_per_user
  FROM public.coupons c
  WHERE c.active = true 
    AND c.code IS NULL
    AND c.type = 'buy_x_get_y'
    AND (c.expires_at IS NULL OR c.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant access to the functions
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_auto_promos() TO anon, authenticated;
