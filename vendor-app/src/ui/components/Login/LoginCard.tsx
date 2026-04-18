import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import LoginForm from './LoginForm';

// Only roles with a real dashboard get auto-redirected
const REAL_DASHBOARDS: Partial<Record<string, string>> = {
  SUPER_ADMIN: '/super-admin',
};

export default function LoginCard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      const route = REAL_DASHBOARDS[user.role];
      if (route) navigate(route, { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="card w-full max-w-sm bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2 text-primary">
            <FiHeart size={28} className="fill-current" />
            <span className="text-2xl font-extrabold tracking-tight">Dog Dash</span>
          </div>
          <p className="text-sm text-base-content/50 font-medium uppercase tracking-widest">
            Staff Portal
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
