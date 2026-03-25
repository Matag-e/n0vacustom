import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://novacustom.com.br';

async function generateSitemap() {
  console.log('Iniciando geração de sitemap dinâmico...');

  // 1. Rotas estáticas
  const staticRoutes = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/clubes', priority: '0.9', changefreq: 'weekly' },
    { url: '/selecoes', priority: '0.9', changefreq: 'weekly' },
    { url: '/retro', priority: '0.9', changefreq: 'weekly' },
    { url: '/personalizados', priority: '0.8', changefreq: 'weekly' },
    { url: '/restauracao', priority: '0.7', changefreq: 'monthly' },
    { url: '/personalizacao', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.5', changefreq: 'monthly' },
    { url: '/contato', priority: '0.5', changefreq: 'monthly' },
  ];

  // 2. Buscar produtos do Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('is_active', true);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return;
  }

  console.log(`${products.length} produtos encontrados.`);

  // 3. Montar o XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Adicionar rotas estáticas
  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  // Adicionar produtos
  products.forEach(product => {
    const lastMod = product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${BASE_URL}/product/${product.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += '\n</urlset>';

  // 4. Salvar o arquivo
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);

  console.log(`Sitemap gerado com sucesso em: ${sitemapPath}`);
}

generateSitemap().catch(console.error);
