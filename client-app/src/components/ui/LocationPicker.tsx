import { useEffect, useRef, useState } from 'react';
import { FiX, FiMapPin, FiNavigation, FiSearch, FiLoader } from 'react-icons/fi';
import type { LocationStatus } from '../../hooks/useGpsLocation';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

function formatResult(r: SearchResult): { title: string; subtitle: string } {
  const a = r.address;
  const title =
    a.neighbourhood ?? a.suburb ?? a.village ?? a.town ?? a.city ?? r.display_name.split(',')[0];
  const parts: string[] = [];
  if (a.city ?? a.county) parts.push((a.city ?? a.county)!);
  if (a.state) parts.push(a.state);
  return { title, subtitle: parts.join(', ') };
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  gpsStatus: LocationStatus;
  onUseGps: () => void;
  onSelectLocation: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({
  isOpen,
  onClose,
  gpsStatus,
  onUseGps,
  onSelectLocation,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced Nominatim search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } },
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (r: SearchResult) => {
    const { title, subtitle } = formatResult(r);
    const address = subtitle ? `${title}, ${subtitle}` : title;
    onSelectLocation(parseFloat(r.lat), parseFloat(r.lon), address);
    onClose();
  };

  const handleGps = () => {
    onUseGps();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto flex flex-col"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-bold text-gray-900">Select location</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 pb-3">
          <div className="relative">
            <FiSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            {searching && (
              <FiLoader
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for area, street name..."
              className="w-full pl-9 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* GPS button */}
        <div className="px-5 pb-3">
          <button
            onClick={handleGps}
            disabled={gpsStatus === 'loading'}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 font-medium text-sm transition-colors active:bg-orange-100 disabled:opacity-60"
          >
            {gpsStatus === 'loading' ? (
              <FiLoader size={18} className="animate-spin shrink-0" />
            ) : (
              <FiNavigation size={18} className="shrink-0" />
            )}
            <div className="text-left">
              <p className="font-semibold text-orange-600">Use current location</p>
              <p className="text-xs text-orange-400 font-normal">Using GPS</p>
            </div>
          </button>
        </div>

        {/* Divider */}
        {results.length === 0 && query.length < 3 && (
          <div className="flex items-center gap-3 px-5 pb-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or search for location</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((r) => {
                const { title, subtitle } = formatResult(r);
                return (
                  <li key={r.place_id}>
                    <button
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-start gap-3 px-3 py-3.5 rounded-2xl text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <FiMapPin size={14} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
                        {subtitle && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.length >= 3 && !searching ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-sm text-gray-400">No locations found for "{query}"</p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
