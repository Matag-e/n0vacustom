import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductCard, Product } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { Filter, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { cn, seededShuffle } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'random' | 'newest' | 'price-asc' | 'price-desc'>('random');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, product_stock(*), reviews(*)')
          .eq('is_active', true);
        
        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          let filteredData = [...data];

          // 1. Search Filter (by Name or Description)
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter(p => 
              p.name.toLowerCase().includes(term) || 
              (p.description || '').toLowerCase().includes(term) ||
              (p.category || '').toLowerCase().includes(term) ||
              (p.league || '').toLowerCase().includes(term) ||
              (p.country || '').toLowerCase().includes(term)
            );
          }

          // 2. Price Filter
          filteredData = filteredData.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
          
          // 3. Availability Filter
          if (inStockOnly) {
            filteredData = filteredData.filter(p => {
               const stock = p.product_stock || [];
               return stock.some((s: any) => s.quantity > 0);
            });
          }
          
          // 4. Size Filter
          if (selectedSizes.length > 0) {
            filteredData = filteredData.filter(p => {
              const stock = p.product_stock || [];
              return selectedSizes.some(size => 
                stock.some((s: any) => s.size === size && s.quantity > 0)
              );
            });
          }

          // 5. Sorting
          if (sortBy === 'random') {
            let sessionSeed = sessionStorage.getItem('search_products_seed');
            if (!sessionSeed) {
              sessionSeed = Math.floor(Math.random() * 10000).toString();
              sessionStorage.setItem('search_products_seed', sessionSeed);
            }
            filteredData = seededShuffle(filteredData, parseInt(sessionSeed));
          } else if (sortBy === 'newest') {
            filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (sortBy === 'price-asc') {
            filteredData.sort((a, b) => a.price - b.price);
          } else if (sortBy === 'price-desc') {
            filteredData.sort((a, b) => b.price - a.price);
          }

          setProducts(filteredData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchTerm, sortBy, priceRange, selectedSizes, inStockOnly]);

  const sizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL', '4XL'];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen pt-24 pb-20 transition-colors duration-300">
      <Helmet>
        <title>{`Busca: ${searchTerm} | NovaCustom`}</title>
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 dark:border-zinc-800 pb-8">
          <div>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Resultados para</span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {searchTerm || 'Todos os Produtos'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar novamente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-black dark:focus:border-white rounded-lg text-sm transition-all outline-none"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Encontramos <span className="font-bold text-black dark:text-white">{products.length}</span> produtos
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:inline">Ordenar por:</span>
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-transparent font-bold text-sm uppercase tracking-wider pr-8 cursor-pointer outline-none text-black dark:text-white"
              >
                <option value="random">Aleatório</option>
                <option value="newest">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className={cn(
            "lg:w-64 space-y-8 lg:block",
            showFilters ? "block" : "hidden"
          )}>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Preço Máximo</h3>
              <div className="space-y-4">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-black dark:accent-white h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>R$ 0</span>
                  <span>R$ {priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Tamanho</h3>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "py-2 text-xs font-bold border transition-all uppercase",
                      selectedSizes.includes(size)
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Disponibilidade</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-zinc-800 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  Apenas em estoque
                </span>
              </label>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                <SearchIcon className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Nenhum produto encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Tente buscar por outro termo ou limpar os filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
