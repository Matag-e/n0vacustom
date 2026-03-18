-- Clear all orders and order items (Reset for launch)
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;

-- Clear all products that contain AI-generated images
DELETE FROM public.products WHERE image_url LIKE '%coreva-normal.trae.ai%';
