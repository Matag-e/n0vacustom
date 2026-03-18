import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
}

export function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  async function fetchWishlist() {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product:products (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Tipagem correta para o join
      const formattedData = (data as any[]).map(item => ({
        id: item.id,
        product: item.product
      }));

      setWishlist(formattedData);
    } catch (error) {
      console.error('Erro ao buscar wishlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(id: string) {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao remover da wishlist:', error);
    }
  }

  if (loading) return <div className="py-8 text-center text-gray-400">Carregando lista de desejos...</div>;

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Sua lista está vazia</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Salve seus mantos favoritos para comprar depois.
        </p>
        <Link 
          to="/clubes" 
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-900 transition-all"
        >
          Explorar Loja
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wishlist.map((item) => (
        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
          
          <Link to={`/product/${item.product.id}`} className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src={item.product.image_url} 
              alt={item.product.name} 
              className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                  {item.product.category || 'Futebol'}
                </span>
                <Link to={`/product/${item.product.id}`} className="block">
                  <h3 className="font-bold text-gray-900 truncate hover:text-primary transition-colors text-base">
                    {item.product.name}
                  </h3>
                </Link>
              </div>
              <button 
                onClick={() => removeFromWishlist(item.id)}
                className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="font-black text-gray-900 text-lg">
                R$ {item.product.price.toFixed(2).replace('.', ',')}
              </span>
              
              <Link 
                to={`/product/${item.product.id}`}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg shadow-black/10 group-hover:shadow-xl"
              >
                <ShoppingCart className="w-3 h-3" />
                Comprar
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
