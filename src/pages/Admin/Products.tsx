import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Search, Edit2, Trash2, X, Upload, Save, Loader2, Package, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image_back_url?: string;
  category: string;
  description: string;
  country?: string;
  league?: string;
  year?: string;
  sales_count?: number;
  stock: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image_url: '',
    image_back_url: '',
    country: '',
    league: '',
    year: '',
  });

  const [stockData, setStockData] = useState<Record<string, boolean>>({
    'P': false, 'M': false, 'G': false, 'GG': false, 'XG': false, '2XG': false, '3XL': false
  });

  const sizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL'];

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (product: any | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category || '',
        description: product.description || '',
        image_url: product.image_url || '',
        image_back_url: product.image_back_url || '',
        country: product.country || '',
        league: product.league || '',
        year: product.year || '',
      });

      // Popular estoque se existir
      const initialStock: Record<string, boolean> = {};
      sizes.forEach(size => {
        const item = product.product_stock?.find((s: any) => s.size === size);
        initialStock[size] = item ? item.quantity > 0 : false;
      });
      setStockData(initialStock);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        image_url: '',
        image_back_url: '',
        country: '',
        league: '',
        year: '',
      });
      setStockData({
        'P': false, 'M': false, 'G': false, 'GG': false, 'XG': false, '2XG': false, '3XL': false
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      // Deletar estoque primeiro devido a FK
      await supabase.from('product_stock').delete().eq('product_id', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productPayload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        image_url: formData.image_url,
        image_back_url: formData.image_back_url,
        country: formData.country || null,
        league: formData.league || null,
        year: formData.year || null,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([{ ...productPayload, stock: 0 }])
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Salvar Estoque
      if (productId) {
        const stockItems = Object.entries(stockData).map(([size, isAvailable]) => ({
          product_id: productId,
          size,
          quantity: isAvailable ? 999 : 0 // Usamos 999 para disponível, 0 para indisponível
        }));

        const { error: stockError } = await supabase
          .from('product_stock')
          .upsert(stockItems, { onConflict: 'product_id,size' });

        if (stockError) throw stockError;

        // Atualizar estoque total na tabela products (soma das quantidades)
        const totalStock = stockItems.reduce((acc, curr) => acc + curr.quantity, 0);
        await supabase.from('products').update({ stock: totalStock }).eq('id', productId);
      }

      setIsModalOpen(false);
      fetchProducts();
      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Produtos Admin | NovaCustom</title>
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Produtos</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o catálogo de produtos da sua loja.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, categoria..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{products.length}</div>
            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Produtos Total</div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-64 shadow-sm" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum produto encontrado.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="aspect-[4/5] relative bg-gray-50 overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button 
                    onClick={() => handleOpenModal(product)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white shadow-sm transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg hover:bg-red-50 shadow-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {product.category && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {product.category}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-zinc-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Package className="w-3 h-3" />
                    {product.stock} un
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-zinc-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight uppercase">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Preencha os dados técnicos do manto.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Nome do Produto</label>
                    <input
                      required
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                      placeholder="Ex: Flamengo Home 2024"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Preço (R$)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Categoria</label>
                    <input
                      required
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                      placeholder="Ex: Nacionais, Internacionais, Retro"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">País</label>
                      <input
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-black outline-none transition-all"
                        placeholder="Brasil"
                        value={formData.country}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Liga</label>
                      <input
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-black outline-none transition-all"
                        placeholder="La Liga"
                        value={formData.league}
                        onChange={e => setFormData({ ...formData, league: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Ano</label>
                      <input
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-black outline-none transition-all"
                        placeholder="2024"
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">URL da Imagem (Frente)</label>
                    <input
                      required
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all font-mono"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">URL da Imagem (Costas)</label>
                    <input
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all font-mono"
                      placeholder="https://... (opcional)"
                      value={formData.image_back_url}
                      onChange={e => setFormData({ ...formData, image_back_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Descrição</label>
                    <textarea
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                      placeholder="Detalhes sobre o tecido, patch, etc."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Stock Management inside Modal */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Disponibilidade por Tamanho
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setStockData({ ...stockData, [size]: !stockData[size] })}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1",
                        stockData[size]
                          ? "border-black bg-black text-white"
                          : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{size}</span>
                      <span className="text-[8px] font-bold uppercase opacity-60">
                        {stockData[size] ? 'Disponível' : 'Esgotado'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-sm text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
                >
                  Cancelar
                </button>
                <button
                  disabled={isSaving}
                  type="submit"
                  className="flex-1 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
