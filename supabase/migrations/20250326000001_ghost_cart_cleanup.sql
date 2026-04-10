-- Function to cleanup old cart items (Ghost Carts)
-- This function deletes items from the cart_items table that haven't been updated for more than 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_ghost_carts()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.cart_items
    WHERE updated_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To automate this, you can enable pg_cron in Supabase and run:
-- SELECT cron.schedule('0 0 * * *', 'SELECT public.cleanup_ghost_carts()');
-- This would run the cleanup every day at midnight.

-- If pg_cron is not available, you can create a simple trigger or call it from an Edge Function.
-- For now, let's also create a trigger that cleans up old items for a specific user 
-- whenever they add a new item, keeping the table lean.

CREATE OR REPLACE FUNCTION public.cleanup_user_ghost_cart()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.cart_items
    WHERE user_id = NEW.user_id
    AND updated_at < now() - interval '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_cleanup_user_cart ON public.cart_items;
CREATE TRIGGER trigger_cleanup_user_cart
    BEFORE INSERT ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_user_ghost_cart();
