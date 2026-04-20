import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/auth.provider';
import ProtectedRoute from './ui/components/shared/ProtectedRoute';
import LoginPage from './ui/pages/LoginPage';
import NotFoundPage from './ui/pages/NotFoundPage';
import AdminDashboardPage from './ui/pages/AdminDashboardPage';
import DeliveryDashboardPage from './ui/pages/DeliveryDashboardPage';
import SuperAdminDashboardPage from './ui/pages/SuperAdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}>
                <DeliveryDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
