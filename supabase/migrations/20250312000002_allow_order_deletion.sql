-- Allow users to delete their own orders if they are pending or cancelled
CREATE POLICY "Users can delete own orders" 
ON public.orders FOR DELETE 
TO authenticated
USING (auth.uid() = user_id AND (status = 'pending' OR status = 'cancelled'));
