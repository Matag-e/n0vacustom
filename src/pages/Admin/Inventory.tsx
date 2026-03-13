import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Search, Save, AlertTriangle, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
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
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStockSize(productId: string, size: string, newQuantity: number) {
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
    } catch (error) {
      console.error('Error updating stock size:', error);
      alert('Erro ao atualizar estoque do tamanho.');
    } finally {
      setSavingStock(null);
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sizes = ['P', 'M', 'G', 'GG', 'XG'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie a quantidade disponível de cada produto.</p>
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

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Produto</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Categoria</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-right">Preço</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-center">Total</th>
                {sizes.map(size => (
                  <th key={size} className="px-4 py-4 font-bold text-gray-500 uppercase text-xs text-center w-16">{size}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                    Carregando produtos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
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
                    <td className="px-6 py-4 text-center font-bold">
                      {product.stock}
                    </td>
                    
                    {/* Sizes Columns */}
                    {sizes.map(size => {
                      const stockItem = product.product_stock?.find(s => s.size === size);
                      const quantity = stockItem?.quantity || 0;
                      const isEditing = editingStock?.productId === product.id && editingStock?.size === size;
                      const isSaving = savingStock?.productId === product.id && savingStock?.size === size;

                      return (
                        <td key={size} className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              className="w-16 text-center border border-gray-300 rounded px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              value={editingStock.value}
                              onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                              autoFocus
                              onBlur={() => updateStockSize(product.id, size, parseInt(editingStock.value) || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateStockSize(product.id, size, parseInt(editingStock.value) || 0);
                                if (e.key === 'Escape') setEditingStock(null);
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingStock({ productId: product.id, size, value: quantity.toString() })}
                              className={cn(
                                "w-10 h-8 rounded-md text-sm font-medium transition-colors hover:ring-2 hover:ring-gray-200 focus:outline-none focus:ring-2 focus:ring-black relative",
                                quantity === 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-900"
                              )}
                            >
                              {isSaving ? (
                                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                              ) : (
                                quantity
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
