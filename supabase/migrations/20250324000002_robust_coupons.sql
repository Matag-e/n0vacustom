-- Migration: Add robust rules to coupons table
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS is_first_purchase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER DEFAULT NULL;

-- Create table to track coupon usage per user if not exists
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for coupon_usages
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usages
DROP POLICY IF EXISTS "Users can view their own coupon usages" ON public.coupon_usages;
CREATE POLICY "Users can view their own coupon usages" 
ON public.coupon_usages FOR SELECT 
USING (auth.uid() = user_id);

-- Update validate_coupon function to include new rules
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
