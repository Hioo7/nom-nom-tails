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

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>(loadLocalCart);
  // track previous token to detect login event
  const prevTokenRef = useRef<string | null>(null);

  // Whenever items change, keep localStorage in sync (works for both guest and logged-in)
  useEffect(() => {
    saveLocalCart(items);
  }, [items]);

  // On token change: if user just logged in, sync local cart to DB then load DB cart
  useEffect(() => {
    const prev = prevTokenRef.current;
    prevTokenRef.current = token;

    if (!token) return;

    const localItems = loadLocalCart();

    if (prev === null && localItems.length > 0) {
      // User just logged in and had guest cart items — push them to DB first
      cartService
        .syncCart(
          token,
          localItems.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
        )
        .then((apiItems) => {
          const merged = CartService.toCartItems(apiItems);
          setItems(merged);
          saveLocalCart(merged);
        })
        .catch(() => {
          // Sync failed — just load DB cart
          loadDbCart(token);
        });
    } else {
      // Page refresh with existing token — load from DB as source of truth
      loadDbCart(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function loadDbCart(tok: string) {
    cartService.getCart(tok).then((apiItems) => {
      const dbItems = CartService.toCartItems(apiItems);
      setItems(dbItems);
      saveLocalCart(dbItems);
    });
  }

  const addItem = useCallback(
    (dish: Dish) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.dish.id === dish.id);
        const next = existing
          ? prev.map((i) => (i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...prev, { dish, quantity: 1 }];

        // Background DB sync
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
      if (quantity <= 0) {
        removeItem(dishId);
        return;
      }
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
  }, [token]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
