import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiCheck,
  FiPlus, FiHome, FiBriefcase, FiChevronDown, FiChevronUp, FiNavigation, FiLoader,
} from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { OrderService } from '../services/order.service';
import {
  formatAddress,
  type StoredAddress,
  type AddressType,
} from '../lib/addressStore';
import { useAddresses } from '../hooks/useAddresses';
import { reverseGeocode } from '../hooks/useGpsLocation';

const orderService = new OrderService();

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

  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const deliveryFee = 40;
  const grandTotal = totalPrice + deliveryFee;
  const today = new Date().toISOString().split('T')[0];

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
    if (!deliveryDate) {
      setError('Please select a delivery date.');
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const order = await orderService.create(token, {
        items: items.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
        deliveryDate,
        addressId: selected.id,
      });
      setOrderId(order.id);
      clearCart();
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FiCheck size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 text-sm mb-1">Your order has been confirmed.</p>
        <p className="text-gray-400 text-xs mb-6">
          Order ID: <span className="font-mono text-gray-600">{orderId.slice(0, 12)}…</span>
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
        >
          Back to Home
        </button>
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

      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Order Summary</h3>
        <div className="flex flex-col gap-2">
          {items.map(({ dish, quantity }) => (
            <div key={dish.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{dish.name} × {quantity}</span>
              <span className="font-medium text-gray-800">₹{dish.price * quantity}</span>
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

      {/* Delivery Date */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FiCalendar size={15} className="text-orange-500" /> Delivery Date
        </label>
        <input
          type="date"
          value={deliveryDate}
          min={today}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors mt-1"
        />
      </div>

      {/* Payment note */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 mb-4 text-sm text-orange-700">
        💳 Payment will be collected at the time of delivery (Cash / UPI)
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
        {loading ? 'Placing order…' : `Place Order · ₹${grandTotal}`}
      </button>
    </div>
  );
}
