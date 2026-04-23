import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { MealPlanCard } from '../components/ui/MealPlanCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MealPlanService } from '../services/mealPlan.service';
import { SubscriptionService } from '../services/subscription.service';
import { useAuth } from '../hooks/useAuth';
import type { MealPlan } from '../types';

const mealPlanService     = new MealPlanService();
const subscriptionService = new SubscriptionService();

export function PremiumPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans]                     = useState<MealPlan[]>([]);
  const [subscribedIds, setSubscribedIds]     = useState<Set<string>>(new Set());
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');

  useEffect(() => {
    mealPlanService
      .list()
      .then((data) => setPlans(data.filter((p) => p.isActive)))
      .catch(() => setError('Failed to load meal plans.'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch active subscriptions to mark already-subscribed plans
  useEffect(() => {
    if (!token) return;
    subscriptionService
      .listMine(token)
      .then((subs) => {
        const activeIds = new Set(
          subs.filter((s) => s.status === 'ACTIVE').map((s) => s.mealPlanId)
        );
        setSubscribedIds(activeIds);
      })
      .catch(() => {});
  }, [token]);

  const handleSubscribe = (plan: MealPlan) => {
    if (!user || !token) {
      navigate('/login', { state: { from: '/premium' } });
      return;
    }
    navigate('/subscription-checkout', { state: { plan } });
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <FiStar size={20} className="text-orange-500" />
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">Premium</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Meal Plans</h1>
        <p className="text-gray-400 text-sm mt-1">
          Subscribe for daily fresh meals, delivered right to your door 🚪
        </p>
      </div>

      {/* Perks Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 mb-5 text-white">
        <p className="font-bold text-base mb-1">Why subscribe?</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
          {['Save up to 20%', 'Daily delivery', 'Auto-renewal'].map((perk) => (
            <div key={perk} className="bg-white/20 rounded-xl py-2 px-1">{perk}</div>
          ))}
        </div>
      </div>

      {/* Plans */}
      {loading ? (
        <LoadingSpinner fullPage />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">😿</p>
          <p className="text-gray-500">{error}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🌟</p>
          <p className="text-gray-500">No meal plans available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-8">
          {plans.map((plan) => (
            <MealPlanCard
              key={plan.id}
              plan={plan}
              isSubscribed={subscribedIds.has(plan.id)}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      )}
    </div>
  );
}
