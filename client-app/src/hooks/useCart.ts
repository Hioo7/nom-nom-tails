import { useContext } from 'react';
import { CartContext } from '../context/contexts';
import type { CartContextValue } from '../types';

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
