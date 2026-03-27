
-- Function to increment coupon usage safely
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant access
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(TEXT) TO service_role;
