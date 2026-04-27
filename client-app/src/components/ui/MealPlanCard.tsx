import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import type { MealPlan } from '../../types';
import { paiseToRupees } from '../../utils/currency';

interface Props {
  plan: MealPlan;
  isSubscribed?: boolean;
  onSubscribe: (plan: MealPlan) => void;
}

export function MealPlanCard({ plan, isSubscribed = false, onSubscribe }: Props) {
  const [showMeals, setShowMeals] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover image */}
      <div className="relative">
        <img
          src={plan.imageUrl}
          alt={plan.name}
          className="w-full h-44 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x200/f97316/white?text=🐾';
          }}
        />
        {/* Dish count badge */}
        {plan.dishes.length > 0 && (
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {plan.dishes.length} dish{plan.dishes.length > 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Title + price */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-base">{plan.name}</h3>
          <span className="text-orange-500 font-bold text-sm">
            ₹{paiseToRupees(plan.price)}<span className="text-gray-400 font-normal text-xs">/mo</span>
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-3">{plan.description}</p>

        {/* Dish name chips */}
        {plan.dishes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {plan.dishes.slice(0, 3).map((d) => (
              <span
                key={d.id}
                className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100"
              >
                {d.name}
              </span>
            ))}
            {plan.dishes.length > 3 && (
              <span className="text-xs text-gray-400 px-1 py-0.5">+{plan.dishes.length - 3} more</span>
            )}
          </div>
        )}

        {/* See Meals toggle */}
        {plan.dishes.length > 0 && (
          <button
            onClick={() => setShowMeals((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-orange-500 font-semibold py-2 rounded-xl border border-orange-100 bg-orange-50 hover:bg-orange-100 transition-colors mb-3"
          >
            {showMeals ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
            {showMeals ? 'Hide Meals' : 'See Meals'}
          </button>
        )}

        {/* Expanded dish list */}
        {showMeals && (
          <div className="flex flex-col gap-2 mb-3">
            {plan.dishes.map((d) => (
              <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                {d.imageUrl ? (
                  <img
                    src={d.imageUrl}
                    alt={d.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48/f97316/white?text=🍽'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-xl">🍽</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                  {d.description && (
                    <p className="text-xs text-gray-400 truncate">{d.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscribe CTA */}
        {isSubscribed ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-green-50 text-green-600 border border-green-200">
            <FiCheck size={15} strokeWidth={3} /> Subscribed
          </div>
        ) : (
          <button
            onClick={() => onSubscribe(plan)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm shadow-orange-200"
          >
            Subscribe Now
          </button>
        )}
      </div>
    </div>
  );
}
