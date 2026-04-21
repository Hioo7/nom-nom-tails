import { createContext } from 'react';
import type { AuthContextValue, CartContextValue } from '../types';

export const AuthContext = createContext<AuthContextValue | null>(null);
export const CartContext = createContext<CartContextValue | null>(null);
