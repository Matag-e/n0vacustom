import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCard, Product } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { ArrowRight, ShieldCheck, Truck, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MinimalCategories } from '@/components/MinimalCategories';
import { FloatingQuote } from '@/components/FloatingQuote';
import { BenefitsBar } from '@/components/BenefitsBar';
import { Helmet } from 'react-helmet-async';
import { seededShuffle } from '@/lib/utils';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brasilProducts, setBrasilProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (error) {
          throw error;
        }

        if (data) {
          // Filtrar Coleção Brasil (2026 + Femininas)
          const brasilCollection = data.filter(p => {
            const desc = (p.description || '').toUpperCase();
            const name = (p.name || '').toUpperCase();
            const isBrasil = desc.includes('BRASIL') || name.includes('BRASIL');
            const is2026 = p.year === '2026';
            const isFeminina = desc.includes('FEMININA') || name.includes('FEMININA');
            
            return isBrasil && (is2026 || isFeminina);
          });
          setBrasilProducts(brasilCollection);

          // Lógica de Semente (Seed) por Sessão
          let sessionSeed = sessionStorage.getItem('home_products_seed');
          if (!sessionSeed) {
            // Se não houver seed na sessão, gera uma nova (número entre 1 e 10000)
            sessionSeed = Math.floor(Math.random() * 10000).toString();
            sessionStorage.setItem('home_products_seed', sessionSeed);
          }

          // Embaralha determinísticamente usando a seed da sessão
          const shuffledProducts = seededShuffle(data, parseInt(sessionSeed));
          setProducts(shuffledProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <Helmet>
        <title>NovaCustom | Mantos de Futebol 1:1</title>
        <meta name="description" content="A NovaCustom é a sua loja premium de mantos exclusivos. Qualidade tailandesa 1:1, personalização oficial e a paixão pelo futebol em cada detalhe." />
        <link rel="canonical" href="https://www.novacustom.com.br" />
        <meta property="og:title" content="NovaCustom | Mantos de Futebol 1:1" />
        <meta property="og:description" content="Mantos exclusivos com qualidade premium 1:1. Personalize com seu nome e número oficial." />
        <meta property="og:image" content="https://www.novacustom.com.br/og-image.jpg" />
        <meta property="og:url" content="https://www.novacustom.com.br" />
        <meta property="og:site_name" content="NovaCustom" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NovaCustom | Mantos de Futebol 1:1" />
        <meta name="twitter:description" content="Mantos exclusivos com qualidade premium 1:1. Personalize com seu nome e número oficial." />
        <meta name="twitter:image" content="https://www.novacustom.com.br/og-image.jpg" />
      </Helmet>
      {/* Hero Section */}
      <HeroCarousel />
      
      {/* Benefits Bar */}
      <BenefitsBar />
      
      {/* Minimal Categories */}
      <MinimalCategories />

      {/* Coleção Brasil */}
      {brasilProducts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Exclusivo</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Coleção Brasil</h2>
            </div>
            <Link to="/search?q=Brasil" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors group">
              <span className="text-sm font-medium uppercase tracking-wider">Ver tudo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {brasilProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Destaques</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Os Mais Procurados</h2>
          </div>
          <Link to="/clubes" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors group">
            <span className="text-sm font-medium uppercase tracking-wider">Ver coleção completa</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link 
            to="/clubes" 
            className="inline-flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-xl hover:shadow-black/20"
          >
            Ver Coleção Completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Floating Quote */}
      <FloatingQuote />
      
      {/* Features / Benefits */}
      <section className="bg-gray-50 dark:bg-black py-16 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Qualidade Garantida</h3>
              <p className="text-gray-500 dark:text-gray-400">Tecidos tecnológicos e acabamento premium em todas as peças.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Entrega Rápida</h3>
              <p className="text-gray-500 dark:text-gray-400">Enviamos para todo o Brasil com rastreamento em tempo real.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Pagamento Seguro</h3>
              <p className="text-gray-500 dark:text-gray-400">Parcele em até 12x no cartão ou pague via PIX com desconto.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
