import { X, Trash2, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn, transformImageUrl, buildSrcSet, originalImageUrl } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-900 dark:text-white" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Seu Carrinho</h2>
            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-bold">Seu carrinho está vazio</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Adicione alguns mantos para começar.</p>
              </div>
              <button 
                onClick={onClose}
                className="text-primary hover:underline text-sm font-bold"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-20 h-24 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                  {item.product?.image_url ? (
                    <img 
                      src={item.product.image_url}
                      alt={item.product.name}
                      loading="lazy"
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-300">Sem img</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.product?.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tamanho: {item.size}</p>
                    {item.isCustomized && (
                       <p className="text-[10px] text-primary font-bold mt-0.5 uppercase">
                         Personalizado: {item.customName} {item.customNumber && `#${item.customNumber}`}
                       </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-l-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-r-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        R$ {((item.product?.price || 0 + (item.isCustomized ? 30 : 0)) * (item.quantity || 0)).toFixed(2).replace('.', ',')}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Frete</span>
                <span className="text-green-600 font-bold uppercase text-xs">Calculado no Checkout</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              {user ? (
                <>
                  Finalizar Compra
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Login para Finalizar
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white uppercase tracking-wider"
            >
              Ver Carrinho Completo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
