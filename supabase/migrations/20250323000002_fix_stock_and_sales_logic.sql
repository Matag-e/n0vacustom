
-- Function to handle stock decrement and sales increment after payment
CREATE OR REPLACE FUNCTION public.handle_payment_success(order_uuid UUID)
RETURNS VOID AS 
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
        UPDATE public.product_stock
        SET quantity = GREATEST(0, quantity - item.quantity)
        WHERE product_id = item.product_id
        AND size = item.size;
    END LOOP;
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.handle_payment_success(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_payment_success(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_payment_success(UUID) TO anon;
