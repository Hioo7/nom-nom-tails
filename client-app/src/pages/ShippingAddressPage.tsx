import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiHome, FiBriefcase, FiMapPin, FiTrash2, FiPlus, FiEdit2, FiNavigation, FiLoader } from 'react-icons/fi';
import { useAddresses } from '../hooks/useAddresses';
import { formatAddress, type StoredAddress, type AddressType } from '../lib/addressStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { reverseGeocode } from '../hooks/useGpsLocation';

const TYPE_META: Record<AddressType, { label: string; icon: React.ReactNode }> = {
  HOME: { label: 'Home', icon: <FiHome size={13} /> },
  WORK: { label: 'Work', icon: <FiBriefcase size={13} /> },
  OTHER: { label: 'Other', icon: <FiMapPin size={13} /> },
};

function emptyForm(): Omit<StoredAddress, 'id'> {
  return { type: 'HOME', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pin: '', lat: null, lng: null };
}

function Field({
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

export function ShippingAddressPage() {
  const navigate = useNavigate();
  const { addresses, loading, addAddress, editAddress, removeAddress } = useAddresses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StoredAddress, 'id'>>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof StoredAddress, string>>>({});
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);

  const set = (field: keyof Omit<StoredAddress, 'id'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: Partial<Record<keyof StoredAddress, string>> = {};
    if (!form.fullName.trim()) errs.fullName = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.line1.trim()) errs.line1 = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state.trim()) errs.state = 'Required';
    if (!form.pin.trim()) errs.pin = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await editAddress(editingId, form);
        setSavedId(updated.id);
      } else {
        const created = await addAddress(form);
        setSavedId(created.id);
      }
      setTimeout(() => {
        setSavedId(null);
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
      }, 900);
    } catch {
      setErrors({ fullName: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
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
          setForm((prev) => ({
            ...prev,
            lat,
            lng,
            line1: prev.line1 || parts[0] || prev.line1,
            city: prev.city || parts[1] || prev.city,
          }));
        } catch {
          setForm((prev) => ({ ...prev, lat, lng }));
        }
        setDetectingGps(false);
      },
      () => setDetectingGps(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleEdit = (a: StoredAddress) => {
    setEditingId(a.id);
    setForm({ type: a.type, fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, pin: a.pin });
    setErrors({});
    setSavedId(null);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setSavedId(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Manage Addresses</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-3">
        {loading ? (
          <LoadingSpinner fullPage />
        ) : (
          <>
            {addresses.map((a) => {
              const meta = TYPE_META[a.type];
              return (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                      {meta.icon} {meta.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(a)} className="flex items-center gap-1 text-xs text-blue-500 font-medium hover:underline">
                        <FiEdit2 size={11} /> Edit
                      </button>
                      <button onClick={() => removeAddress(a.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{a.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.phone}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{formatAddress(a)}</p>
                </div>
              );
            })}

            {!showForm && (
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 w-full bg-white rounded-2xl shadow-sm px-4 py-4 text-orange-500 font-semibold text-sm border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors"
              >
                <FiPlus size={18} /> Add New Address
              </button>
            )}

            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>

                <div className="flex gap-2 mb-4">
                  {(Object.keys(TYPE_META) as AddressType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.type === t
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'text-gray-500 border-gray-200 hover:border-orange-300'
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
                  {form.lat && <span className="ml-auto text-green-600 font-normal">✓ Located</span>}
                </button>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Name" error={errors.fullName} />
                    <Field label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="Phone" type="tel" error={errors.phone} />
                  </div>
                  <Field label="Address Line 1" value={form.line1} onChange={set('line1')} placeholder="House no, Street, Area" error={errors.line1} />
                  <Field label="Address Line 2 (optional)" value={form.line2} onChange={set('line2')} placeholder="Landmark" />
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City" value={form.city} onChange={set('city')} placeholder="City" error={errors.city} />
                    <Field label="State" value={form.state} onChange={set('state')} placeholder="State" error={errors.state} />
                    <Field label="PIN Code" value={form.pin} onChange={set('pin')} placeholder="400001" type="number" error={errors.pin} />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !!savedId}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {savedId ? <><FiCheck size={14} /> Saved!</> : saving ? 'Saving…' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
