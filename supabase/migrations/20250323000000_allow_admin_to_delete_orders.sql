-- Allow admin to delete orders
CREATE POLICY "Admin can delete all orders" ON public.orders
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');

-- Allow admin to delete order items (though ON DELETE CASCADE handles it, it's good for explicit deletes if needed)
CREATE POLICY "Admin can delete all order items" ON public.order_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com'
  )
);