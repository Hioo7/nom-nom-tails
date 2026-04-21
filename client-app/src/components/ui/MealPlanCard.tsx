import type { MealPlan } from '../../types';

interface Props {
  plan: MealPlan;
  onSubscribe: (plan: MealPlan) => void;
}

export function MealPlanCard({ plan, onSubscribe }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <img
        src={plan.imageUrl}
        alt={plan.name}
        className="w-full h-44 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://placehold.co/400x200/f97316/white?text=🐾';
        }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-base">{plan.name}</h3>
          <span className="text-orange-500 font-bold text-sm">₹{plan.price}<span className="text-gray-400 font-normal text-xs">/mo</span></span>
        </div>
        <p className="text-gray-500 text-sm mb-3">{plan.description}</p>
        {plan.dishes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {plan.dishes.slice(0, 4).map((d) => (
              <span
                key={d.id}
                className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100"
              >
                {d.name}
              </span>
            ))}
            {plan.dishes.length > 4 && (
              <span className="text-xs text-gray-400">+{plan.dishes.length - 4} more</span>
            )}
          </div>
        )}
        <button
          onClick={() => onSubscribe(plan)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
}
