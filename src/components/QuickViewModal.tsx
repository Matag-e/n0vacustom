import { useState, useEffect } from 'react';
import { X, ShoppingCart, Ruler, Sparkles, Shield, Truck } from 'lucide-react';
import { Product } from './ProductCard';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState<'front' | 'back'>('front');
  const [stockBySize, setStockBySize] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const sizes = ['P', 'M', 'G', 'GG', 'XG', '2XG', '3XL'];

  useEffect(() => {
    if (isOpen && product.id) {
      fetchStock();
    }
  }, [isOpen, product.id]);

  async function fetchStock() {
    const { data } = await supabase
      .from('product_stock')
      .select('size, quantity')
      .eq('product_id', product.id);
    
    if (data) {
      const map: Record<string, number> = {};
      data.forEach(item => map[item.size] = item.quantity);
      setStockBySize(map);
    }
  }

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho.');
      return;
    }

    setIsAdding(true);
    addToCart(product, selectedSize, false); // No customization in quick view for simplicity
    
    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${product.name} adicionado!`);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image */}
        <div className="md:w-1/2 bg-gray-50 dark:bg-zinc-800 p-8 flex flex-col items-center justify-center relative min-h-[300px]">
          <img
            src={activeImage === 'front' ? (product.image_url || '') : (product.image_back_url || product.image_url || '')}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-xl"
          />
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setActiveImage('front')}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                activeImage === 'front' ? "bg-black text-white" : "bg-white/50 text-gray-600"
              )}
            >
              Frente
            </button>
            <button 
              onClick={() => setActiveImage('back')}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                activeImage === 'back' ? "bg-black text-white" : "bg-white/50 text-gray-600"
              )}
            >
              Costas
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
          <div className="mb-6">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2 block">
              {product.category || 'Futebol'}
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2 uppercase tracking-tighter">
              {product.name}
            </h2>
            <p className="text-xl font-medium text-gray-900 dark:text-white">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Tamanho</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                  const isOutOfStock = stockBySize[size] === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={cn(
                        "h-10 flex items-center justify-center rounded-lg border text-xs font-bold transition-all",
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : isOutOfStock 
                            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" 
                            : "border-gray-200 text-gray-400 hover:border-black hover:text-black dark:border-zinc-700"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              {isAdding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>
                  <span>Adicionar</span>
                  <ShoppingCart className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Truck className="w-3 h-3" />
                <span>Frete Grátis</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Compra Segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
