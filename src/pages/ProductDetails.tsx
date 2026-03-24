import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@/components/ProductCard';
import { CustomizationGallery } from '@/components/CustomizationGallery';
import { ArrowLeft, ShoppingCart, Truck, Shield, Ruler, Sparkles, X, Heart, ChevronRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Helmet } from 'react-helmet-async';

import { ProductReviews } from '@/components/ProductReviews';
import { toast } from 'sonner';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [wantsCustomization, setWantsCustomization] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState<'front' | 'back'>('front');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showFittingRoom, setShowFittingRoom] = useState(false);
  const [stockBySize, setStockBySize] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const SIZE_CHARTS = {
    torcedor: [
      { s: 'P', w: '53–55', h: '69–71', minH: 162, maxH: 170, minW: 50, maxW: 62 },
      { s: 'M', w: '55–57', h: '71–73', minH: 170, maxH: 176, minW: 62, maxW: 78 },
      { s: 'G', w: '57–58', h: '73–75', minH: 176, maxH: 182, minW: 78, maxW: 83 },
      { s: 'GG', w: '58–60', h: '75–78', minH: 182, maxH: 190, minW: 83, maxW: 90 },
      { s: 'XG', w: '60–62', h: '78–81', minH: 190, maxH: 195, minW: 90, maxW: 97 },
      { s: '2XG', w: '62–64', h: '81–83', minH: 192, maxH: 197, minW: 97, maxW: 104 },
      { s: '3XL', w: '64–65', h: '83–85', minH: 197, maxH: 200, minW: 104, maxW: 110 },
      { s: '4XL', w: '64–65', h: '83–85', minH: 197, maxH: 200, minW: 104, maxW: 110 }
    ],
    jogador: [
      { s: 'P', w: '49–51', h: '67–69', minH: 162, maxH: 170, minW: 50, maxW: 62 },
      { s: 'M', w: '51–53', h: '69–71', minH: 170, maxH: 175, minW: 62, maxW: 75 },
      { s: 'G', w: '53–55', h: '71–73', minH: 175, maxH: 180, minW: 75, maxW: 80 },
      { s: 'GG', w: '55–57', h: '73–76', minH: 180, maxH: 185, minW: 80, maxW: 85 },
      { s: 'XG', w: '57–60', h: '76–78', minH: 185, maxH: 190, minW: 85, maxW: 90 },
      { s: '2XG', w: '60–63', h: '78–79', minH: 190, maxH: 195, minW: 90, maxW: 95 }
    ],
    feminina: [
      { s: 'P', w: '40–41', h: '61–63', minH: 150, maxH: 160, minW: 40, maxW: 55 },
      { s: 'M', w: '41–44', h: '63–66', minH: 160, maxH: 165, minW: 55, maxW: 65 },
      { s: 'G', w: '44–47', h: '66–69', minH: 165, maxH: 170, minW: 65, maxW: 75 },
      { s: 'GG', w: '47–50', h: '69–71', minH: 170, maxH: 175, minW: 75, maxW: 85 }
    ]
  };

  const baseSizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL'];
  const [availableSizes, setAvailableSizes] = useState<string[]>(baseSizes);

  const getModelType = () => {
    const model = (product?.model_type || '').toLowerCase();
    const cat = (product?.category || '').toLowerCase();
    const title = (product?.name || '').toLowerCase();
    
    if (model === 'feminina' || cat.includes('feminina') || cat.includes('feminino') || title.includes('feminina') || title.includes('feminino')) return 'feminina';
    if (model === 'jogador' || model === 'retro' || cat.includes('retrô') || cat.includes('retro')) return 'jogador';
    return 'torcedor';
  };

  useEffect(() => {
    if (product) {
      const model = getModelType();
      
      if (model === 'torcedor') {
        setAvailableSizes([...baseSizes, '4XL']);
      } else if (model === 'jogador') {
        setAvailableSizes(baseSizes);
      } else {
        setAvailableSizes(['P', 'M', 'G', 'GG']);
      }
    }
  }, [product]);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  async function checkWishlistStatus() {
    if (!user || !product) return;
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();
    setIsInWishlist(!!data);
  }

  async function toggleWishlist() {
    if (!user) {
      toast.error('Faça login para adicionar aos favoritos.');
      return;
    }
    if (!product) return;

    if (isInWishlist) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      if (!error) {
        setIsInWishlist(false);
        toast.success('Removido dos favoritos');
      }
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: product.id });
      if (!error) {
        setIsInWishlist(true);
        toast.success('Adicionado aos favoritos');
      }
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
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
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        
        setProduct(data);
        
        // Map stock array to object for easier lookup
        const stockMap: Record<string, number> = {};
        if (data.product_stock) {
          data.product_stock.forEach((item: any) => {
            stockMap[item.size] = item.quantity;
          });
        }
        setStockBySize(stockMap);
        
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const FittingRoomModal = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [recommendation, setRecommendation] = useState<string | null>(null);

    const handleRecommend = (e: React.FormEvent) => {
      e.preventDefault();
      const h = parseInt(height);
      const w = parseInt(weight);

      if (isNaN(h) || isNaN(w)) return;

      const currentModel = getModelType();
      const chart = SIZE_CHARTS[currentModel as keyof typeof SIZE_CHARTS] || SIZE_CHARTS.torcedor;

      // Find the best matching size based on the table data
      let size = 'G'; // Fallback
      
      const match = chart.find(item => 
        h >= (item as any).minH && h <= (item as any).maxH && 
        w >= (item as any).minW && w <= (item as any).maxW
      );

      if (match) {
        size = match.s;
      } else {
        // Simple proximity fallback if no exact range matches
        if (w < 60) size = 'P';
        else if (w < 75) size = 'M';
        else if (w < 85) size = 'G';
        else if (w < 95) size = 'GG';
        else if (w < 105) size = 'XG';
        else size = '2XG';
      }

      setRecommendation(size);
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowFittingRoom(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Provador Virtual
            </h3>
            <button 
              onClick={() => setShowFittingRoom(false)}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            {!recommendation ? (
              <form onSubmit={handleRecommend} className="space-y-6">
                <p className="text-sm text-gray-500 text-center">
                  Informe sua altura e peso para recomendarmos o tamanho ideal para você.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Altura (cm)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="Ex: 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Peso (kg)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="Ex: 75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg"
                >
                  Descobrir meu tamanho
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Tamanho Recomendado</p>
                  <div className="text-7xl font-black text-primary tracking-tighter">{recommendation}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed">
                  Baseado em suas medidas de {height}cm e {weight}kg, o tamanho <strong>{recommendation}</strong> deve proporcionar o melhor caimento.
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setRecommendation(null)}
                    className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Refazer
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedSize(recommendation);
                      setShowFittingRoom(false);
                    }}
                    className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-md"
                  >
                    Selecionar {recommendation}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SizeGuideModal = () => {
    const currentModel = getModelType();
    const chart = SIZE_CHARTS[currentModel as keyof typeof SIZE_CHARTS] || SIZE_CHARTS.torcedor;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowSizeGuide(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-black">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">Guia de Medidas</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Modelo: {currentModel === 'jogador' ? 'Jogador / Retrô' : currentModel === 'feminina' ? 'Feminina' : 'Torcedor'}
              </p>
            </div>
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Visual Aid */}
            <div className="flex justify-center bg-gray-50 rounded-2xl py-8 border border-gray-100">
              <div className="relative w-40 h-44">
                <svg viewBox="0 0 100 110" className="w-full h-full stroke-black stroke-[1.5] fill-white drop-shadow-sm">
                  <path d="M20,25 L35,15 L65,15 L80,25 L80,45 L72,45 L72,100 L28,100 L28,45 L20,45 Z" />
                  <g className="stroke-primary stroke-[1] fill-primary">
                    <line x1="32" y1="70" x2="68" y2="70" />
                    <circle cx="32" cy="70" r="1.5" />
                    <circle cx="68" cy="70" r="1.5" />
                    <text x="50" y="66" textAnchor="middle" className="text-[5px] font-black italic fill-black stroke-none uppercase">LARGURA (A)</text>
                  </g>
                  <g className="stroke-primary stroke-[1] fill-primary">
                    <line x1="88" y1="18" x2="88" y2="100" />
                    <circle cx="88" cy="18" r="1.5" />
                    <circle cx="88" cy="100" r="1.5" />
                    <text x="93" y="60" textAnchor="middle" className="text-[5px] font-black italic fill-black stroke-none uppercase" style={{ writingMode: 'vertical-rl' }}>COMPRIMENTO (B)</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Dynamic Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-black font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-200">Tamanho</th>
                    <th className="px-6 py-4 border-b border-gray-200 text-center">Largura (A)</th>
                    <th className="px-6 py-4 border-b border-gray-200 text-center">Comprimento (B)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {chart.map((item) => (
                    <tr key={item.s} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-black text-black">{item.s}</td>
                      <td className="px-6 py-3.5 text-center font-medium text-gray-600 bg-gray-50/30">{item.w} cm</td>
                      <td className="px-6 py-3.5 text-center font-medium text-gray-600">{item.h} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-medium">
                * As medidas são aproximadas e podem variar em até 2cm. 
                {currentModel === 'jogador' && " O modelo Jogador/Retrô possui um corte mais justo (Fit)."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho.');
      return;
    }
    
    if (wantsCustomization && (!customName || !customNumber)) {
      toast.error('Por favor, preencha o nome e o número para personalização.');
      return;
    }

    if (!product) return;

    setIsAdding(true);
    
    addToCart(product, selectedSize, wantsCustomization, customName, customNumber);
    
    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${product.name} adicionado ao carrinho!`, {
        action: {
          label: 'Ver Carrinho',
          onClick: () => window.location.href = '/cart'
        },
      });
    }, 500);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Produto não encontrado</div>;

  const currentUrl = window.location.href;

  return (
    <div className="bg-white min-h-screen pb-20 pt-20 relative">
      <Helmet>
        <title>{`${product.name} | NovaCustom`}</title>
        <meta name="description" content={product.description || `Confira ${product.name} na NovaCustom. Qualidade premium e personalização exclusiva.`} />
        
        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={`${product.name} | NovaCustom`} />
        <meta property="og:description" content={product.description || `Confira ${product.name} na NovaCustom.`} />
        <meta property="og:image" content={product.image_url} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="BRL" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={`${product.name} | NovaCustom`} />
        <meta property="twitter:description" content={product.description || `Confira ${product.name} na NovaCustom.`} />
        <meta property="twitter:image" content={product.image_url} />
      </Helmet>

      {/* Back Button - Desktop Only (Floating) */}
      <div className="hidden lg:block fixed top-24 left-8 z-40 pointer-events-none">
        <Link to="/" className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white transition-all text-gray-900 border border-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Back Link (In-flow) */}
        <div className="lg:hidden px-6 pt-4 pb-2">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
            </Link>
        </div>

        {/* Left Column - Visuals (Sticky on Desktop) */}
        <div className="lg:w-2/3 bg-gray-50 relative min-h-[50vh] lg:h-[calc(100vh-80px)] lg:sticky lg:top-20 flex flex-col items-center justify-center py-8 z-20">
          {/* Main Image */}
          <div className="relative w-full max-w-xl mx-auto p-8 lg:p-0 transition-all duration-700 flex-1 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={activeImage === 'front' ? product.image_url : (product.image_back_url || product.image_url)}
                alt={product.name}
                className="w-full max-h-[60vh] object-contain drop-shadow-xl transform hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">Sem imagem</div>
            )}
          </div>

          {/* Controls Container */}
          <div className="flex flex-col items-center gap-6 w-full mt-4 z-10">
            <CustomizationGallery />
            
            <div className="flex gap-3 bg-white/50 backdrop-blur-sm p-1 rounded-full shadow-sm">
              <button 
                onClick={() => setActiveImage('front')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  activeImage === 'front' ? "bg-black text-white shadow-lg" : "text-gray-600 hover:bg-white/50"
                )}
              >
                Frente
              </button>
              <button 
                onClick={() => setActiveImage('back')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  activeImage === 'back' ? "bg-black text-white shadow-lg" : "text-gray-600 hover:bg-white/50"
                )}
              >
                Costas
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Action */}
        <div className="lg:w-1/3 px-6 py-12 lg:py-24 lg:px-12 flex flex-col justify-center bg-white min-h-screen">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3 block">
              {product.category || 'Nova Coleção'}
            </span>
            <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-4 tracking-tighter">
              {product.name}
            </h1>
            {product.model_type && (
              <div className="mb-4">
                <span className="bg-zinc-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">
                  Modelo {product.model_type}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-3xl font-medium text-gray-900">
                R$ {(product.price + (wantsCustomization ? 30 : 0)).toFixed(2).replace('.', ',')}
              </span>
              {(product.stock ?? 0) > 0 ? (
                <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                  Em estoque
                </span>
              ) : (
                <span className="text-sm text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                  Esgotado
                </span>
              )}
            </div>

            {product.shipping_type && (
              <div className="mb-8 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                    {product.shipping_type === 'national' ? <Truck className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrega Estimada</p>
                    <p className="text-sm font-bold text-gray-900">
                      {product.shipping_type === 'national' ? '10 a 15 dias úteis' : '30 a 45 dias'}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white border border-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {product.shipping_type === 'national' ? 'Estoque Brasil' : 'Importado'}
                </div>
              </div>
            )}
            
            <p className="text-gray-500 leading-relaxed text-sm lg:text-base border-l-2 border-black pl-4">
              {product.description || "Vista a tradição. Cada detalhe desta peça foi pensado para o torcedor que vive o futebol 24 horas por dia. Tecido respirável de alta performance."}
            </p>
          </div>

          {/* Selection Controls */}
          <div className="space-y-8">
            {/* Size */}
            <div>
              <div className="flex justify-between mb-3 items-end">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Tamanho</label>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-gray-500 hover:text-black underline flex items-center gap-1"
                >
                  <Ruler className="w-3 h-3" /> Guia de medidas
                </button>
              </div>

              <button 
                onClick={() => setShowFittingRoom(true)}
                className="w-full mb-6 bg-zinc-50 border border-zinc-100 p-4 rounded-xl flex items-center justify-between group hover:border-primary transition-all"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Provador Virtual</p>
                    <p className="text-[10px] text-gray-400">Descubra seu tamanho ideal em segundos</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
              </button>
              
              <button
                onClick={toggleWishlist}
                className={cn(
                  "flex items-center gap-2 mb-4 text-sm font-medium transition-colors",
                  isInWishlist ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-black"
                )}
              >
                <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
                {isInWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </button>

              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => {
                  const quantity = stockBySize[size] || 0;
                  const isOutOfStock = quantity === 0;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-lg border text-sm font-bold transition-all relative",
                        selectedSize === size
                          ? "border-black bg-black text-white shadow-lg transform scale-105"
                          : isOutOfStock 
                            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice" 
                            : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                      )}
                    >
                      {size}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[1px] bg-gray-300 rotate-45 transform"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Personalização (+ R$ 30,00)</p>
                  <p className="text-xs text-gray-500">Adicione seu nome e número favoritos</p>
                </div>
              </div>
              <button
                onClick={() => setWantsCustomization(!wantsCustomization)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  wantsCustomization ? "bg-primary" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  wantsCustomization ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {/* Customization Inputs */}
            {wantsCustomization && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nome</label>
                    <input
                      type="text"
                      placeholder="Ex: SILVA"
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        if (!customName && e.target.value) setActiveImage('back');
                      }}
                      maxLength={12}
                      className="w-full bg-white border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-300 shadow-sm transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Número</label>
                    <input
                      type="text"
                      placeholder="Ex: 10"
                      value={customNumber}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          setCustomNumber(e.target.value);
                          if (!customNumber && e.target.value) setActiveImage('back');
                        }
                      }}
                      maxLength={2}
                      className="w-full bg-white border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-300 shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="space-y-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (product.stock ?? 0) <= 0 || (selectedSize && (stockBySize[selectedSize] || 0) === 0)}
                className="w-full bg-black text-white py-5 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isAdding ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{(product.stock ?? 0) > 0 ? 'Adicionar à Sacola' : 'Esgotado'}</span>
                    {(product.stock ?? 0) > 0 && <ShoppingCart className="w-5 h-5" />}
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 text-gray-400 text-xs py-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Frete Grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Compra Segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSizeGuide && <SizeGuideModal />}
      {showFittingRoom && <FittingRoomModal />}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductReviews productId={id || ''} />
      </div>
    </div>
  );
}
