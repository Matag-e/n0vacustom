
-- Garantir que o email específico seja admin na tabela profiles
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'novacustom2k26@gmail.com';

-- Caso o perfil ainda não exista (raro, mas possível), essa query ajuda a identificar
-- mas o update acima deve resolver se você já fez login alguma vez.
