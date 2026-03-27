-- Migration: Fix function search_path for security
-- This migration sets search_path = public for all functions to avoid "mutable search_path" warnings.
-- This is a security requirement for functions using SECURITY DEFINER.

DO $$ 
BEGIN
    -- 1. Coupons functions
    BEGIN
        ALTER FUNCTION public.validate_coupon(TEXT) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.validate_coupon(TEXT)';
    END;

    BEGIN
        ALTER FUNCTION public.get_active_auto_promos() SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.get_active_auto_promos()';
    END;

    BEGIN
        ALTER FUNCTION public.increment_coupon_usage(TEXT) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.increment_coupon_usage(TEXT)';
    END;

    -- 2. Stock and Product functions
    BEGIN
        ALTER FUNCTION public.decrement_stock(UUID, INTEGER) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.decrement_stock(UUID, INTEGER)';
    END;

    BEGIN
        ALTER FUNCTION public.decrement_stock_size(UUID, TEXT, INTEGER) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.decrement_stock_size(UUID, TEXT, INTEGER)';
    END;

    BEGIN
        ALTER FUNCTION public.update_product_total_stock() SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.update_product_total_stock()';
    END;

    BEGIN
        ALTER FUNCTION public.secure_decrement_stock(UUID, TEXT, INTEGER) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.secure_decrement_stock(UUID, TEXT, INTEGER)';
    END;

    -- 3. Payment and User functions
    BEGIN
        ALTER FUNCTION public.handle_payment_success(UUID) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.handle_payment_success(UUID)';
    END;

    BEGIN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not fix public.handle_new_user()';
    END;

    -- 4. Additional functions mentioned by user
    -- link_orders_to_new_user
    BEGIN
        ALTER FUNCTION public.link_orders_to_new_user(UUID, UUID) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN 
        BEGIN
            ALTER FUNCTION public.link_orders_to_new_user(UUID) SET search_path = public;
        EXCEPTION WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix link_orders_to_new_user';
        END;
    END;

    -- increment_product_sales
    BEGIN
        ALTER FUNCTION public.increment_product_sales(UUID, INTEGER) SET search_path = public;
    EXCEPTION WHEN OTHERS THEN 
        BEGIN
            ALTER FUNCTION public.increment_product_sales(UUID) SET search_path = public;
        EXCEPTION WHEN OTHERS THEN 
            RAISE NOTICE 'Could not fix increment_product_sales';
        END;
    END;
END $$;
