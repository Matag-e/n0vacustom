-- Adiciona coluna para desativação lógica (soft delete)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Atualiza as políticas de RLS para considerar apenas produtos ativos para o público
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products 
FOR SELECT TO anon, authenticated 
USING (is_active = true);

-- Garante que o admin continue vendo todos, inclusive os inativos
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'novacustom2k26@gmail.com');
