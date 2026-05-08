import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import type { ApiError } from '../../../types';
import EmailField from './EmailField';
import PasswordField from './PasswordField';

const REAL_DASHBOARDS: Partial<Record<string, string>> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin',
  DELIVERY_PARTNER: '/delivery',
  CHEF: '/chef',
};

export default function LoginForm() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noDashboard, setNoDashboard] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setNoDashboard(false);
    try {
      const user = await login(email.trim(), password);
      const route = REAL_DASHBOARDS[user.role];
      if (route) {
        navigate(route, { replace: true });
      } else {
        // Role exists but dashboard not built yet — log them out and inform
        logout();
        setNoDashboard(true);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <EmailField value={email} onChange={setEmail} disabled={isSubmitting} />
      <PasswordField value={password} onChange={setPassword} disabled={isSubmitting} />

      {errorMessage && (
        <div className="alert alert-error py-2 text-sm">
          <span>{errorMessage}</span>
        </div>
      )}

      {noDashboard && (
        <div className="alert alert-warning py-2 text-sm">
          <span>Your dashboard isn't available yet. Please contact your administrator.</span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-full mt-1"
        disabled={!canSubmit}
      >
        {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
      </button>
    </form>
  );
}
