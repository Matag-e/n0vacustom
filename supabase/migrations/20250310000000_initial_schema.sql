-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  size TEXT NOT NULL,
  customization_name TEXT,
  customization_number TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies
-- Profiles: Users can view and update their own profile
DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Products: Everyone can view products
DO $$ BEGIN
  CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT TO anon, authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Orders: Users can view their own orders
DO $$ BEGIN
  CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Order Items: Users can view their own order items via orders
DO $$ BEGIN
  CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Grant permissions
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Insert some dummy products if table is empty
INSERT INTO public.products (name, description, price, image_url, category)
SELECT 'Brasil I 1994 Retro', 'Camisa clássica da seleção brasileira de 1994.', 199.99, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Brazil%201994%20soccer%20jersey%20yellow%20classic&image_size=square', 'Retro'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Brasil I 1994 Retro');

INSERT INTO public.products (name, description, price, image_url, category)
SELECT 'Brasil II 2002', 'Camisa azul da seleção brasileira de 2002.', 199.99, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Brazil%202002%20soccer%20jersey%20blue&image_size=square', 'Retro'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Brasil II 2002');

INSERT INTO public.products (name, description, price, image_url, category)
SELECT 'Portugal I 2026', 'Camisa titular da seleção portuguesa para 2026.', 219.99, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portugal%20soccer%20jersey%20red%202026&image_size=square', 'Selecoes'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Portugal I 2026');

INSERT INTO public.products (name, description, price, image_url, category)
SELECT 'Real Madrid Home 23/24', 'Camisa titular do Real Madrid temporada 23/24.', 249.90, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Real%20Madrid%20home%20jersey%20white%2023-24&image_size=square', 'Clubes'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Real Madrid Home 23/24');

INSERT INTO public.products (name, description, price, image_url, category)
SELECT 'Flamengo I 2024', 'Manto sagrado rubro-negro 2024.', 349.90, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Flamengo%20soccer%20jersey%20red%20black%20stripes%202024&image_size=square', 'Brasileirao'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Flamengo I 2024');
