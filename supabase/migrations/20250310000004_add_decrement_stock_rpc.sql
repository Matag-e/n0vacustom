-- Function to decrement stock atomically
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - amount
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;
