
-- 1. Remove a política que permitia listar todos os cupons
DROP POLICY IF EXISTS "Active coupons are viewable by everyone" ON public.coupons;

-- 2. Cria uma função para VALIDAR um cupom específico sem expor os outros
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
  active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.code, c.type, c.value, c.min_purchase_amount, c.min_quantity, c.usage_limit, c.usage_count, c.expires_at, c.active
  FROM public.coupons c
  WHERE c.active = true 
    AND c.code = p_code
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.usage_limit IS NULL OR c.usage_count < c.usage_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cria uma função para buscar apenas as PROMOÇÕES AUTOMÁTICAS (sem código)
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
  active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.code, c.type, c.value, c.min_purchase_amount, c.min_quantity, c.usage_limit, c.usage_count, c.expires_at, c.active
  FROM public.coupons c
  WHERE c.active = true 
    AND c.code IS NULL
    AND c.type = 'buy_x_get_y'
    AND (c.expires_at IS NULL OR c.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões de execução
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_auto_promos() TO anon, authenticated;
