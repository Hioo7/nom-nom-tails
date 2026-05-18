import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft, FiClock, FiRefreshCw, FiCheck, FiLoader,
  FiChevronLeft, FiChevronRight, FiX,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { TimeSlotService } from '../services/timeslot.service';
import { SubscriptionService } from '../services/subscription.service';
import type { MealPlan, TimeSlot } from '../types';
import { paiseToRupees } from '../utils/currency';

const DAY_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_SHORT: Record<string, string> = {
  SUNDAY: 'Sun', MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat',
};

const DURATIONS = [
  { label: '1 Month',  months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
];

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const timeSlotService     = new TimeSlotService();
const subscriptionService = new SubscriptionService();

export function SubscriptionCheckoutPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, token } = useAuth();

  const plan = (location.state as { plan: MealPlan } | null)?.plan;

  const [slots, setSlots]               = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  // dayOfWeek → slotId  (multi-day selection)
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [durationMonths, setDurationMonths] = useState(1);
  const [autoRenew, setAutoRenew]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [step, setStep]             = useState<'form' | 'success'>('form');

  const [calendarDate, setCalendarDate] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [slotPickerDay, setSlotPickerDay]   = useState<string | null>(null);

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

  // Derived date values (computed before hooks so hooks order is stable)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  const startStr = localDateStr(startDate);
  const endDate  = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const endStr   = localDateStr(endDate);
  const total    = plan ? plan.price * durationMonths : 0;
  const selectedDayCount = Object.keys(selectedSlots).length;

  /* ── Calendar grid – must be before any conditional returns ── */
  const calendarGrid = useMemo(() => {
    const { year, month } = calendarDate;
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    const availableDaySet = new Set(slots.map((s) => s.day));
    const selectedDaySet  = new Set(Object.keys(selectedSlots));

    type Cell = null | {
      dayNum: number;
      dayOfWeek: string;
      hasSlots: boolean;
      inRange: boolean;   // within subscription period
      isSelected: boolean;
    };
    const cells: Cell[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date      = new Date(year, month, d);
      const ds        = localDateStr(date);
      const dayOfWeek = DAY_OF_WEEK[date.getDay()];
      const inRange   = ds >= startStr && ds <= endStr;
      const hasSlots  = availableDaySet.has(dayOfWeek as TimeSlot['day']);
      const isSelected = inRange && selectedDaySet.has(dayOfWeek);
      cells.push({ dayNum: d, dayOfWeek, hasSlots, inRange, isSelected });
    }

    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [calendarDate, slots, selectedSlots, startStr, endStr]);

  if (!plan) return null;

  const handleSubmit = async () => {
    if (selectedDayCount === 0) { setError('Please select at least one delivery day.'); return; }
    if (!token) { navigate('/login'); return; }
    setError('');
    setSubmitting(true);
    try {
      for (const [, slotId] of Object.entries(selectedSlots)) {
        await subscriptionService.create(token, {
          mealPlanId:  plan.id,
          timeSlotId:  slotId,
          startDate:   startStr,
          endDate:     endStr,
          isAutoRenew: autoRenew,
        });
      }
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
          {new Date(endStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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

      {/* Plan summary */}
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
            <span className="text-orange-500 font-bold">
              ₹{paiseToRupees(plan.price)}<span className="text-xs text-gray-400 font-normal">/mo</span>
            </span>
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
          <p className="font-bold text-orange-500">₹{paiseToRupees(total)}</p>
        </div>
      </div>

      {/* Delivery Time Slot – Calendar */}
      <div className="bg-white rounded-2xl shadow-sm pt-4 pb-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-1 px-4 flex items-center gap-1.5">
          <FiClock size={14} className="text-orange-500" /> Delivery Days & Times
        </p>
        <p className="text-xs text-gray-400 px-4 mb-3">Tap any available date to add a delivery day</p>

        {slotsLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm px-4 pb-2">
            <FiLoader size={14} className="animate-spin" /> Loading…
          </div>
        ) : slots.length === 0 ? (
          <p className="text-xs text-gray-400 px-4 pb-2">No slots available right now.</p>
        ) : (
          <>
            {/* Selected days chips */}
            {selectedDayCount > 0 && (
              <div className="px-4 mb-3 flex flex-wrap gap-2">
                {Object.entries(selectedSlots).map(([day, slotId]) => {
                  const slot = slots.find((s) => s.id === slotId);
                  return (
                    <div key={day} className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                      <span className="text-xs font-semibold text-orange-700">{DAY_SHORT[day]}</span>
                      {slot && <span className="text-xs text-orange-500">{slot.startTime}–{slot.endTime}</span>}
                      <button
                        onClick={() => setSelectedSlots((prev) => { const n = { ...prev }; delete n[day]; return n; })}
                        className="ml-0.5 hover:text-red-400 text-gray-400"
                      >
                        <FiX size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar */}
            <div className="px-4">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCalendarDate((d) => {
                    const m = d.month === 0 ? 11 : d.month - 1;
                    const y = d.month === 0 ? d.year - 1 : d.year;
                    return { year: y, month: m };
                  })}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiChevronLeft size={18} className="text-gray-600" />
                </button>
                <span className="text-sm font-bold text-gray-800">
                  {new Date(calendarDate.year, calendarDate.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalendarDate((d) => {
                    const m = d.month === 11 ? 0 : d.month + 1;
                    const y = d.month === 11 ? d.year + 1 : d.year;
                    return { year: y, month: m };
                  })}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiChevronRight size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su', 'M', 'T', 'W', 'Th', 'F', 'S'].map((h) => (
                  <div key={h} className="text-center text-xs text-gray-400 font-medium py-1">{h}</div>
                ))}
              </div>

              {/* Date grid */}
              {calendarGrid.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((cell, di) => {
                    if (!cell) return <div key={di} />;
                    const { dayNum, dayOfWeek, hasSlots, inRange, isSelected } = cell;
                    const isDisabled = !inRange || !hasSlots;
                    return (
                      <button
                        key={di}
                        disabled={isDisabled}
                        onClick={() => {
                          setSlotPickerDay(dayOfWeek);
                          setSlotPickerOpen(true);
                        }}
                        className={`flex items-center justify-center mx-auto my-0.5 w-9 h-9 rounded-full text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-orange-500 text-white'
                            : isDisabled
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-orange-500" /> Selected
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-full border border-gray-300" /> Available
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-gray-100" /> Outside range
                </div>
              </div>
            </div>
          </>
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
        {submitting
          ? 'Processing…'
          : selectedDayCount > 1
          ? `Subscribe (${selectedDayCount} days/week) · ₹${paiseToRupees(total * selectedDayCount)}`
          : `Subscribe Now · ₹${paiseToRupees(total)}`}
      </button>

      {/* Time slot picker bottom sheet */}
      {slotPickerOpen && slotPickerDay && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setSlotPickerOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-base font-bold text-gray-900 mb-0.5">Select Delivery Time</h3>
            <p className="text-sm text-gray-500 mb-4">
              Every {slotPickerDay.charAt(0) + slotPickerDay.slice(1).toLowerCase()}
            </p>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[45vh]">
              {slots
                .filter((s) => s.day === slotPickerDay)
                .map((slot) => {
                  const isSelected = selectedSlots[slotPickerDay] === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlots((prev) => ({ ...prev, [slotPickerDay]: slot.id }));
                        setSlotPickerOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${
                        isSelected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <p className={`text-sm font-bold flex-1 text-left ${isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
                        {slot.startTime} – {slot.endTime}
                      </p>
                      {isSelected && <FiCheck size={16} className="text-orange-500 flex-shrink-0" />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
