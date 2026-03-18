-- Tabela de Wishlist (Lista de Desejos)
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id) -- Impede duplicatas do mesmo produto para o mesmo usuário
);

-- Tabela de Reviews (Avaliações)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url TEXT, -- URL da foto da avaliação (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para Wishlist
CREATE POLICY "Users can view their own wishlist" 
    ON public.wishlist FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist" 
    ON public.wishlist FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist" 
    ON public.wishlist FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para Reviews
CREATE POLICY "Anyone can view reviews" 
    ON public.reviews FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Apenas o dono pode editar/deletar (ou admin, mas simplificado aqui)
CREATE POLICY "Users can update their own reviews" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON public.reviews FOR DELETE 
    USING (auth.uid() = user_id);
