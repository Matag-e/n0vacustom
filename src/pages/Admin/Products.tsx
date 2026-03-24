import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Search, Edit2, Trash2, X, Upload, Save, Loader2, Package, Image as ImageIcon,
  CheckCircle2, Layers
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
  model_type?: string;
  sales_count?: number;
  shipping_type?: 'national' | 'import' | null;
  stock: number;
  is_active: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [bulkItems, setBulkItems] = useState<any[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [testProduct, setTestProduct] = useState<Product | null>(null);
  const [isTogglingTest, setIsTogglingTest] = useState(false);

  const toggleTestProduct = async () => {
    if (!testProduct) {
      toast.error('Produto de teste não encontrado.');
      return;
    }

    setIsTogglingTest(true);
    const newStatus = !testProduct.is_active;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', testProduct.id);

      if (error) throw error;

      setTestProduct({ ...testProduct, is_active: newStatus });
      setProducts(prev => prev.map(p => p.id === testProduct.id ? { ...p, is_active: newStatus } : p));
      toast.success(newStatus ? 'Produto de teste ATIVADO!' : 'Produto de teste DESATIVADO!');
    } catch (error: any) {
      console.error('Error toggling test product:', error);
      toast.error('Erro ao alternar status do produto de teste: ' + (error.message || 'Erro desconhecido.'));
    } finally {
      setIsTogglingTest(false);
    }
  };

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
    model_type: '',
    shipping_type: null as 'national' | 'import' | null,
    is_active: true,
  });

  const [stockData, setStockData] = useState<Record<string, boolean>>({
    'P': false, 'M': false, 'G': false, 'GG': false, 'XG': false, '2XG': false, '3XL': false, '4XL': false
  });

  const baseSizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL'];
  const [availableSizes, setAvailableSizes] = useState<string[]>(baseSizes);

  useEffect(() => {
    const modelType = (formData.model_type || '').toLowerCase();
    const category = (formData.category || '').toLowerCase();
    
    const isRetro = modelType === 'retro' || category.includes('retrô') || category.includes('retro');
    const isJogador = modelType === 'jogador';
    
    if (!isRetro && !isJogador) {
      setAvailableSizes([...baseSizes, '4XL']);
    } else {
      setAvailableSizes(baseSizes);
      setStockData(prev => ({ ...prev, '4XL': false }));
    }
  }, [formData.model_type, formData.category]);

  const sizes = availableSizes;

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
      
      // Encontrar o produto de teste (ID: dae55cc7-6786-4172-ba88-d4a721490fd5)
      const test = data?.find(p => p.id === 'dae55cc7-6786-4172-ba88-d4a721490fd5');
      if (test) setTestProduct(test);
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
        model_type: product.model_type || '',
        shipping_type: product.shipping_type || null,
        is_active: product.is_active ?? true,
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
        model_type: '',
        shipping_type: null as 'national' | 'import' | null,
        is_active: true,
      });
      setStockData({
        'P': false, 'M': false, 'G': false, 'GG': false, 'XG': false, '2XG': false, '3XL': false
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'image_back_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isBack = field === 'image_back_url';
    if (isBack) setIsUploadingBack(true);
    else setIsUploading(true);

    try {
      // 1. Otimização/Compressão da imagem no navegador
      const optimizedFile = await optimizeImage(file);
      
      const fileExt = optimizedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, optimizedFile);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('O bucket "products" não foi encontrado no Supabase. Por favor, crie um bucket público chamado "products" no painel do Supabase.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [field]: publicUrl }));
      toast.success(`Imagem ${optimizedFile.size > 1024 * 1024 ? (optimizedFile.size / (1024 * 1024)).toFixed(2) + 'MB' : (optimizedFile.size / 1024).toFixed(0) + 'KB'} enviada!`);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Erro ao enviar imagem.');
    } finally {
      if (isBack) setIsUploadingBack(false);
      else setIsUploading(false);
    }
  };

  // Função para comprimir imagem usando Canvas API
  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar se for muito grande (max 1200px)
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Converter para JPEG com qualidade 0.7 (70%)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                resolve(file); // Fallback para o original se falhar
              }
            },
            'image/jpeg',
            0.7
          );
        };
      };
    });
  };

  const handleBulkFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsBulkModalOpen(true);
    setBulkProcessing(true);

    // Agrupar arquivos por nome base (removendo -frente e -costas)
    const groups: Record<string, { frente?: File, costas?: File }> = {};
    
    files.forEach(file => {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // remove extensão
      
      // Identificar se é frente ou costas de forma mais robusta
      const isBack = /-(costas)$/i.test(fileName);
      const isFront = /-(frente)$/i.test(fileName);
      
      let baseName = fileName;
      if (isBack) baseName = fileName.replace(/-costas$/i, "");
      else if (isFront) baseName = fileName.replace(/-frente$/i, "");

      if (!groups[baseName]) groups[baseName] = {};
      if (isBack) groups[baseName].costas = file;
      else groups[baseName].frente = file;
    });

    const newItems = Object.entries(groups).map(([baseName, files]) => {
      // Parser inteligente: clube-tipo-ano
      const parts = baseName.split('-');
      
      const typeMap: Record<string, string> = {
        'home': 'CASA',
        'away': 'FORA',
        'third': 'TERCEIRA',
        'forth': 'QUARTA',
        'fourth': 'QUARTA',
        'woman': 'FEMININA'
      };
      
      const types = ['home', 'away', 'third', 'forth', 'fourth'];
      
      // Encontrar a posição do tipo principal (home/away/etc)
      const typeIndex = parts.findIndex(p => types.includes(p.toLowerCase()));
      // Verificar se contém 'woman' em qualquer parte
      const isWoman = parts.some(p => p.toLowerCase() === 'woman');
      
      let suggestedName = "";
      let club = "";

      if (typeIndex !== -1) {
        club = parts.slice(0, typeIndex).join(' ').toUpperCase();
        const rawType = parts[typeIndex].toLowerCase();
        const translatedType = typeMap[rawType] || rawType.toUpperCase();
        const gender = isWoman ? ' FEMININA' : '';
        let year = '2026';

        // O ano costuma ser a próxima parte após o tipo, ou após 'woman'
        const nextPart = parts[typeIndex + 1];
        const afterNextPart = parts[typeIndex + 2];

        if (nextPart && /^\d{2,4}$/.test(nextPart)) {
          year = nextPart;
        } else if (afterNextPart && /^\d{2,4}$/.test(afterNextPart)) {
          year = afterNextPart;
        }

        if (year.length === 2) year = '20' + year;

        suggestedName = `${club} - ${translatedType}${gender} ${year}`;
      } else {
        // Fallback se não seguir o padrão, mas ainda traduzindo termos avulsos
        suggestedName = baseName.toUpperCase()
          .replace(/-HOME/gi, ' - CASA')
          .replace(/-AWAY/gi, ' - FORA')
          .replace(/-THIRD/gi, ' - TERCEIRA')
          .replace(/-FORTH/gi, ' - QUARTA')
          .replace(/-WOMAN/gi, ' FEMININA')
          .replace(/[-_]/g, " ");
      }

      return {
        file: files.frente || files.costas, // arquivo principal para preview
        backFile: files.frente ? files.costas : null, // se o principal for frente, costas vai aqui
        name: suggestedName,
        price: '179.90',
        category: 'Nacionais',
        country: '',
        league: '',
        year: suggestedName.split(' ').pop() || '2026',
        model_type: '',
        status: 'pending' as 'pending' | 'uploading' | 'completed' | 'error',
        preview: URL.createObjectURL(files.frente || files.costas!)
      };
    });

    setBulkItems(prev => [...prev, ...newItems]);
    setBulkProcessing(false);
  };

  const processBulkUpload = async () => {
    setBulkProcessing(true);
    let successCount = 0;

    for (let i = 0; i < bulkItems.length; i++) {
      const item = bulkItems[i];
      if (item.status === 'completed') continue;

      try {
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'uploading' } : it));

        // 1. Otimizar e Upload Frente
        const optimizedFile = await optimizeImage(item.file);
        const fileExt = optimizedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, optimizedFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);

        // 2. Otimizar e Upload Costas (se existir)
        let publicBackUrl = null;
        if (item.backFile) {
          const optimizedBackFile = await optimizeImage(item.backFile);
          const backFileName = `${Math.random().toString(36).substring(2)}-back-${Date.now()}.${fileExt}`;
          const backFilePath = `products/${backFileName}`;

          const { error: backUploadError } = await supabase.storage.from('products').upload(backFilePath, optimizedBackFile);
          if (!backUploadError) {
            const { data: { publicUrl: backUrl } } = supabase.storage.from('products').getPublicUrl(backFilePath);
            publicBackUrl = backUrl;
          }
        }

        // 3. Criar Produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert([{
            name: item.name,
            price: parseFloat(item.price),
            category: item.category,
            model_type: item.model_type,
            country: item.country || null,
            league: item.league || null,
            year: item.year || null,
            image_url: publicUrl,
            image_back_url: publicBackUrl,
            shipping_type: null,
            is_active: true,
            stock: 0
          }])
          .select()
          .single();

        if (productError) throw productError;

        // 4. Criar Estoque
        const stockItems = sizes.map(size => ({
          product_id: product.id,
          size,
          quantity: 999
        }));

        await supabase.from('product_stock').upsert(stockItems);
        await supabase.from('products').update({ stock: 999 * sizes.length }).eq('id', product.id);

        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'completed' } : it));
        successCount++;
      } catch (error) {
        console.error('Bulk upload error:', error);
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error' } : it));
      }
    }

    setBulkProcessing(false);
    if (successCount > 0) {
      toast.success(`${successCount} produtos criados com sucesso!`);
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja inativar este produto? (Ele não será mais exibido na loja, mas os pedidos anteriores serão preservados)')) return;

    try {
      // Usamos a abordagem de "Soft Delete" (Inativação) para não quebrar o histórico de pedidos
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('Produto inativado com sucesso!');
    } catch (error: any) {
      console.error('Error inactivating product:', error);
      toast.error('Erro ao inativar produto: ' + (error.message || 'Verifique as permissões no Supabase.'));
    }
  };

  const handleCleanupImages = async () => {
    if (!confirm('Deseja escanear e apagar imagens órfãs (não vinculadas a nenhum produto) do storage? Esta ação economiza espaço no Supabase.')) return;

    setIsCleaning(true);
    try {
      // 1. Listar todos os arquivos na pasta products do bucket
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('products')
        .list('products', { limit: 1000 });

      if (storageError) throw storageError;
      if (!storageFiles || storageFiles.length === 0) {
        toast.info('Nenhuma imagem encontrada no storage.');
        return;
      }

      // 2. Buscar todos os produtos (ativos e inativos) para pegar as URLs de imagem
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('image_url, image_back_url');

      if (productsError) throw productsError;

      // 3. Extrair os nomes dos arquivos das URLs do banco
      const usedFiles = new Set<string>();
      allProducts.forEach(p => {
        if (p.image_url) {
          const fileName = p.image_url.split('/').pop();
          if (fileName) usedFiles.add(fileName);
        }
        if (p.image_back_url) {
          const fileName = p.image_back_url.split('/').pop();
          if (fileName) usedFiles.add(fileName);
        }
      });

      // 4. Identificar arquivos órfãos
      const orphanFiles = storageFiles
        .filter(file => file.name !== '.emptyFolderPlaceholder') // ignorar placeholder se houver
        .filter(file => !usedFiles.has(file.name))
        .map(file => `products/${file.name}`);

      if (orphanFiles.length === 0) {
        toast.success('Nenhuma imagem órfã encontrada. Tudo limpo!');
        return;
      }

      if (!confirm(`Foram encontradas ${orphanFiles.length} imagens órfãs. Deseja apagá-las permanentemente?`)) return;

      // 5. Apagar arquivos órfãos
      const { error: deleteError } = await supabase.storage
        .from('products')
        .remove(orphanFiles);

      if (deleteError) throw deleteError;

      toast.success(`${orphanFiles.length} imagens órfãs removidas com sucesso!`);
    } catch (error: any) {
      console.error('Error cleaning up images:', error);
      toast.error('Erro ao limpar imagens: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsCleaning(false);
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
        model_type: formData.model_type || null,
        shipping_type: formData.shipping_type,
        is_active: formData.is_active,
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
        
        <div className="flex flex-wrap gap-3">
          {testProduct && (
            <button 
              onClick={toggleTestProduct}
              disabled={isTogglingTest}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border",
                testProduct.is_active 
                  ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100" 
                  : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
              )}
            >
              {isTogglingTest ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className={cn("w-4 h-4", !testProduct.is_active && "text-red-400")} />
              )}
              {testProduct.is_active ? "Produto de Teste ON" : "Produto de Teste OFF"}
            </button>
          )}
          <button 
            onClick={handleCleanupImages}
            disabled={isCleaning}
            className="flex items-center gap-2 bg-white text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isCleaning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Limpar Storage
          </button>
          <label className="flex items-center gap-2 bg-white text-black border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm cursor-pointer">
            <Layers className="w-4 h-4" />
            Upload em Lote
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleBulkFileSelect}
            />
          </label>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
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
            <div key={product.id} className={cn(
              "bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group",
              product.is_active ? "border-gray-100" : "border-red-200 opacity-75"
            )}>
              <div className="aspect-[4/5] relative bg-gray-50 overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                      !product.is_active && "grayscale opacity-50"
                    )}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                {!product.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-red-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Inativo
                    </div>
                  </div>
                )}

                {/* Shipping Type Badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.shipping_type && (
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border",
                      product.shipping_type === 'national' 
                        ? "bg-green-500/90 text-white border-green-400" 
                        : "bg-blue-500/90 text-white border-blue-400"
                    )}>
                      {product.shipping_type === 'national' ? 'Brasil' : 'Importado'}
                    </div>
                  )}
                </div>
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

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !bulkProcessing && setIsBulkModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Upload em Lote</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configurar novos produtos em massa</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-2">
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">País p/ todos</label>
                    <input 
                      type="text"
                      placeholder="Ex: Brasil"
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-black w-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          setBulkItems(prev => prev.map(item => item.status === 'pending' ? { ...item, country: val } : item));
                          toast.success('País aplicado a todos!');
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Liga p/ todos</label>
                    <input 
                      type="text"
                      placeholder="Ex: La Liga"
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-black w-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          setBulkItems(prev => prev.map(item => item.status === 'pending' ? { ...item, league: val } : item));
                          toast.success('Liga aplicada a todos!');
                        }
                      }}
                    />
                  </div>
                </div>
                <button onClick={() => !bulkProcessing && setIsBulkModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {bulkItems.map((item, index) => (
                <div key={index} className={cn(
                  "flex flex-col md:flex-row gap-4 p-4 rounded-2xl border transition-all",
                  item.status === 'completed' ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                )}>
                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                    <img src={item.preview} className="w-full h-full object-contain" alt="Preview" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Produto</label>
                      <input 
                        disabled={item.status !== 'pending'}
                        value={item.name}
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, name: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço</label>
                      <input 
                        disabled={item.status !== 'pending'}
                        type="number"
                        value={item.price}
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, price: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
                      <input 
                        disabled={item.status !== 'pending'}
                        value={item.category}
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, category: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">País</label>
                      <input 
                        disabled={item.status !== 'pending'}
                        value={item.country}
                        placeholder="Brasil"
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, country: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Liga</label>
                      <input 
                        disabled={item.status !== 'pending'}
                        value={item.league}
                        placeholder="Brasileirão"
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, league: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano</label>
                      <input 
                        disabled={item.status !== 'pending'}
                        value={item.year}
                        placeholder="2026"
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, year: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modelo</label>
                      <select 
                        disabled={item.status !== 'pending'}
                        value={item.model_type}
                        onChange={(e) => setBulkItems(prev => prev.map((it, idx) => idx === index ? { ...it, model_type: e.target.value } : it))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                      >
                        <option value="">Nenhum</option>
                        <option value="torcedor">Torcedor</option>
                        <option value="jogador">Jogador</option>
                        <option value="retro">Retrô</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center min-w-[40px]">
                    {item.status === 'pending' && (
                      <button 
                        onClick={() => setBulkItems(prev => prev.filter((_, idx) => idx !== index))}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    {item.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                    {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {item.status === 'error' && <X className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
              ))}

              {bulkItems.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
                  <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase text-sm">Nenhuma imagem selecionada</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {bulkItems.filter(i => i.status === 'completed').length} de {bulkItems.length} concluídos
              </p>
              <div className="flex gap-3">
                <button 
                  disabled={bulkProcessing}
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Fechar
                </button>
                <button 
                  disabled={bulkProcessing || bulkItems.filter(i => i.status === 'pending').length === 0}
                  onClick={processBulkUpload}
                  className="flex items-center gap-2 bg-black text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-zinc-50/50 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                    {editingProduct ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-13">
                  {editingProduct ? `Editando: ${editingProduct.name}` : 'Cadastre um novo manto na loja'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 hover:bg-gray-200 text-gray-400 hover:text-gray-900 rounded-full transition-all group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-zinc-50/50 p-6 rounded-[1.5rem] border border-zinc-100 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Informações Básicas
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Nome do Produto</label>
                        <input
                          required
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                          placeholder="Ex: Flamengo Home 2024"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Preço (R$)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                            <input
                              required
                              type="number"
                              step="0.01"
                              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                              placeholder="0,00"
                              value={formData.price}
                              onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Categoria</label>
                          <input
                            required
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                            placeholder="Ex: Nacionais"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50/50 p-6 rounded-[1.5rem] border border-zinc-100 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Atributos Técnicos
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Modelo</label>
                        <select
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all appearance-none shadow-sm"
                          value={formData.model_type}
                          onChange={e => setFormData({ ...formData, model_type: e.target.value })}
                        >
                          <option value="">Não especificado</option>
                          <option value="torcedor">Torcedor</option>
                          <option value="jogador">Jogador</option>
                          <option value="retro">Retrô</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Tipo de Envio</label>
                        <select
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all appearance-none shadow-sm"
                          value={formData.shipping_type || ''}
                          onChange={e => setFormData({ ...formData, shipping_type: (e.target.value || null) as 'national' | 'import' | null })}
                        >
                          <option value="">Não definido</option>
                          <option value="import">Importação (30-45 dias)</option>
                          <option value="national">Estoque Nacional (15 dias)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">País</label>
                        <input
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                          placeholder="Brasil"
                          value={formData.country}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Ano</label>
                        <input
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                          placeholder="2024"
                          value={formData.year}
                          onChange={e => setFormData({ ...formData, year: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Liga</label>
                      <input
                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                        placeholder="Ex: La Liga, Premier League..."
                        value={formData.league}
                        onChange={e => setFormData({ ...formData, league: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-50/50 p-6 rounded-[1.5rem] border border-zinc-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Descrição do Produto</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all resize-none shadow-sm"
                      placeholder="Detalhes sobre o tecido, patches, qualidade tailandesa 1:1..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Right Column: Images & Status */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-zinc-50/50 p-6 rounded-[1.5rem] border border-zinc-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Mídia do Produto
                    </h4>

                    {/* Image Front */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Capa (Frente)</label>
                      <div className="relative group aspect-[4/5] bg-white border-2 border-dashed border-zinc-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-black/20">
                        {formData.image_url ? (
                          <>
                            <img src={formData.image_url} alt="Front" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="cursor-pointer bg-white text-black p-3 rounded-xl font-bold text-xs shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Alterar
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image_url')} />
                              </label>
                              <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="bg-red-500 text-white p-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
                            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Upload className="w-6 h-6 text-gray-400" />}
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Clique para enviar a frente</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image_url')} disabled={isUploading} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Image Back */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Detalhes (Costas)</label>
                      <div className="relative group aspect-[4/5] bg-white border-2 border-dashed border-zinc-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-black/20">
                        {formData.image_back_url ? (
                          <>
                            <img src={formData.image_back_url} alt="Back" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="cursor-pointer bg-white text-black p-3 rounded-xl font-bold text-xs shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Alterar
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image_back_url')} />
                              </label>
                              <button type="button" onClick={() => setFormData({ ...formData, image_back_url: '' })} className="bg-red-500 text-white p-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
                            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              {isUploadingBack ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Upload className="w-6 h-6 text-gray-400" />}
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Clique para enviar as costas</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image_back_url')} disabled={isUploadingBack} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50/50 p-6 rounded-[1.5rem] border border-zinc-100">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          formData.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        )}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-gray-900 uppercase tracking-widest block">Status da Loja</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            {formData.is_active ? 'Visível para clientes' : 'Oculto na loja'}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.is_active}
                          onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                      <Package className="w-5 h-5 text-zinc-400" />
                      Gestão de Inventário
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Marque os tamanhos que estão em estoque (999 un)</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        const allOn = Object.keys(stockData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                        setStockData(allOn);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Todos ON
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const allOff = Object.keys(stockData).reduce((acc, k) => ({ ...acc, [k]: false }), {});
                        setStockData(allOff);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Todos OFF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
                  {sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setStockData({ ...stockData, [size]: !stockData[size] })}
                      className={cn(
                        "group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 gap-2 overflow-hidden",
                        stockData[size]
                          ? "border-white bg-white text-black scale-105 shadow-lg"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      )}
                    >
                      {stockData[size] && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-3 h-3 text-black" />
                        </div>
                      )}
                      <span className="text-sm font-black uppercase tracking-tighter">{size}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        stockData[size] ? "opacity-100" : "opacity-40"
                      )}>
                        {stockData[size] ? 'ATIVO' : 'OFF'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-gray-100 bg-zinc-50 flex flex-col md:flex-row gap-4 sticky bottom-0 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-white hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
              >
                Descartar Alterações
              </button>
              <button
                disabled={isSaving}
                onClick={handleSubmit}
                type="submit"
                className="flex-[2] bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                {editingProduct ? 'Atualizar Manto' : 'Publicar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
