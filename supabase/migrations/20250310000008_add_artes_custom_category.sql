-- Inserindo produtos na nova categoria 'artes-custom'
INSERT INTO public.products (name, description, price, image_url, category, stock)
VALUES 
('Camisa Brasil Custom: Neymar JR', 'Arte exclusiva do Neymar JR celebrando nas costas do manto canarinho.', 399.90, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20studio%20photography%20of%20the%20back%20of%20a%20Brazil%20National%20Team%20jersey%2C%20instead%20of%20numbers%20it%20has%20a%20high-quality%20artistic%20print%20of%20Neymar%20celebrating%2C%20vibrant%20colors%2C%20dtf%20print%20texture%2C%20cinematic%20lighting%2C%208k%20resolution&image_size=portrait_4_3', 'artes-custom', 5),
('Camisa Custom: Anime Edition', 'Camisa preta com estampa artística de anime em alta definição.', 399.90, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20studio%20photography%20of%20a%20black%20football%20jersey%20with%20a%20large%20artistic%20anime%20character%20print%20on%20the%20front%2C%20streetwear%20style%2C%20vibrant%20colors%2C%20sharp%20details%2C%20minimalist%20background&image_size=portrait_4_3', 'artes-custom', 5),
('Camisa Custom: Ídolos Eternos', 'Homenagem artística aos grandes ídolos do futebol em estilo streetwear.', 399.90, 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20studio%20photography%20of%20a%20football%20jersey%20with%20a%20black%20and%20white%20photo%20print%20of%20a%20legendary%20player%20on%20the%20chest%2C%20artistic%20composition%2C%20premium%20finish&image_size=portrait_4_3', 'artes-custom', 5);

-- Inicializando o estoque por tamanho para os novos produtos
DO $$
DECLARE
    r RECORD;
    s TEXT;
BEGIN
    FOR r IN SELECT id FROM public.products WHERE category = 'artes-custom' LOOP
        FOREACH s IN ARRAY ARRAY['P', 'M', 'G', 'GG', 'XG'] LOOP
            INSERT INTO public.product_stock (product_id, size, quantity)
            VALUES (r.id, s, 1)
            ON CONFLICT (product_id, size) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
