import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/components/ProductCard';

export interface CartItem {
  id: string; // Unique ID for cart item (combination of product id + options)
  product: Product;
  quantity: number;
  size: string;
  isCustomized: boolean;
  customName?: string;
  customNumber?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, isCustomized: boolean, customName?: string, customNumber?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('cart');
      if (!savedItems) return [];
      const parsed = JSON.parse(savedItems);
      // Filter out invalid items that might crash the app
      return Array.isArray(parsed) ? parsed.filter(item => item && item.product) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string, isCustomized: boolean, customName?: string, customNumber?: string) => {
    setItems((prevItems) => {
      // Create a unique ID based on product and options to differentiate items
      const itemId = `${product.id}-${size}-${isCustomized}-${customName || ''}-${customNumber || ''}`;
      
      const existingItem = prevItems.find((item) => item.id === itemId);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prevItems,
        {
          id: itemId,
          product,
          quantity: 1,
          size,
          isCustomized,
          customName: isCustomized ? customName : '',
          customNumber: isCustomized ? customNumber : '',
        },
      ];
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

  const totalItems = items.reduce((total, item) => total + (item.quantity || 0), 0);
  const totalPrice = items.reduce((total, item) => {
    if (!item || !item.product) return total;
    const itemBasePrice = item.product.price || 0;
    const customizationFee = item.isCustomized ? 30 : 0;
    return total + (itemBasePrice + customizationFee) * (item.quantity || 0);
  }, 0);

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
