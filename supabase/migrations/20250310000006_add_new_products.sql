-- Inserindo novos produtos nas coleções existentes (SEM PALMEIRAS)
-- Clubes
INSERT INTO public.products (name, description, price, image_url, category, stock)
VALUES 
('Camisa Real Madrid Home 24/25', 'A clássica camisa branca dos Merengues para a nova temporada.', 299.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'clubes', 15),
('Camisa Barcelona Away 24/25', 'Design inovador em preto com detalhes em azul e grená.', 299.90, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', 'clubes', 12),
('Camisa Manchester City Home 24/25', 'O tradicional azul celeste dos Citizens com tecnologia de ponta.', 299.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'clubes', 10);

-- Seleções
INSERT INTO public.products (name, description, price, image_url, category, stock)
VALUES 
('Camisa Brasil Home 2024', 'O icônico amarelo canarinho com detalhes inspirados na natureza brasileira.', 349.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'selecoes', 20),
('Camisa Argentina Home 2024', 'A camisa dos campeões do mundo com as tradicionais listras alvicelestes.', 349.90, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', 'selecoes', 18),
('Camisa França Home 2024', 'Elegância e tradição na nova camisa dos Les Bleus.', 349.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'selecoes', 15);

-- Retrô
INSERT INTO public.products (name, description, price, image_url, category, stock)
VALUES 
('Camisa Brasil 1970 Retrô', 'Reedição da lendária camisa do tricampeonato mundial.', 199.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'retro', 10),
('Camisa Milan 1990 Retrô', 'Clássica camisa rossonera da era de ouro do clube italiano.', 199.90, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', 'retro', 8),
('Camisa São Paulo 1992 Retrô', 'Manto sagrado da conquista do primeiro mundial tricolor.', 199.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'retro', 12);

-- Brasileirão
INSERT INTO public.products (name, description, price, image_url, category, stock)
VALUES 
('Camisa Flamengo Home 24/25', 'O tradicional rubro-negro carioca com design moderno.', 289.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'brasileirao', 25),
('Camisa São Paulo Home 24/25', 'As três cores que conduzem o Morumbi em um novo design.', 289.90, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', 'brasileirao', 20),
('Camisa Corinthians Home 24/25', 'O manto alvinegro com detalhes clássicos e tecnologia de performance.', 289.90, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800', 'brasileirao', 18);

-- Inicializando o estoque por tamanho para os novos produtos
DO $$
DECLARE
    r RECORD;
    s TEXT;
BEGIN
    FOR r IN SELECT id FROM public.products WHERE created_at >= now() - interval '1 minute' LOOP
        FOREACH s IN ARRAY ARRAY['P', 'M', 'G', 'GG', 'XG'] LOOP
            INSERT INTO public.product_stock (product_id, size, quantity)
            VALUES (r.id, s, 5)
            ON CONFLICT (product_id, size) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
