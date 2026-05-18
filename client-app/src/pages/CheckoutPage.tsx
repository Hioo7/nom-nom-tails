import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiClock, FiCheck,
  FiPlus, FiHome, FiBriefcase, FiChevronDown, FiChevronUp, FiNavigation, FiLoader, FiHeart,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { OrderService } from '../services/order.service';
import { TimeSlotService } from '../services/timeslot.service';
import { CampaignService } from '../services/campaign.service';
import type { TimeSlot, SafeCustomerCampaign, Order } from '../types';
import {
  formatAddress,
  type StoredAddress,
  type AddressType,
} from '../lib/addressStore';
import { useAddresses } from '../hooks/useAddresses';
import { reverseGeocode } from '../hooks/useGpsLocation';
import { paiseToRupees } from '../utils/currency';

// const DAY_LABEL: Record<string, string> = {
//   MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
//   THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
// };

// const DAY_INDEX: Record<string, number> = {
//   SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
//   THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
// };

const MIN_DAYS_AHEAD = 2;

// Returns days until next occurrence of a given day-of-week (never 0 = today)
// function daysUntilNext(day: string): number {
//   const target = DAY_INDEX[day];
//   const todayIdx = new Date().getDay();
//   return ((target - todayIdx + 7) % 7) || 7;
// }

// // Returns the next calendar date (YYYY-MM-DD) for a given day-of-week
// function nextDateForDay(day: string): string {
//   const result = new Date();
//   result.setDate(result.getDate() + daysUntilNext(day));
//   return result.toISOString().split('T')[0];
// }

const timeSlotService = new TimeSlotService();
const orderService = new OrderService();
const campaignService = new CampaignService();

type Step = 'details' | 'success';

const TYPE_META: Record<AddressType, { label: string; icon: React.ReactNode }> = {
  HOME: { label: 'Home', icon: <FiHome size={12} /> },
  WORK: { label: 'Work', icon: <FiBriefcase size={12} /> },
  OTHER: { label: 'Other', icon: <FiMapPin size={12} /> },
};

// Defined at module level to avoid remount bug
function AddressFormField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors bg-gray-50 focus:bg-white"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function emptyForm(): Omit<StoredAddress, 'id'> {
  return { type: 'HOME', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pin: '', lat: null, lng: null };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const { addresses, addAddress } = useAddresses();

  const [step, setStep] = useState<Step>('details');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState<Omit<StoredAddress, 'id'>>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StoredAddress, string>>>({});
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[] | null>(null);
  const slotsLoading = !!token && timeSlots === null;
  // Multi-day delivery: dateStr (YYYY-MM-DD) → slotId
  const [selectedDeliveries, setSelectedDeliveries] = useState<Record<string, string>>({});
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [slotPickerDay, setSlotPickerDay] = useState<string | null>(null);
  const [slotPickerDate, setSlotPickerDate] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const [campaigns, setCampaigns] = useState<SafeCustomerCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const [kindnessLifetime, setKindnessLifetime] = useState(0);
  const [kindnessOrderCount, setKindnessOrderCount] = useState(0);
  const [kindnessFromOrder, setKindnessFromOrder] = useState(0);
  const kindnessCardRef = useRef<HTMLDivElement>(null);

  const deliveryFee = 40;
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? null;
  const deliveryDayCount = Math.max(1, Object.keys(selectedDeliveries).length);
  const grandTotal = (paiseToRupees(totalPrice) + deliveryFee) * deliveryDayCount + (selectedCampaign ? paiseToRupees(selectedCampaign.costAmount) : 0);
  const kindnessFromCurrentOrder = Math.round(paiseToRupees(totalPrice) * 0.05);

  const getDayOfWeek = (date: Date): string => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

  const calendarGrid = useMemo(() => {
    const { year, month } = calendarDate;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDays = new Set(
      (timeSlots ?? []).filter((s) => s.isActive).map((s) => s.day),
    );

    type CalendarCell = null | { date: Date; dateStr: string; hasSlots: boolean; isPast: boolean; isToday: boolean };
    const cells: CalendarCell[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'])[date.getDay()];
      const diffDays = Math.floor((date.getTime() - today.getTime()) / 86400000);
      const isPast = diffDays < MIN_DAYS_AHEAD;
      const hasSlots = availableDays.has(dayOfWeek as TimeSlot['day']);
      const isToday = diffDays === 0;
      cells.push({ date, dateStr, hasSlots, isPast, isToday });
    }

    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [calendarDate, timeSlots]);

  useEffect(() => {
    if (!token) return;
    timeSlotService
      .listActive(token)
      .then(setTimeSlots)
      .catch(() => {
        setTimeSlots([]);
        setError('Failed to load delivery slots. Please refresh.');
      });
    campaignService.list(token).then(setCampaigns).catch(() => {});
    orderService.listMine(token).then((orders: Order[]) => {
      let total = 0;
      for (const o of orders) {
        const items = o.items.reduce((s, i) => s + i.dish.price * i.quantity, 0);
        total += Math.round(paiseToRupees(items) * 0.05);
      }
      setKindnessLifetime(total);
      setKindnessOrderCount(orders.length);
    }).catch(() => {});
  }, [token]);

  // Auto-select first address; allow manual override
  const effectiveSelectedId = selectedId ?? addresses[0]?.id ?? null;

  const setField = (field: keyof Omit<StoredAddress, 'id'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setNewForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof StoredAddress, string>> = {};
    if (!newForm.fullName.trim()) errs.fullName = 'Required';
    if (!newForm.phone.trim()) errs.phone = 'Required';
    if (!newForm.line1.trim()) errs.line1 = 'Required';
    if (!newForm.city.trim()) errs.city = 'Required';
    if (!newForm.state.trim()) errs.state = 'Required';
    if (!newForm.pin.trim()) errs.pin = 'Required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) return;
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const address = await reverseGeocode(lat, lng);
          const parts = address.split(', ');
          setNewForm((prev) => ({
            ...prev,
            lat,
            lng,
            line1: prev.line1 || parts[0] || prev.line1,
            city: prev.city || parts[1] || prev.city,
          }));
        } catch {
          setNewForm((prev) => ({ ...prev, lat, lng }));
        }
        setDetectingGps(false);
      },
      () => setDetectingGps(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSaveNewAddress = async () => {
    if (!validateForm()) return;
    const created = await addAddress(newForm);
    setSelectedId(created.id);
    setShowAddForm(false);
    setNewForm(emptyForm());
    setFormErrors({});
  };

  const handlePlaceOrder = async () => {
    const selected = addresses.find((a) => a.id === effectiveSelectedId);
    if (!selected) {
      setError('Please select or add a delivery address.');
      return;
    }
    if (Object.keys(selectedDeliveries).length === 0) {
      setError('Please select at least one delivery date and time slot.');
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);
    try {
      let firstOrderId = '';
      for (const [deliveryDate, timeSlotId] of Object.entries(selectedDeliveries)) {
        const order = await orderService.create(token, {
          items: items.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
          deliveryDate,
          addressId: selected.id,
          timeSlotId,
        });
        if (!firstOrderId) firstOrderId = order.id;
      }
      if (selectedCampaignId) {
        try {
          await campaignService.contribute(token, selectedCampaignId);
        } catch {
          // contribution failure should not block the order success
        }
      }
      setOrderId(firstOrderId);
      setKindnessFromOrder(kindnessFromCurrentOrder);
      clearCart();
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    const newLifetime = kindnessLifetime + kindnessFromOrder;
    const pct = Math.min(100, Math.round((newLifetime / 5000) * 100));
    const firstName = token ? (items[0]?.dish?.name ? '' : '') : '';
    void firstName;

    const drawKindnessBadge = (): Promise<Blob | null> => {
      const W = 640, H = 380;
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const c = cvs.getContext('2d');
      if (!c) return Promise.resolve(null);

      // Rounded rect helper
      const rr = (x: number, y: number, w: number, h: number, r: number) => {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      };

      // Background gradient
      const bg = c.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0a0a0a'); bg.addColorStop(0.6, '#1a0800'); bg.addColorStop(1, '#2d1000');
      rr(0, 0, W, H, 24); c.fillStyle = bg; c.fill();

      // Header label
      c.fillStyle = '#f97316'; c.font = 'bold 12px system-ui';
      c.fillText('NOM NOM TAILS · KINDNESS METER', 32, 42);

      // Main headline
      c.fillStyle = '#ffffff'; c.font = 'bold 26px system-ui';
      c.fillText(`Raised \u20B9${newLifetime.toLocaleString('en-IN')} for stray dogs`, 32, 84);

      c.fillStyle = 'rgba(251,146,60,0.85)'; c.font = '15px system-ui';
      c.fillText(`+\u20B9${kindnessFromOrder} contributed from this order`, 32, 110);

      // Progress bar
      rr(32, 132, W - 64, 10, 5); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill();
      rr(32, 132, Math.max(16, (W - 64) * pct / 100), 10, 5); c.fillStyle = '#f97316'; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.font = '11px system-ui';
      c.fillText(`${pct}% of monthly rescue goal`, 32, 158);

      // Stat boxes
      const stats = [
        { label: 'Total Raised', value: `\u20B9${newLifetime.toLocaleString('en-IN')}`, color: '#fb923c' },
        { label: 'Orders Made', value: String(kindnessOrderCount + 1), color: '#fbbf24' },
      ];
      const bw = (W - 80) / 2;
      stats.forEach((s, i) => {
        const bx = 32 + i * (bw + 8);
        rr(bx, 176, bw, 78, 12); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill();
        c.fillStyle = s.color; c.font = 'bold 20px system-ui'; c.textAlign = 'center';
        c.fillText(s.value, bx + bw / 2, 216);
        c.fillStyle = 'rgba(251,146,60,0.6)'; c.font = '11px system-ui';
        c.fillText(s.label, bx + bw / 2, 238);
      });
      c.textAlign = 'left';

      // Impact message box
      rr(32, 274, W - 64, 66, 12); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill();
      c.fillStyle = '#fff7ed'; c.font = '13px system-ui';
      c.fillText(`Your \u20B9${kindnessFromOrder} just helped fund care for a stray dog in Bangalore.`, 48, 302);
      c.fillStyle = 'rgba(251,146,60,0.7)'; c.font = 'bold 12px system-ui';
      c.fillText('#NomNomTails  #KindnessMeter', 48, 324);

      // Branding
      c.fillStyle = 'rgba(251,146,60,0.35)'; c.font = '11px system-ui';
      c.textAlign = 'right'; c.fillText('nom-nom-tails.com', W - 32, H - 14);

      return new Promise<Blob | null>((resolve) => cvs.toBlob(resolve, 'image/png'));
    };

    const handleShare = async () => {
      const blob = await drawKindnessBadge();

      if (blob) {
        const file = new File([blob], 'kindness-badge.png', { type: 'image/png' });
        // Web Share API with image (Android Chrome, iOS Safari 15+)
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My Kindness Badge',
              text: `I just raised \u20B9${newLifetime} for stray dogs! #NomNomTails`,
            });
            return;
          } catch { /* cancelled */ }
        }
        // macOS / desktop — download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'kindness-badge.png'; a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Last resort: text share
      const text = `I just contributed \u20B9${kindnessFromOrder} to stray dog rescue through Nom Nom Tails! #NomNomTails`;
      if (navigator.share) await navigator.share({ text }).catch(() => {});
    };

    return (
      <div className="min-h-screen bg-orange-50">
        <div className="max-w-sm mx-auto flex flex-col">
        {/* Top hero */}
        <div className="flex flex-col items-center pt-12 pb-6 px-4">
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            <FiCheck size={36} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Order Placed! 🎉</h2>
          <p className="text-gray-500 text-sm mb-0.5">Estimated delivery: 30–45 mins</p>
          <p className="text-gray-400 text-xs font-mono">
            Order ID: {orderId.slice(0, 12)}…
          </p>
        </div>

        {/* Kindness Meter card */}
        <div ref={kindnessCardRef} className="mx-4 rounded-3xl overflow-hidden mb-5" style={{ background: 'linear-gradient(145deg, #0a0a0a 0%, #1a0800 60%, #2d1000 100%)' }}>
          <div className="p-5">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🌱
              </div>
              <div>
                <p className="font-bold text-white text-sm">Your Kindness Meter</p>
                <p className="text-xs text-orange-300">You just made a difference!</p>
              </div>
            </div>

            {/* Progress */}
            <p className="text-xs text-orange-300 mb-1.5">
              Total impact: ₹{newLifetime.toLocaleString('en-IN')} raised ({pct}% to monthly goal)
            </p>
            <div className="w-full h-2.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${pct}%`, transition: 'width 1.2s ease-out' }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Total Raised', value: `₹${newLifetime.toLocaleString('en-IN')}`, color: 'text-orange-400' },
                { label: 'Orders Made', value: String(kindnessOrderCount + 1), color: 'text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-orange-400/70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Impact message */}
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-orange-100 leading-relaxed">
                🐕{' '}
                <span className="text-orange-400 font-bold">
                  Your ₹{kindnessFromOrder} from this order
                </span>{' '}
                just helped fund care for a stray dog in Bangalore. Thank you!
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full border-2 border-orange-500 text-orange-500 font-bold py-4 rounded-2xl text-sm transition-colors hover:bg-orange-50"
          >
            🏅 Share My Kindness Badge
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
          >
            📦 Track My Order
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Which addresses to show (collapse to 2 if many)
  const visibleAddresses =
    showAllAddresses || addresses.length <= 2 ? addresses : addresses.slice(0, 2);

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      {/* Header */}
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/cart')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <FiArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* ── Delivery Address section (Flipkart style) ── */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiMapPin size={16} className="text-orange-500" />
            <h3 className="font-bold text-gray-800 text-sm">Delivery Address</h3>
          </div>
          {addresses.length > 0 && (
            <button
              onClick={() => navigate('/profile/address')}
              className="text-xs text-orange-500 font-semibold"
            >
              Manage
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {visibleAddresses.map((a) => {
            const isSelected = a.id === effectiveSelectedId;
            const meta = TYPE_META[a.type];
            return (
              <button
                key={a.id}
                onClick={() => { setSelectedId(a.id); setShowAddForm(false); }}
                className={`w-full text-left px-4 py-4 transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio */}
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Type badge + name */}
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800 truncate">{a.fullName}</span>
                      <span className="text-xs text-gray-400">{a.phone}</span>
                    </div>

                    {/* Address */}
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {formatAddress(a)}
                    </p>

                    {/* Deliver Here button — only on selected */}
                    {isSelected && (
                      <div className="mt-3">
                        <span className="inline-block bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg tracking-wide">
                          DELIVER HERE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Show more / less */}
          {addresses.length > 2 && (
            <button
              onClick={() => setShowAllAddresses((v) => !v)}
              className="w-full flex items-center justify-center gap-1 py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showAllAddresses ? (
                <><FiChevronUp size={13} /> Show less</>
              ) : (
                <><FiChevronDown size={13} /> {addresses.length - 2} more address{addresses.length - 2 > 1 ? 'es' : ''}</>
              )}
            </button>
          )}

          {/* Add new address — collapsed trigger */}
          {!showAddForm && (
            <button
              onClick={() => { setShowAddForm(true); setSelectedId(null); }}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center">
                <FiPlus size={10} className="text-gray-400" />
              </div>
              <span className="text-sm font-semibold text-orange-500">Add New Address</span>
            </button>
          )}

          {/* Inline add address form */}
          {showAddForm && (
            <div className="px-4 py-4 bg-orange-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">Add New Address</span>
              </div>

              {/* Address type */}
              <div className="flex gap-2 mb-4">
                {(Object.keys(TYPE_META) as AddressType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewForm((prev) => ({ ...prev, type: t }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      newForm.type === t
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    {TYPE_META[t].icon} {TYPE_META[t].label}
                  </button>
                ))}
              </div>

              {/* GPS detect */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-xs font-semibold mb-1 disabled:opacity-60"
              >
                {detectingGps ? <FiLoader size={13} className="animate-spin" /> : <FiNavigation size={13} />}
                {detectingGps ? 'Detecting…' : 'Use current GPS location'}
                {newForm.lat && <span className="ml-auto text-green-600 font-normal">✓ Located</span>}
              </button>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <AddressFormField label="Full Name" value={newForm.fullName} onChange={setField('fullName')} placeholder="Name" error={formErrors.fullName} />
                  <AddressFormField label="Phone" value={newForm.phone} onChange={setField('phone')} placeholder="Phone" type="tel" error={formErrors.phone} />
                </div>
                <AddressFormField label="Address Line 1" value={newForm.line1} onChange={setField('line1')} placeholder="House no, Street, Area" error={formErrors.line1} />
                <AddressFormField label="Address Line 2 (optional)" value={newForm.line2} onChange={setField('line2')} placeholder="Landmark" />
                <div className="grid grid-cols-3 gap-3">
                  <AddressFormField label="City" value={newForm.city} onChange={setField('city')} placeholder="City" error={formErrors.city} />
                  <AddressFormField label="State" value={newForm.state} onChange={setField('state')} placeholder="State" error={formErrors.state} />
                  <AddressFormField label="PIN" value={newForm.pin} onChange={setField('pin')} placeholder="400001" type="number" error={formErrors.pin} />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowAddForm(false); setNewForm(emptyForm()); setFormErrors({}); }}
                  className="flex-1 border border-gray-200 bg-white text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewAddress}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors tracking-wide"
                >
                  SAVE & DELIVER HERE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Time Slot – Calendar */}
      <div className="bg-white rounded-2xl pt-4 pb-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 px-4 flex items-center gap-2">
          <FiClock size={15} className="text-orange-500" /> Delivery Date & Time
        </h3>

        {slotsLoading ? (
          <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm px-4">
            <FiLoader size={14} className="animate-spin" /> Loading slots…
          </div>
        ) : (timeSlots ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2 px-4">No delivery slots available right now.</p>
        ) : (
          <>
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
                    const { date, dateStr, hasSlots, isPast } = cell;
                    const isSelected = dateStr in selectedDeliveries;
                    const isDisabled = isPast || !hasSlots;
                    return (
                      <button
                        key={di}
                        disabled={isDisabled}
                        onClick={() => {
                          setSlotPickerDay(getDayOfWeek(date));
                          setSlotPickerDate(dateStr);
                          setSlotPickerOpen(true);
                        }}
                        className={`relative flex items-center justify-center mx-auto my-0.5 w-9 h-9 rounded-full text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-orange-500 text-white'
                            : isDisabled
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}
                      >
                        {date.getDate()}
                        {isSelected && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full" />
                        )}
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
                  <div className="w-3 h-3 rounded-full bg-gray-100" /> Unavailable
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Order Summary</h3>
        <div className="flex flex-col gap-2">
          {items.map(({ dish, quantity }) => (
            <div key={dish.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{dish.name} × {quantity}</span>
              <span className="font-medium text-gray-800">₹{paiseToRupees(dish.price * quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between text-sm text-gray-500">
            <span>Delivery fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Kindness Contribution */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🌱</span>
          <h3 className="text-sm font-bold text-orange-700">Your Kindness Contribution</h3>
        </div>
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className="text-2xl font-black text-gray-900">₹{kindnessFromCurrentOrder}</span>
          <span className="text-xs text-gray-500">from this order → stray dog rescue 🐕</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">5% of every order is donated automatically — no extra charge</p>
        {kindnessLifetime > 0 && (
          <p className="text-xs text-orange-600 font-bold mt-2">
            You've raised ₹{kindnessLifetime.toLocaleString('en-IN')} total! 🐾
          </p>
        )}
      </div>

      {/* Campaign contribution */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
            <FiHeart size={16} className="text-orange-500" />
            <h3 className="font-bold text-gray-800 text-sm">Support a Cause</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {/* No contribution option */}
            <button
              onClick={() => setSelectedCampaignId(null)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${selectedCampaignId === null ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedCampaignId === null ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                {selectedCampaignId === null && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-500">No, thanks</span>
            </button>

            {/* Campaign options */}
            {campaigns.map((c) => {
              const isSelected = selectedCampaignId === c.id;
              const raised = paiseToRupees(c.summary.totalRaised);
              const goal = paiseToRupees(c.costAmount);
              const percent = Math.min(100, goal > 0 ? Math.round((raised / goal) * 100) : 0);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampaignId(c.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-xl">🐾</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-800 truncate">{c.name}</p>
                      <span className="text-xs font-bold text-orange-500 flex-shrink-0">+₹{paiseToRupees(c.costAmount)}</span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>
                    )}
                    <div className="mt-1.5 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      ₹{raised} raised · {c.summary.successfulContributionCount} supporter{c.summary.successfulContributionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment note */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 mb-4 text-sm text-orange-700">
        💳 Payment will be collected at the time of delivery (Cash / UPI)
        {selectedCampaign && (
          <p className="mt-1 text-xs text-orange-600">
            ❤️ Includes ₹{paiseToRupees(selectedCampaign.costAmount)} contribution to "{selectedCampaign.name}"
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg shadow-orange-200"
      >
        {loading
          ? 'Placing order…'
          : Object.keys(selectedDeliveries).length > 1
          ? `Place ${Object.keys(selectedDeliveries).length} Orders · ₹${grandTotal}`
          : `Place Order · ₹${grandTotal}`}
      </button>

      {/* Time slot picker bottom sheet */}
      {slotPickerOpen && slotPickerDay && slotPickerDate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setSlotPickerOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <h3 className="text-base font-bold text-gray-900 mb-0.5">Select Delivery Time</h3>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(slotPickerDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[45vh]">
              {(timeSlots ?? [])
                .filter((s) => s.day === slotPickerDay)
                .map((slot) => {
                  const disabled = !slot.isActive;
                  const isSelected = selectedDeliveries[slotPickerDate] === slot.id;
                  return (
                    <button
                      key={slot.id}
                      disabled={disabled}
                      onClick={() => {
                        setSelectedDeliveries((prev) => ({ ...prev, [slotPickerDate]: slot.id }));
                        setSlotPickerOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${
                        disabled
                          ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-bold ${disabled ? 'text-gray-400' : isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
                          {slot.startTime} – {slot.endTime}
                        </p>
                        {!slot.isActive && <p className="text-xs text-red-400 mt-0.5">Not available</p>}
                      </div>
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
