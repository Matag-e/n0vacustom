import express from 'express'
import { supabase } from '../../lib/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const baseUrl = 'https://n0vacustom.com'
    
    // Fetch all products
    const { data: products } = await supabase
      .from('products')
      .select('id, created_at')

    const staticPages = [
      '',
      '/clubes',
      '/selecoes',
      '/retro',
      '/personalizados',
      '/lancamentos',
      '/mais-vendidos',
      '/restauracao',
      '/personalizacao',
      '/login',
      '/faq',
      '/contato'
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</url>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${products?.map(product => `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${new Date(product.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('') || ''}
</urlset>`

    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (error) {
    console.error('Sitemap error:', error)
    res.status(500).send('Error generating sitemap')
  }
})

export default router
