-- Add image_back_url column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_back_url TEXT;

-- Enable RLS on products if not enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products
FOR SELECT USING (true);

-- Allow admin to manage products
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');

-- Enable RLS on product_stock
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view stock
DROP POLICY IF EXISTS "Anyone can view stock" ON public.product_stock;
CREATE POLICY "Anyone can view stock" ON public.product_stock
FOR SELECT USING (true);

-- Allow admin to manage stock
DROP POLICY IF EXISTS "Admin can manage stock" ON public.product_stock;
CREATE POLICY "Admin can manage stock" ON public.product_stock
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');
