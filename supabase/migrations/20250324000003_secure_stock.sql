-- Migration: Secure atomic stock management
CREATE OR REPLACE FUNCTION public.secure_decrement_stock(
    p_product_id UUID,
    p_size TEXT,
    p_amount INTEGER
)
RETURNS VOID AS $$
DECLARE
    current_qty INTEGER;
BEGIN
    -- 1. Check current stock for the specific size
    SELECT quantity INTO current_qty
    FROM public.product_stock
    WHERE product_id = p_product_id AND size = p_size
    FOR UPDATE; -- Lock the row for atomicity

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto ou tamanho não encontrado';
    END IF;

    IF current_qty < p_amount THEN
        RAISE EXCEPTION 'Estoque insuficiente para o tamanho %', p_size;
    END IF;

    -- 2. Decrement the stock
    UPDATE public.product_stock
    SET quantity = quantity - p_amount
    WHERE product_id = p_product_id AND size = p_size;

    -- Note: The trigger 'trigger_update_product_total_stock' will 
    -- automatically update the global stock in 'products' table.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved handle_payment_success using secure logic
CREATE OR REPLACE FUNCTION public.handle_payment_success(order_uuid UUID)
RETURNS VOID AS $$
DECLARE
    item RECORD;
BEGIN
    -- 1. Increment sales count for each product in the order
    UPDATE public.products p
    SET sales_count = COALESCE(sales_count, 0) + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = order_uuid
    AND p.id = oi.product_id;

    -- 2. Decrement stock for each specific size in the order
    FOR item IN 
        SELECT product_id, size, quantity 
        FROM public.order_items 
        WHERE order_id = order_uuid
    LOOP
        -- We use GREATEST here to avoid breaking the payment flow if stock 
        -- was already low (since payment is already done), 
        -- but ideally we should have checked this at checkout.
        UPDATE public.product_stock
        SET quantity = GREATEST(0, quantity - item.quantity)
        WHERE product_id = item.product_id
        AND size = item.size;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users (and anon if checkout is public)
GRANT EXECUTE ON FUNCTION public.secure_decrement_stock(UUID, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_payment_success(UUID) TO service_role, authenticated, anon;
