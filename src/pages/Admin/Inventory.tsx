import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Search, Save, AlertTriangle, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  country?: string;
  league?: string;
  year?: string;
  sales_count?: number;
  shipping_type?: 'national' | 'import';
  product_stock?: {
    size: string;
    quantity: number;
  }[];
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState<{ productId: string, size: string, value: string } | null>(null);
  const [savingStock, setSavingStock] = useState<{ productId: string, size: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_stock (
            size,
            quantity
          )
        `)
        .order('name');

      if (error) throw error;

      // Calculate total stock from sizes for each product to ensure UI consistency
      const productsWithStock = (data || []).map((p: any) => ({
        ...p,
        stock: p.product_stock?.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0) || 0
      }));

      setProducts(productsWithStock);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStockSize(productId: string, size: string, isAvailable: boolean) {
    const newQuantity = isAvailable ? 999 : 0;
    setSavingStock({ productId, size });
    try {
      const { error } = await supabase
        .from('product_stock')
        .upsert({ 
          product_id: productId, 
          size: size, 
          quantity: newQuantity 
        }, { onConflict: 'product_id,size' });

      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => {
        if (p.id === productId) {
          const newStock = p.product_stock?.map(s => 
            s.size === size ? { ...s, quantity: newQuantity } : s
          ) || [];
          
          // If size didn't exist, add it (though fetch handles this usually)
          if (!p.product_stock?.find(s => s.size === size)) {
             newStock.push({ size, quantity: newQuantity });
          }

          // Calculate new total stock
          const totalStock = newStock.reduce((acc, curr) => acc + curr.quantity, 0);
          
          return { ...p, stock: totalStock, product_stock: newStock };
        }
        return p;
      }));

      setEditingStock(null);
      toast.success('Estoque atualizado!');
    } catch (error) {
      console.error('Error updating stock size:', error);
      toast.error('Erro ao atualizar disponibilidade.');
    } finally {
      setSavingStock(null);
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adultSizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL', '4XL'];
  const kidsSizes = ['16', '18', '20', '22', '24', '26', '28'];

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Estoque Admin | NovaCustom</title>
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Disponibilidade</h1>
          <p className="text-gray-500 text-sm mt-1">Marque quais tamanhos estão disponíveis para venda.</p>
        </div>
        
        <button 
          onClick={fetchProducts}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar Lista
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou categoria..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Produto</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Categoria</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-right">Preço</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-center">Status</th>
                <th className="px-4 py-4 font-bold text-gray-500 uppercase text-xs text-center">Tamanhos Disponíveis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                    Carregando produtos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const modelType = (product as any).model_type?.toLowerCase() || '';
                  const category = (product as any).category?.toLowerCase() || '';
                  const name = (product as any).name?.toLowerCase() || '';
                  
                  const isKids = category.includes('kids') || category.includes('infantil') || category.includes('criança') || category.includes('crianca') || name.includes('infantil') || name.includes('kids');
                  const productSizes = isKids ? kidsSizes : adultSizes;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium uppercase">
                          {product.category || 'Geral'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.stock > 0 ? (
                          <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider bg-green-50 px-2 py-1 rounded">Em Estoque</span>
                        ) : (
                          <span className="text-red-600 font-bold text-[10px] uppercase tracking-wider bg-red-50 px-2 py-1 rounded">Esgotado</span>
                        )}
                      </td>
                      
                      {/* Sizes Grid */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {productSizes.map(size => {
                            const isRetro = modelType === 'retro' || category.includes('retrô') || category.includes('retro');
                            const isJogador = modelType === 'jogador';
                            const isFeminina = modelType === 'feminina' || category.includes('feminina');
                            
                            const is4XLNotAllowed = size === '4XL' && (isRetro || isJogador);
                            const isAdultBigSizeNotAllowedForFem = (size === 'XG' || size === '2XG' || size === '3XL' || size === '4XL') && isFeminina;

                            if (is4XLNotAllowed || isAdultBigSizeNotAllowedForFem) return null;
                            
                            const stockItem = product.product_stock?.find(s => s.size === size);
                            const isAvailable = (stockItem?.quantity || 0) > 0;
                            const isSaving = savingStock?.productId === product.id && savingStock?.size === size;

                            return (
                              <button
                                key={size}
                                onClick={() => updateStockSize(product.id, size, !isAvailable)}
                                disabled={isSaving}
                                className={cn(
                                  "w-12 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                  isAvailable 
                                    ? "bg-black text-white shadow-sm" 
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                              >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : size}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500 text-sm">Carregando estoque...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">Nenhum produto encontrado.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const modelType = (product as any).model_type?.toLowerCase() || '';
            const category = (product as any).category?.toLowerCase() || '';
            const name = (product as any).name?.toLowerCase() || '';
            const isKids = category.includes('kids') || category.includes('infantil') || category.includes('criança') || category.includes('crianca') || name.includes('infantil') || name.includes('kids');
            const productSizes = isKids ? kidsSizes : adultSizes;

            return (
              <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-sm">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">
                        {product.category || 'Geral'}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tamanhos Disponíveis</p>
                  <div className="grid grid-cols-4 xs:grid-cols-5 gap-2">
                    {productSizes.map(size => {
                      const isRetro = modelType === 'retro' || category.includes('retrô') || category.includes('retro');
                      const isJogador = modelType === 'jogador';
                      const isFeminina = modelType === 'feminina' || category.includes('feminina');
                      const is4XLNotAllowed = size === '4XL' && (isRetro || isJogador);
                      const isAdultBigSizeNotAllowedForFem = (size === 'XG' || size === '2XG' || size === '3XL' || size === '4XL') && isFeminina;

                      if (is4XLNotAllowed || isAdultBigSizeNotAllowedForFem) return null;
                      
                      const stockItem = product.product_stock?.find(s => s.size === size);
                      const isAvailable = (stockItem?.quantity || 0) > 0;
                      const isSaving = savingStock?.productId === product.id && savingStock?.size === size;

                      return (
                        <button
                          key={size}
                          onClick={() => updateStockSize(product.id, size, !isAvailable)}
                          disabled={isSaving}
                          className={cn(
                            "py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            isAvailable 
                              ? "bg-black text-white shadow-sm" 
                              : "bg-gray-100 text-gray-400"
                          )}
                        >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
