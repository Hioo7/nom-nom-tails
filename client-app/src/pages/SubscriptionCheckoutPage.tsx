import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft, FiClock, FiRefreshCw, FiCheck, FiLoader,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { TimeSlotService } from '../services/timeslot.service';
import { SubscriptionService } from '../services/subscription.service';
import type { MealPlan, TimeSlot } from '../types';

const DAY_LABEL: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};
const DAY_INDEX: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};
function nextDateForDay(day: string): string {
  const target = DAY_INDEX[day];
  const today = new Date();
  const diff = ((target - today.getDay() + 7) % 7) || 7;
  const d = new Date(today);
  d.setDate(today.getDate() + diff);
  return d.toISOString().split('T')[0];
}

const DURATIONS = [
  { label: '1 Month',  months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
];

const timeSlotService     = new TimeSlotService();
const subscriptionService = new SubscriptionService();

export function SubscriptionCheckoutPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, token } = useAuth();

  const plan = (location.state as { plan: MealPlan } | null)?.plan;

  const [slots, setSlots]                   = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading]     = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [durationMonths, setDurationMonths] = useState(1);
  const [autoRenew, setAutoRenew]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState('');
  const [step, setStep]                     = useState<'form' | 'success'>('form');

  useEffect(() => {
    if (!plan) { navigate('/premium'); return; }
    if (!user)  { navigate('/login', { state: { from: '/premium' } }); return; }
  }, [plan, user, navigate]);

  useEffect(() => {
    if (!token) return;
    setSlotsLoading(true);
    timeSlotService
      .listActive(token)
      .then((all) => setSlots(all.filter((s) => s.isActive)))
      .catch(() => setError('Failed to load time slots.'))
      .finally(() => setSlotsLoading(false));
  }, [token]);

  if (!plan) return null;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const startStr  = startDate.toISOString().split('T')[0];
  const endDate   = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const endStr    = endDate.toISOString().split('T')[0];
  const total     = plan.price * durationMonths;

  const handleSubmit = async () => {
    if (!selectedSlotId) { setError('Please select a delivery time slot.'); return; }
    if (!token)          { navigate('/login'); return; }
    setError('');
    setSubmitting(true);
    try {
      await subscriptionService.create(token, {
        mealPlanId:  plan.id,
        timeSlotId:  selectedSlotId,
        startDate:   startStr,
        endDate:     endStr,
        isAutoRenew: autoRenew,
      });
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Subscription failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FiCheck size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Subscribed! 🎉</h2>
        <p className="text-gray-500 text-sm mb-1">You're now subscribed to</p>
        <p className="font-bold text-gray-800 text-base mb-4">{plan.name}</p>
        <p className="text-xs text-gray-400 mb-8">
          {new Date(startStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' → '}
          {new Date(endStr   + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <button
          onClick={() => navigate('/premium')}
          className="w-full max-w-xs bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-colors"
        >
          Back to Meal Plans
        </button>
      </div>
    );
  }

  /* ── Form screen ── */
  return (
    <div className="max-w-lg mx-auto px-4 pb-10">
      {/* Header */}
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/premium')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <FiArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Subscription Checkout</h1>
      </div>

      {/* Plan summary card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <img
          src={plan.imageUrl}
          alt={plan.name}
          className="w-full h-36 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x150/f97316/white?text=🐾'; }}
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-base">{plan.name}</h2>
            <span className="text-orange-500 font-bold">₹{plan.price}<span className="text-xs text-gray-400 font-normal">/mo</span></span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{plan.description}</p>
          {plan.dishes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {plan.dishes.slice(0, 4).map((d) => (
                <span key={d.id} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                  {d.name}
                </span>
              ))}
              {plan.dishes.length > 4 && (
                <span className="text-xs text-gray-400">+{plan.dishes.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Subscription Duration</p>
        <div className="flex gap-2 mb-3">
          {DURATIONS.map((d) => (
            <button
              key={d.months}
              onClick={() => setDurationMonths(d.months)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                durationMonths === d.months
                  ? 'border-orange-400 bg-orange-50 text-orange-600'
                  : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-500">
            {new Date(startStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' → '}
            {new Date(endStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="font-bold text-orange-500">₹{total}</p>
        </div>
      </div>

      {/* Time Slot */}
      <div className="bg-white rounded-2xl shadow-sm pt-4 pb-3 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-3 px-4 flex items-center gap-1.5">
          <FiClock size={14} className="text-orange-500" /> Delivery Time Slot
        </p>
        {slotsLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm px-4 pb-2">
            <FiLoader size={14} className="animate-spin" /> Loading…
          </div>
        ) : slots.length === 0 ? (
          <p className="text-xs text-gray-400 px-4 pb-2">No slots available right now.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollSnapType: 'x mandatory' }}>
            {slots.map((slot) => {
              const isSelected = slot.id === selectedSlotId;
              const date = nextDateForDay(slot.day);
              const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  style={{ scrollSnapAlign: 'start', minWidth: '100px' }}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border-2 transition-all relative ${
                    isSelected ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
                      <FiCheck size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span className={`text-base font-bold leading-none ${isSelected ? 'text-orange-500' : 'text-gray-800'}`}>
                    {DAY_LABEL[slot.day]}
                  </span>
                  <span className="text-xs text-gray-400">{dateLabel}</span>
                  <div className={`w-8 h-px ${isSelected ? 'bg-orange-300' : 'bg-gray-200'}`} />
                  <span className={`text-xs font-semibold ${isSelected ? 'text-orange-600' : 'text-gray-600'}`}>{slot.startTime}</span>
                  <span className="text-xs text-gray-400">to {slot.endTime}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-renew */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <button
          onClick={() => setAutoRenew((v) => !v)}
          className="w-full flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${autoRenew ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <FiRefreshCw size={16} className={autoRenew ? 'text-orange-500' : 'text-gray-400'} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Auto-renewal</p>
              <p className="text-xs text-gray-400">Renew automatically when plan ends</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${autoRenew ? 'bg-orange-400' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoRenew ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Payment note */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 mb-4 text-sm text-orange-700">
        💳 Payment will be collected at the time of delivery (Cash / UPI)
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-orange-200"
      >
        {submitting ? 'Processing…' : `Subscribe Now · ₹${total}`}
      </button>
    </div>
  );
}
