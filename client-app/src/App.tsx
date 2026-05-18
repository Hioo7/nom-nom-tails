import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { PremiumPage } from './pages/PremiumPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ShippingAddressPage } from './pages/ShippingAddressPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubscriptionCheckoutPage } from './pages/SubscriptionCheckoutPage';
import { KindnessMeterPage } from './pages/KindnessMeterPage';
import { DishDetailPage } from './pages/DishDetailPage';
import { NotificationInboxPage } from './pages/NotificationInboxPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Auth pages — no bottom nav */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Standalone pages — no bottom nav */}
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/address" element={<ShippingAddressPage />} />
              <Route path="/profile/notifications" element={<NotificationsPage />} />
              <Route path="/profile/settings" element={<SettingsPage />} />
              <Route path="/subscription-checkout" element={<SubscriptionCheckoutPage />} />
              <Route path="/dish/:id" element={<DishDetailPage />} />
              <Route path="/notifications" element={<NotificationInboxPage />} />

              {/* Main app with bottom nav */}
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/kindness" element={<KindnessMeterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
