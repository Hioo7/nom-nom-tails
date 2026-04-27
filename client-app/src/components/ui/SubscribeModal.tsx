import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiClock, FiRefreshCw, FiLoader } from 'react-icons/fi';
import type { MealPlan, TimeSlot } from '../../types';
import { TimeSlotService } from '../../services/timeslot.service';
import { SubscriptionService } from '../../services/subscription.service';
import { paiseToRupees } from '../../utils/currency';

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

const timeSlotService   = new TimeSlotService();
const subscriptionService = new SubscriptionService();

interface Props {
  plan: MealPlan;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscribeModal({ plan, token, onClose, onSuccess }: Props) {
  const [slots, setSlots]               = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [durationMonths, setDurationMonths] = useState(1);
  const [autoRenew, setAutoRenew]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    setSlotsLoading(true);
    timeSlotService
      .listActive(token)
      .then((all) => setSlots(all.filter((s) => s.isActive)))
      .catch(() => setError('Failed to load time slots.'))
      .finally(() => setSlotsLoading(false));
  }, [token]);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const startStr = startDate.toISOString().split('T')[0];
  const endDate  = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const endStr   = endDate.toISOString().split('T')[0];

  const totalPrice = plan.price * durationMonths;

  const handleSubmit = async () => {
    if (!selectedSlotId) { setError('Please select a delivery time slot.'); return; }
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
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Subscription failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide">Subscribe</p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{plan.name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <FiX size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5">

          {/* Price summary */}
          <div className="bg-orange-50 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Plan price</p>
              <p className="font-bold text-gray-800">₹{paiseToRupees(plan.price)}<span className="text-xs font-normal text-gray-400">/mo</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total ({durationMonths} mo)</p>
              <p className="font-bold text-orange-500 text-lg">₹{paiseToRupees(totalPrice)}</p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Duration</p>
            <div className="flex gap-2">
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
            <p className="text-xs text-gray-400 mt-2">
              {new Date(startStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' → '}
              {new Date(endStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Time Slot */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <FiClock size={14} className="text-orange-500" /> Delivery Time Slot
            </p>
            {slotsLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <FiLoader size={14} className="animate-spin" /> Loading…
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollSnapType: 'x mandatory' }}>
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
                        isSelected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-100 bg-white hover:border-orange-200'
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
          <button
            onClick={() => setAutoRenew((v) => !v)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl border-2 transition-colors ${
              autoRenew ? 'border-orange-400 bg-orange-50' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <FiRefreshCw size={16} className={autoRenew ? 'text-orange-500' : 'text-gray-400'} />
              <div className="text-left">
                <p className={`text-sm font-semibold ${autoRenew ? 'text-orange-600' : 'text-gray-700'}`}>Auto-renewal</p>
                <p className="text-xs text-gray-400">Renew automatically when subscription ends</p>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${autoRenew ? 'bg-orange-400' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${autoRenew ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-orange-200 mb-2"
          >
            {submitting ? 'Subscribing…' : `Subscribe · ₹${paiseToRupees(totalPrice)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
