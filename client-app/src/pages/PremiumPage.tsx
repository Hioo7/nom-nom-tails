import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { MealPlanCard } from '../components/ui/MealPlanCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
// import { mealPlanService } from '../services/mealPlan.service'; // TODO: uncomment when DB has data
import { DUMMY_MEAL_PLANS } from '../data/data';
import { useAuth } from '../hooks/useAuth';
import type { MealPlan } from '../types';

export function PremiumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: replace with API call once DB has data:
    // mealPlanService.list().then(setPlans).catch(() => setError('Failed to load meal plans.')).finally(() => setLoading(false));
    setPlans(DUMMY_MEAL_PLANS);
    setLoading(false);
  }, []);

  const handleSubscribe = (plan: MealPlan) => {
    if (!user) {
      navigate('/login', { state: { from: '/premium' } });
      return;
    }
    // TODO: subscription checkout flow
    alert(`Subscription for "${plan.name}" coming soon!`);
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
            <div key={perk} className="bg-white/20 rounded-xl py-2 px-1">
              {perk}
            </div>
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
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <MealPlanCard key={plan.id} plan={plan} onSubscribe={handleSubscribe} />
          ))}
        </div>
      )}
    </div>
  );
}
