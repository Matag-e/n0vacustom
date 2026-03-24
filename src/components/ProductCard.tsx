import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { QuickViewModal } from './QuickViewModal';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_back_url?: string | null;
  category: string | null;
  country?: string | null;
  league?: string | null;
  year?: string | null;
  model_type?: string | null;
  stock?: number;
  sales_count?: number;
  product_stock?: any[];
  created_at: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-zinc-900 rounded-none overflow-hidden transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-zinc-800">
        <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-zinc-800">
          {product.image_url && !product.image_url.includes('text_to_image') ? (
            <>
              {/* Main Image */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={cn(
                    "w-full h-full object-cover object-center transition-all duration-700 ease-out mix-blend-multiply dark:mix-blend-normal",
                    "group-hover:scale-105",
                    product.image_back_url ? "group-hover:opacity-0" : ""
                  )}
                />
              </div>
              {/* Back Image */}
              {product.image_back_url && (
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={product.image_back_url}
                    alt={`${product.name} - Costas`}
                    className="w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="text-zinc-300 dark:text-zinc-600 font-black text-2xl uppercase select-none opacity-50">
                Manto
              </div>
            </div>
          )}
          
          {/* Quick View Button (Top Right) */}
          <button 
            onClick={handleQuickView}
            className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-sm"
            title="Visualização Rápida"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Category & Info Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            <span className="bg-white/95 dark:bg-black/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black text-black dark:text-white uppercase tracking-widest shadow-sm">
              {product.category || 'NOVA'}
            </span>
            {product.model_type && (
              <span className="bg-primary px-2.5 py-1 text-[9px] font-black text-white uppercase tracking-widest w-fit shadow-sm">
                {product.model_type}
              </span>
            )}
            {Number(product.sales_count) > 50 && (
              <span className="bg-amber-400 px-2.5 py-1 text-[9px] font-black text-black uppercase tracking-widest w-fit shadow-sm">
                Best Seller
              </span>
            )}
          </div>

          {/* Action Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
            <button 
              onClick={handleCartClick}
              className="w-full bg-white text-black font-bold uppercase text-xs py-3 tracking-widest hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" /> Ver Detalhes
            </button>
          </div>
        </Link>
        
        <div className="py-4 px-2">
          <Link to={`/product/${product.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {product.category || 'Futebol'}
            </p>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}