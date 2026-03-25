import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCard, Product } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { Filter, ChevronDown, Search } from 'lucide-react';
import { cn, seededShuffle } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

interface CategoryPageProps {
  title: string;
  category?: string; // Optional: filter by specific category if provided
}

export default function CategoryPage({ title, category }: CategoryPageProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'random' | 'newest' | 'price-asc' | 'price-desc'>('random');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // Derived filter options from all products available in this category
  const countries = Array.from(new Set(allProducts.map(p => p.country).filter(Boolean))) as string[];
  const leagues = Array.from(new Set(allProducts.map(p => p.league).filter(Boolean))) as string[];
  const years = Array.from(new Set(allProducts.map(p => p.year).filter(Boolean))) as string[];

  // Fetch products (only when category changes)
  useEffect(() => {
    async function fetchAllCategoryProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, product_stock(*), reviews(*)')
          .eq('is_active', true);
        
        if (category && !['clubes', 'selecoes', 'retro', 'artes-custom', 'personalizados', 'lancamentos', 'mais-vendidos'].includes(category)) {
           query = query.ilike('category', `%${category}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          let baseData = [...data];
          
          if (category === 'clubes') {
            baseData = baseData.filter(p => {
              const cat = (p.category || '').toLowerCase().trim();
              const tags = cat.split(',').map(t => t.trim());
              return tags.includes('clubes') || tags.includes('nacionais');
            });
          } else if (category === 'selecoes') {
            baseData = baseData.filter(p => {
              const cat = (p.category || '').toLowerCase().trim();
              const tags = cat.split(',').map(t => t.trim());
              return tags.includes('selecoes') || tags.includes('seleção') || tags.includes('selecao');
            });
          } else if (category === 'retro') {
            baseData = baseData.filter(p => {
              const cat = (p.category || '').toLowerCase().trim();
              const tags = cat.split(',').map(t => t.trim());
              return tags.includes('retro');
            });
          } else if (category === 'artes-custom' || category === 'personalizados') {
            baseData = baseData.filter(p => {
              const cat = (p.category || '').toLowerCase().trim();
              const tags = cat.split(',').map(t => t.trim());
              return tags.some(t => t.includes('custom') || t.includes('personalizado'));
            });
          }
          
          setAllProducts(baseData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllCategoryProducts();
  }, [category]);

  // Filter and sort products (local operation)
  useEffect(() => {
    if (allProducts.length === 0 && !loading) return;

    let filteredData = [...allProducts];

    // 1. Search Filter (by Name or Description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description || '').toLowerCase().includes(term)
      );
    }

    // 2. Price Filter
    filteredData = filteredData.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // 3. Availability Filter
    if (inStockOnly) {
      filteredData = filteredData.filter(p => (p.stock || 0) > 0);
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

    // 5. Smart Filters (Country, League, Year)
    if (selectedCountries.length > 0) {
      filteredData = filteredData.filter(p => p.country && selectedCountries.includes(p.country));
    }
    if (selectedLeagues.length > 0) {
      filteredData = filteredData.filter(p => p.league && selectedLeagues.includes(p.league));
    }
    if (selectedYears.length > 0) {
      filteredData = filteredData.filter(p => p.year && selectedYears.includes(p.year));
    }
    
    // 6. Special Categories Logic
    if (category === 'lancamentos') {
       const threeDaysAgo = new Date();
       threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
       filteredData = filteredData.filter(p => new Date(p.created_at) >= threeDaysAgo);
    } else if (category === 'mais-vendidos') {
       filteredData = filteredData.filter(p => (p.sales_count || 0) > 0 || (p.reviews?.length || 0) > 0);
       filteredData.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }

    // 7. Sorting
    if (category !== 'mais-vendidos') {
      if (sortBy === 'random') {
        let sessionSeed = sessionStorage.getItem('category_products_seed');
        if (!sessionSeed) {
          sessionSeed = Math.floor(Math.random() * 10000).toString();
          sessionStorage.setItem('category_products_seed', sessionSeed);
        }
        filteredData = seededShuffle(filteredData, parseInt(sessionSeed));
      } else if (sortBy === 'newest') {
        filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === 'price-asc') {
        filteredData.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filteredData.sort((a, b) => b.price - a.price);
      }
    }

    setProducts(filteredData);
  }, [allProducts, sortBy, priceRange, selectedSizes, searchTerm, inStockOnly, selectedCountries, selectedLeagues, selectedYears, category, loading]);

  const sizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL', '4XL'];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen pt-24 pb-20 transition-colors duration-300">
      <Helmet>
        <title>{`${title} | NovaCustom`}</title>
      </Helmet>
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 dark:border-zinc-800 pb-8">
          <div>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Coleção</span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome..." 
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

        {/* Controls Bar (Desktop) */}
        <div className="flex justify-between items-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Mostrando <span className="font-bold text-black dark:text-white">{products.length}</span> produtos
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
          {/* Filters Sidebar */}
          <aside className={cn(
            "lg:w-64 space-y-2 lg:block shrink-0",
            showFilters ? "block" : "hidden"
          )}>
            <div className="bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800/50 backdrop-blur-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Filtros</h2>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 1000]);
                    setSelectedSizes([]);
                    setInStockOnly(false);
                    setSelectedCountries([]);
                    setSelectedLeagues([]);
                    setSelectedYears([]);
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                >
                  Limpar tudo
                </button>
              </div>

              {/* Price Filter */}
              <div className="border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-5">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] text-[10px] mb-4">Preço</h3>
                <div className="space-y-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-gray-500">
                    <span>R$ 0</span>
                    <span className="text-black dark:text-white">Até R$ {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div className="border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-5">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] text-[10px] mb-4">Tamanho</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "h-8 text-[9px] font-black border transition-all uppercase rounded-md",
                        selectedSizes.includes(size)
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm"
                          : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400 dark:hover:border-zinc-600"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-5">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.1em]">Em estoque</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-8 h-4 rounded-full transition-colors duration-200 ease-in-out",
                      inStockOnly ? "bg-primary" : "bg-gray-200 dark:bg-zinc-800"
                    )} />
                    <div className={cn(
                      "absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
                      inStockOnly ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </label>
              </div>

              {/* Country Filter */}
              {countries.length > 0 && (
                <div className="border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-5">
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] text-[10px] mb-4">País</h3>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {countries.sort().map((country) => (
                      <button
                        key={country}
                        onClick={() => setSelectedCountries(prev => 
                          prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
                        )}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold border transition-all uppercase rounded-md whitespace-nowrap",
                          selectedCountries.includes(country)
                            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                            : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400"
                        )}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* League Filter */}
              {leagues.length > 0 && (
                <div className="border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-5">
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] text-[10px] mb-4">Liga</h3>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {leagues.sort().map((league) => (
                      <button
                        key={league}
                        onClick={() => setSelectedLeagues(prev => 
                          prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
                        )}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold border transition-all uppercase rounded-md whitespace-nowrap",
                          selectedLeagues.includes(league)
                            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                            : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400"
                        )}
                      >
                        {league}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Year Filter */}
              {years.length > 0 && (
                <div className="mb-0">
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] text-[10px] mb-4">Ano</h3>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {years.sort((a, b) => b.localeCompare(a)).map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYears(prev => 
                          prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
                        )}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold border transition-all uppercase rounded-md whitespace-nowrap",
                          selectedYears.includes(year)
                            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                            : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid */}
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
                <Search className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Nenhum produto encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Tente ajustar seus filtros ou buscar por outro termo.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 1000]);
                    setSelectedSizes([]);
                    setInStockOnly(false);
                    setSelectedCountries([]);
                    setSelectedLeagues([]);
                    setSelectedYears([]);
                  }}
                  className="mt-6 text-primary font-bold uppercase text-xs tracking-widest border-b border-primary pb-1 hover:opacity-80 transition-opacity"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
