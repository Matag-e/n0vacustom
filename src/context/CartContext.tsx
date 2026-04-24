import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { getCustomizationFee } from '@/lib/customization';

export interface CartItem {
  id: string; // Unique ID for cart item (combination of product id + options)
  dbId?: string; // Database ID from cart_items table
  product: Product;
  quantity: number;
  size: string;
  isCustomized: boolean;
  customName?: string;
  customNumber?: string;
  plusSizeFee?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, isCustomized: boolean, customName?: string, customNumber?: string, plusSizeFee?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('cart');
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(item => item && item.product));
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialLoad]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (user && !isInitialLoad) {
      syncWithSupabase();
    }
  }, [user, isInitialLoad]);

  const syncWithSupabase = async () => {
    if (!user) return;

    try {
      const { data: serverItems, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedServerItems: CartItem[] = (serverItems || []).map(item => ({
        id: `${item.product_id}-${item.size}-${item.is_customized}-${item.custom_name || ''}-${item.custom_number || ''}-${item.plus_size_fee || 0}`,
        dbId: item.id,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        isCustomized: item.is_customized,
        customName: item.custom_name,
        customNumber: item.custom_number,
        plusSizeFee: Number(item.plus_size_fee)
      }));

      // Merge logic: prefer server items, add local items that don't exist on server
      setItems(prevItems => {
        const merged = [...mappedServerItems];
        
        prevItems.forEach(localItem => {
          const existsIndex = merged.findIndex(m => m.id === localItem.id);
          if (existsIndex === -1) {
            merged.push(localItem);
            // Persist local item to server
            saveItemToSupabase(localItem).then(dbId => {
              if (dbId) {
                setItems(current => current.map(i => i.id === localItem.id ? { ...i, dbId } : i));
              }
            });
          } else if (localItem.quantity > merged[existsIndex].quantity) {
            // Update quantity if local has more
            merged[existsIndex].quantity = localItem.quantity;
            updateItemInSupabase(merged[existsIndex]);
          }
        });
        
        return merged;
      });
    } catch (err) {
      console.error('Error syncing cart with Supabase:', err);
    }
  };

  const saveItemToSupabase = async (item: CartItem): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        is_customized: item.isCustomized,
        custom_name: item.customName || null,
        custom_number: item.customNumber || null,
        plus_size_fee: item.plusSizeFee || 0
      }, { onConflict: 'user_id, product_id, size, is_customized, custom_name, custom_number, plus_size_fee' })
      .select('id')
      .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Error saving item to Supabase:', err);
      return null;
    }
  };

  const updateItemInSupabase = async (item: CartItem) => {
    if (!user) return;
    try {
      let query = supabase.from('cart_items').update({ quantity: item.quantity });
      
      if (item.dbId) {
        query = query.eq('id', item.dbId);
      } else {
        query = query
          .eq('user_id', user.id)
          .eq('product_id', item.product.id)
          .eq('size', item.size)
          .eq('is_customized', item.isCustomized);
        
        if (item.customName) query = query.eq('custom_name', item.customName); else query = query.is('custom_name', null);
        if (item.customNumber) query = query.eq('custom_number', item.customNumber); else query = query.is('custom_number', null);
        query = query.eq('plus_size_fee', item.plusSizeFee || 0);
      }

      await query;
    } catch (err) {
      console.error('Error updating item in Supabase:', err);
    }
  };

  const deleteItemFromSupabase = async (item: CartItem) => {
    if (!user) return;
    try {
      let query = supabase.from('cart_items').delete();
      
      if (item.dbId) {
        query = query.eq('id', item.dbId);
      } else {
        query = query
          .eq('user_id', user.id)
          .eq('product_id', item.product.id)
          .eq('size', item.size)
          .eq('is_customized', item.isCustomized);
        
        if (item.customName) query = query.eq('custom_name', item.customName); else query = query.is('custom_name', null);
        if (item.customNumber) query = query.eq('custom_number', item.customNumber); else query = query.is('custom_number', null);
        query = query.eq('plus_size_fee', item.plusSizeFee || 0);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting item from Supabase:', err);
    }
  };

  // Sync cart across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        if (!e.newValue) {
          setItems([]);
          return;
        }
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setItems(parsed.filter(item => item && item.product));
          }
        } catch (error) {
          console.error('Error syncing cart from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (product: Product, size: string, isCustomized: boolean, customName?: string, customNumber?: string, plusSizeFee?: number) => {
    const itemId = `${product.id}-${size}-${isCustomized}-${customName || ''}-${customNumber || ''}-${plusSizeFee || 0}`;
    
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);

      if (existingItem) {
        const updatedItems = prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
        const updatedItem = updatedItems.find(i => i.id === itemId);
        if (updatedItem) updateItemInSupabase(updatedItem);
        return updatedItems;
      }

      const newItem: CartItem = {
        id: itemId,
        product,
        quantity: 1,
        size,
        isCustomized,
        customName: isCustomized ? customName : '',
        customNumber: isCustomized ? customNumber : '',
        plusSizeFee: plusSizeFee || 0,
      };
      
      saveItemToSupabase(newItem).then(dbId => {
        if (dbId) {
          setItems(current => current.map(i => i.id === newItem.id ? { ...i, dbId } : i));
        }
      });
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = items.find(i => i.id === itemId);
    if (itemToRemove) deleteItemFromSupabase(itemToRemove);
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item));
      const updatedItem = updatedItems.find(i => i.id === itemId);
      if (updatedItem) updateItemInSupabase(updatedItem);
      return updatedItems;
    });
  };

  const clearCart = async () => {
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (err) {
        console.error('Error clearing cart from Supabase:', err);
      }
    }
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + (item.quantity || 0), 0);
  const totalPrice = items.reduce((total, item) => {
    if (!item || !item.product) return total;
    const itemBasePrice = item.product.price || 0;
    const customizationFee = item.isCustomized ? getCustomizationFee(item.customName, item.customNumber) : 0;
    const plusSizeFee = item.plusSizeFee || 0;
    return total + (itemBasePrice + customizationFee + plusSizeFee) * (item.quantity || 0);
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

