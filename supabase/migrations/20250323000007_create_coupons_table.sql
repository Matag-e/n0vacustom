
-- Create coupons table if it doesn't exist (handle re-run safely)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y')),
  value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can view active coupons (for checkout validation)
DROP POLICY IF EXISTS "Active coupons are viewable by everyone" ON public.coupons;
CREATE POLICY "Active coupons are viewable by everyone" ON public.coupons
FOR SELECT TO anon, authenticated
USING (active = true);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
