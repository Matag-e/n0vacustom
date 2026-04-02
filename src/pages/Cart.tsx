import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, transformImageUrl, buildSrcSet, originalImageUrl } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-white">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua sacola está vazia</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-center">
          Explore nossa coleção e encontre o manto perfeito para você.
        </p>
        <Link 
          to="/" 
          className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-900 transition-all flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <Helmet>
        <title>Sua Sacola | NovaCustom</title>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Sua Sacola ({items.length})</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 py-6 border-b border-gray-100">
                {/* Product Image */}
                <Link to={`/product/${item.product.id}`} className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.product.image_url ? (
                    <img 
                      src={item.product.image_url}
                      loading="lazy"
                      alt={item.product.name} 
                      className="w-full h-full object-cover mix-blend-multiply" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-300">Sem img</div>
                  )}
                </Link>
                
                {/* Product Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/product/${item.product.id}`} className="text-lg font-bold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>Tamanho: <span className="font-medium text-gray-900">{item.size}</span></p>
                      {item.isCustomized && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary uppercase tracking-wider">
                              Personalizado (+ R$ 30)
                            </span>
                          </div>
                          <span className="text-gray-900 font-bold uppercase text-xs">
                            {item.customName} {item.customNumber && `#${item.customNumber}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <span className="text-lg font-bold text-gray-900">
                      R$ {((item.product.price + (item.isCustomized ? 30 : 0)) * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-bold">Grátis</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900 block">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-gray-500">
                        em até 3x de R$ {(totalPrice / 3).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link to="/checkout" className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Finalizar Compra
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="h-3 w-3" />
                Compra 100% Segura e Garantida
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
