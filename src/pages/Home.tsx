import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, ShieldCheck, Truck, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MinimalCategories } from '@/components/MinimalCategories';
import { FloatingQuote } from '@/components/FloatingQuote';
import { BenefitsBar } from '@/components/BenefitsBar';
import { Helmet } from 'react-helmet-async';
import { Product } from '@/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Home: Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <Helmet>
        <title>NovaCustom | Camisas de Futebol Tailandesas 1:1</title>
        <meta name="description" content="Sua loja definitiva de camisas de time tailandesas 1:1. Qualidade premium, personalização oficial e entrega para todo o Brasil." />
        <meta property="og:title" content="NovaCustom | Camisas de Futebol Tailandesas 1:1" />
        <meta property="og:description" content="Sua loja definitiva de camisas de time tailandesas 1:1. Qualidade premium, personalização oficial e entrega para todo o Brasil." />
        <meta property="og:image" content="/og-image.jpg" />
      </Helmet>
      
      {/* Hero Section */}
      <HeroCarousel />
      
      {/* Benefits Bar */}
      <BenefitsBar />
      
      {/* Minimal Categories */}
      <MinimalCategories />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 animate-pulse h-[400px]">
                <div className="bg-gray-200 dark:bg-zinc-800 h-[300px] w-full mb-4"></div>
                <div className="px-2 space-y-3">
                  <div className="bg-gray-200 dark:bg-zinc-800 h-4 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 dark:bg-zinc-800 h-3 w-1/3"></div>
                    <div className="bg-gray-200 dark:bg-zinc-800 h-3 w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center md:hidden">
          <Link to="/clubes" className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-medium uppercase tracking-wider text-sm border-b border-gray-900 dark:border-white pb-1">
            Ver coleção completa <ArrowRight className="w-4 h-4" />
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
