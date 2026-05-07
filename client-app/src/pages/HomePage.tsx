import React, { useEffect, useState } from 'react';
import { FiSearch, FiMapPin, FiChevronDown } from 'react-icons/fi';
import { DishCard } from '../components/ui/DishCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { LocationPicker } from '../components/ui/LocationPicker';
import { DishService } from '../services/dish.service';
// import { CampaignService } from '../services/campaign.service';
import { useAuth } from '../hooks/useAuth';
import { useGpsLocation } from '../hooks/useGpsLocation';
// import { paiseToRupees } from '../utils/currency';
import type { Dish } from '../types';

// TODO: re-enable InlineCampaignBanner once redesigned
// function InlineCampaignBanner({ campaign }: { campaign: SafeCustomerCampaign }) { ... }

const dishService = new DishService();
// const campaignService = new CampaignService();

export function HomePage() {
  const { user, token } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  // const [campaigns, setCampaigns] = useState<SafeCustomerCampaign[]>([]);

  const { status, location, requestLocation, setManualLocation } = useGpsLocation(token);

  useEffect(() => {
    dishService
      .list()
      .then((data) => setDishes(data.filter((d) => d.isActive)))
      .catch(() => setError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // useEffect(() => {
  //   if (!token) return;
  //   campaignService.list(token).then(setCampaigns).catch(() => {});
  // }, [token]);

  const filtered = dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description.toLowerCase().includes(query.toLowerCase()),
  );

  const locationLabel =
    status === 'loading'
      ? 'Detecting...'
      : status === 'granted' && location
      ? location.address
      : 'Enable location';

  return (
    <>
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="pt-6 pb-4">
          {/* Location bar — tapping opens picker */}
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1 text-left group mb-1"
          >
            <FiMapPin size={13} className="text-orange-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-800 truncate max-w-[200px] leading-tight">
              {locationLabel}
            </span>
            <FiChevronDown size={13} className="text-gray-400 shrink-0" />
          </button>

          {status === 'granted' && location && (
            <p className="text-xs text-gray-400 mb-0.5 truncate max-w-[240px]">
              Delivering to this location
            </p>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {user ? `Hey ${user.name.split(' ')[0]} 👋` : 'Fresh meals for your pet 🐾'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">What would your furry friend like today?</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm outline-none focus:border-orange-300 transition-colors"
          />
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner fullPage />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🐾</p>
            <p className="text-gray-500">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-orange-500 font-medium">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🐶</p>
            <p className="text-gray-500">No dishes found for "{query}"</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} items available</p>
            {(() => {
              const CHUNK = 2;
              const nodes: React.ReactNode[] = [];
              for (let i = 0; i < filtered.length; i += CHUNK) {
                const chunk = filtered.slice(i, i + CHUNK);
                nodes.push(
                  <div key={`dishes-${i}`} className="grid grid-cols-2 gap-3 mb-3">
                    {chunk.map((dish) => <DishCard key={dish.id} dish={dish} />)}
                  </div>
                );
                // TODO: re-enable campaign banners once redesigned
                // if (campaigns.length > 0) {
                //   const campaign = campaigns[Math.floor(i / CHUNK) % campaigns.length];
                //   nodes.push(<InlineCampaignBanner key={`campaign-${i}`} campaign={campaign} />);
                // }
              }
              return nodes;
            })()}
          </>
        )}
      </div>

      {/* Location picker bottom sheet */}
      <LocationPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        gpsStatus={status}
        onUseGps={requestLocation}
        onSelectLocation={setManualLocation}
      />
    </>
  );
}
