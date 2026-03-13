import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCard, Product } from '@/components/ProductCard';
import { Filter, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPageProps {
  title: string;
  category?: string; // Optional: filter by specific category if provided
}

export default function CategoryPage({ title, category }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');
        
        // Ajuste na query inicial para não limitar demais antes do filtro JS
        // Se for "clubes", queremos buscar tudo que NÃO é seleção e NÃO é retro, mas o ilike 'clubes' pode ser restritivo demais se o produto não tiver a palavra "clubes"
        // Então, para categorias complexas, melhor buscar tudo e filtrar no JS (já que o banco é pequeno por enquanto)
        if (category === 'clubes' || category === 'selecoes') {
           query = supabase.from('products').select('*');
        } else if (category) {
           query = query.ilike('category', `%${category}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {let filteredData = [...data];

          // Apply client-side filtering for price
          filteredData = filteredData.filter(p => p.price <= priceRange[1]);
          
          // Lógica de Filtragem de Categorias
          if (category === 'clubes') {
             // Clubes: Tudo que NÃO é "seleção" e NÃO é "retro"
             filteredData = filteredData.filter(p => {
               const cat = (p.category || '').toLowerCase();
               const name = p.name.toLowerCase();
               // Se tiver "seleção" ou "retro" ou "portugal" (ou outros países) no nome ou categoria, NÃO é clube
               const isSelecao = cat.includes('seleção') || cat.includes('selecao') || name.includes('seleção') || name.includes('selecao') || name.includes('portugal') || name.includes('brasil') || name.includes('argentina') || name.includes('frança') || name.includes('alemanha') || name.includes('espanha') || name.includes('inglaterra') || name.includes('itália');
               const isRetro = cat.includes('retro') || name.includes('retro');
               const isCustom = cat.includes('custom');
               return !isSelecao && !isRetro && !isCustom;
             });
          } else if (category === 'selecoes') {
             // Seleções: Tudo que TEM "seleção" no nome ou categoria OU categoria é "selecoes" (sem acento) OU nomes de países comuns
             filteredData = filteredData.filter(p => {
               const cat = (p.category || '').toLowerCase();
               const name = p.name.toLowerCase();
               return cat.includes('seleção') || cat.includes('selecao') || name.includes('seleção') || name.includes('selecao') || cat === 'selecoes' || name.includes('portugal') || name.includes('brasil') || name.includes('argentina') || name.includes('frança') || name.includes('alemanha') || name.includes('espanha') || name.includes('inglaterra') || name.includes('itália');
             });
          } else if (category === 'retro') {
             // Retrô: Tudo que TEM "retro" no nome ou categoria
             filteredData = filteredData.filter(p => {
               const cat = (p.category || '').toLowerCase();
               const name = p.name.toLowerCase();
               return cat.includes('retro') || name.includes('retro');
             });
          } else if (category === 'nacional') {
             // Nacionais: Tem "brasileirão" ou "nacional" ou times brasileiros conhecidos (simplificado)
             // Assumindo que produtos nacionais tenham categoria 'nacional' ou 'brasileirão'
             filteredData = filteredData.filter(p => {
               const cat = (p.category || '').toLowerCase();
               return cat.includes('nacional') || cat.includes('brasileirão');
             });
          } else if (category === 'internacional') {
             // Internacionais: Categoria contém internacional ou ligas europeias
             filteredData = filteredData.filter(p => {
               const cat = (p.category || '').toLowerCase();
               return cat.includes('internacional') || cat.includes('europeu');
             });
          } else if (category) {
             // Outras categorias genéricas
             filteredData = filteredData.filter(p => 
               (p.category || '').toLowerCase().includes(category.toLowerCase())
             );
          }
          // if (selectedSizes.length > 0) {
          //   filteredData = filteredData.filter(p => p.sizes && selectedSizes.some(s => p.sizes.includes(s)));
          // }

          // Apply client-side sorting
          if (sortBy === 'newest') {
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
  }, [category, sortBy, priceRange]);

  const sizes = ['P', 'M', 'G', 'GG', 'XG'];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen pt-24 pb-20 transition-colors duration-300">
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
                placeholder="Buscar..." 
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
            "lg:w-64 space-y-8 lg:block",
            showFilters ? "block" : "hidden"
          )}>
            {/* Price Filter */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4">Preço</h3>
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

            {/* Size Filter */}
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
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 animate-pulse h-[400px]">
                    <div className="bg-gray-200 dark:bg-zinc-800 h-[300px] w-full mb-4"></div>
                    <div className="px-2 space-y-3">
                      <div className="bg-gray-200 dark:bg-zinc-800 h-4 w-3/4"></div>
                      <div className="bg-gray-200 dark:bg-zinc-800 h-3 w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}