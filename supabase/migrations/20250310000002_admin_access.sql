-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;

-- Allow admin to view all orders
CREATE POLICY "Admin can view all orders" ON public.orders
FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');

-- Allow admin to update orders (e.g. status)
CREATE POLICY "Admin can update all orders" ON public.orders
FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');

-- Allow admin to view all order items
CREATE POLICY "Admin can view all order items" ON public.order_items
FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');
