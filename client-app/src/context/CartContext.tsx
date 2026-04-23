import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartContextValue, CartItem, Dish } from '../types';
import { CartContext } from './contexts';
import { useAuth } from '../hooks/useAuth';
import { CartService } from '../services/cart.service';

const CART_KEY = 'nom_nom_cart';
const cartService = new CartService();

function loadLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  // Start with localStorage only if not logged in yet
  const [items, setItems] = useState<CartItem[]>(() =>
    token ? [] : loadLocalCart()
  );

  const prevTokenRef = useRef<string | null | undefined>(undefined);

  // Only persist to localStorage when guest (no token)
  useEffect(() => {
    if (!token) saveLocalCart(items);
  }, [items, token]);

  useEffect(() => {
    const prev = prevTokenRef.current;
    prevTokenRef.current = token;

    // ── Logout: token removed ──────────────────────────────────────────
    if (prev !== undefined && prev !== null && !token) {
      setItems([]);
      clearLocalCart();
      return;
    }

    if (!token) return;

    // ── Login: guest → authenticated ───────────────────────────────────
    if (prev === null || prev === undefined) {
      const localItems = loadLocalCart();

      if (localItems.length > 0) {
        // Push guest cart into DB then clear localStorage
        cartService
          .syncCart(
            token,
            localItems.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
          )
          .then((apiItems) => {
            setItems(CartService.toCartItems(apiItems));
            clearLocalCart(); // ← DB is now source of truth, no need for localStorage
          })
          .catch(() => loadDbCart(token));
      } else {
        loadDbCart(token);
      }
      return;
    }

    // ── Page refresh while logged in ───────────────────────────────────
    loadDbCart(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function loadDbCart(tok: string) {
    cartService.getCart(tok).then((apiItems) => {
      setItems(CartService.toCartItems(apiItems));
      clearLocalCart(); // DB is source of truth — no localStorage needed
    });
  }

  const addItem = useCallback(
    (dish: Dish) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.dish.id === dish.id);
        const next = existing
          ? prev.map((i) => (i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...prev, { dish, quantity: 1 }];

        if (token) {
          const newQty = existing ? existing.quantity + 1 : 1;
          cartService.upsertItem(token, dish.id, newQty).catch(() => {});
        }

        return next;
      });
    },
    [token],
  );

  const removeItem = useCallback(
    (dishId: string) => {
      setItems((prev) => {
        if (token) cartService.removeItem(token, dishId).catch(() => {});
        return prev.filter((i) => i.dish.id !== dishId);
      });
    },
    [token],
  );

  const updateQuantity = useCallback(
    (dishId: string, quantity: number) => {
      if (quantity <= 0) { removeItem(dishId); return; }
      setItems((prev) => {
        if (token) cartService.upsertItem(token, dishId, quantity).catch(() => {});
        return prev.map((i) => (i.dish.id === dishId ? { ...i, quantity } : i));
      });
    },
    [token, removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (token) cartService.clearCart(token).catch(() => {});
    else clearLocalCart();
  }, [token]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
