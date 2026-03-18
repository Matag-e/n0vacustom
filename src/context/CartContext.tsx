import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/components/ProductCard';
import { toast } from 'sonner';

export interface CartItem {
  id: string; // Unique ID for cart item (combination of product id + options)
  product: Product;
  quantity: number;
  size: string;
  customName?: string;
  customNumber?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, customName?: string, customNumber?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedItems = localStorage.getItem('cart');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string, customName?: string, customNumber?: string) => {
    // Check if item already exists
    const itemId = `${product.id}-${size}-${customName || ''}-${customNumber || ''}`;
    const existingItem = items.find((item) => item.id === itemId);

    if (existingItem) {
      updateQuantity(itemId, existingItem.quantity + 1);
      toast.success('Quantidade atualizada no carrinho', {
        id: 'cart-update' // Prevent duplicate toasts
      });
      return;
    }

    setItems((prevItems) => [
      ...prevItems,
      {
        id: itemId,
        product,
        quantity: 1,
        size,
        customName,
        customNumber,
      },
    ]);
    toast.success('Produto adicionado ao carrinho', {
      id: 'cart-add' // Prevent duplicate toasts
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
