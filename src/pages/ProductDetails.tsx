import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@/components/ProductCard';
import { CustomizationGallery } from '@/components/CustomizationGallery';
import { ArrowLeft, ShoppingCart, Truck, Shield, Ruler, Sparkles, X, Heart } from 'lucide-react';
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
  const [stockBySize, setStockBySize] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const sizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL'];

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

  const SizeGuideModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setShowSizeGuide(false)}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Guia de Medidas</h3>
          <button 
            onClick={() => setShowSizeGuide(false)}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Visual Aid */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 opacity-80">
              {/* Simple CSS Jersey Drawing */}
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-gray-900 stroke-2 fill-none">
                <path d="M20,30 L30,20 L70,20 L80,30 L80,45 L70,45 L70,90 L30,90 L30,45 L20,45 Z" />
                {/* Width Arrow */}
                <path d="M35,65 L65,65" className="stroke-primary" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                <text x="50" y="62" textAnchor="middle" className="text-[6px] fill-primary font-bold">LARGURA (A)</text>
                {/* Height Arrow */}
                <path d="M85,25 L85,90" className="stroke-primary" />
                <text x="88" y="60" className="text-[6px] fill-primary font-bold" style={{writingMode: 'vertical-rl'}}>COMPRIMENTO (B)</text>
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-900 font-bold uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Tamanho</th>
                  <th className="px-4 py-3">Largura (A)</th>
                  <th className="px-4 py-3">Comprimento (B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">P</td>
                  <td className="px-4 py-3 text-gray-500">52 cm</td>
                  <td className="px-4 py-3 text-gray-500">69 cm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">M</td>
                  <td className="px-4 py-3 text-gray-500">54 cm</td>
                  <td className="px-4 py-3 text-gray-500">71 cm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">G</td>
                  <td className="px-4 py-3 text-gray-500">56 cm</td>
                  <td className="px-4 py-3 text-gray-500">73 cm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">GG</td>
                  <td className="px-4 py-3 text-gray-500">58 cm</td>
                  <td className="px-4 py-3 text-gray-500">75 cm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">XG</td>
                  <td className="px-4 py-3 text-gray-500">60 cm</td>
                  <td className="px-4 py-3 text-gray-500">77 cm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">2XG</td>
                  <td className="px-4 py-3 text-gray-500">62 cm</td>
                  <td className="px-4 py-3 text-gray-500">79 cm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">3XL</td>
                  <td className="px-4 py-3 text-gray-500">64 cm</td>
                  <td className="px-4 py-3 text-gray-500">81 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-xs text-gray-400 text-center">
            * As medidas podem variar em até 2cm.
          </p>
        </div>
      </div>
    </div>
  );

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
            <div className="flex items-baseline gap-4 mb-6">
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
                {sizes.map((size) => {
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductReviews productId={id || ''} />
      </div>
    </div>
  );
}
