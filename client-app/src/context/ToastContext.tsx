import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ToastState {
  message: string;
  dishName: string;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (dishName: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', dishName: '', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((dishName: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message: 'Added to cart!', dishName, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <CartToast toast={toast} />
    </ToastContext.Provider>
  );
}

function CartToast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
        toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl min-w-[220px] max-w-xs">
        <span className="text-lg">🛒</span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-orange-400 truncate max-w-[140px]">
            {toast.dishName}
          </span>
          <span className="text-xs text-gray-300">Added to cart!</span>
        </div>
        <span className="ml-auto text-green-400 text-base">✓</span>
      </div>
    </div>
  );
}
