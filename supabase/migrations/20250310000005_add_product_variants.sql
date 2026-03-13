-- Create product_stock table
CREATE TABLE public.product_stock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, size)
);

-- Enable RLS
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view product stock" ON public.product_stock
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage product stock" ON public.product_stock
    FOR ALL USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');

-- Function to update total stock on products table
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM public.product_stock
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep stock in sync
CREATE TRIGGER trigger_update_product_total_stock
AFTER INSERT OR UPDATE OR DELETE ON public.product_stock
FOR EACH ROW
EXECUTE FUNCTION update_product_total_stock();

-- Initialize default stock for existing products
-- We'll add default sizes (P, M, G, GG, XG) with 2 units each for existing products
DO $$
DECLARE
    r RECORD;
    s TEXT;
BEGIN
    FOR r IN SELECT id FROM public.products LOOP
        FOREACH s IN ARRAY ARRAY['P', 'M', 'G', 'GG', 'XG'] LOOP
            INSERT INTO public.product_stock (product_id, size, quantity)
            VALUES (r.id, s, 2)
            ON CONFLICT (product_id, size) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Update decrement function to handle sizes
CREATE OR REPLACE FUNCTION decrement_stock_size(p_id UUID, p_size TEXT, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.product_stock
  SET quantity = quantity - amount
  WHERE product_id = p_id AND size = p_size;
END;
$$ LANGUAGE plpgsql;
