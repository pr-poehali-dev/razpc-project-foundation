import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface CartItemComponent {
  type: string;
  name: string;
}

export interface CartItem {
  id: string;
  kind: 'build' | 'config' | 'part';
  buildId?: number;
  productId?: number;
  slug?: string;
  name: string;
  description?: string;
  image_url?: string | null;
  price: number;
  qty: number;
  components?: CartItemComponent[];
  /** Габариты для расчёта доставки (грамм / мм) */
  weight_g?: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id' | 'qty'> & { id?: string; qty?: number }) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'razpc_cart_v1';

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem = useCallback<CartContextValue['addItem']>((item) => {
    setItems((prev) => {
      // Gotovaya sborka iz kataloga skladyvaetsya po kolichestvu
      if (item.kind === 'build' && item.buildId) {
        const existing = prev.find((i) => i.kind === 'build' && i.buildId === item.buildId);
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id ? { ...i, qty: i.qty + (item.qty || 1) } : i,
          );
        }
      }
      // Komplektuyushchaya skladyvaetsya po productId
      if (item.kind === 'part' && item.productId) {
        const existing = prev.find((i) => i.kind === 'part' && i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id ? { ...i, qty: i.qty + (item.qty || 1) } : i,
          );
        }
      }
      const id = item.id || `${item.kind}-${item.buildId ?? Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return [...prev, { ...item, id, qty: item.qty || 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}