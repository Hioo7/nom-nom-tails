import { useState, useCallback, useEffect } from 'react';
import { AddressService } from '../services/address.service';

export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

export interface GpsLocation {
  lat: number;
  lng: number;
  address: string;
}

const LOCATION_KEY = 'nom_nom_location';
const addressService = new AddressService();

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    { headers: { 'Accept-Language': 'en' } },
  );
  if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const data = await res.json();
  const a = data.address ?? {};
  const parts: string[] = [];
  if (a.neighbourhood || a.suburb || a.village || a.town) {
    parts.push(a.neighbourhood ?? a.suburb ?? a.village ?? a.town);
  }
  if (a.city || a.county || a.state_district) {
    parts.push(a.city ?? a.county ?? a.state_district);
  }
  return parts.length > 0 ? parts.join(', ') : (data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
}

function readFromStorage(): GpsLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? (JSON.parse(raw) as GpsLocation) : null;
  } catch {
    return null;
  }
}

function saveToStorage(loc: GpsLocation) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
}

export function useGpsLocation(token: string | null) {
  const [status, setStatus] = useState<LocationStatus>(() =>
    readFromStorage() ? 'granted' : 'idle',
  );
  const [location, setLocation] = useState<GpsLocation | null>(() => readFromStorage());
  const [error, setError] = useState<string | null>(null);

  // On login: restore from DB if localStorage is empty
  useEffect(() => {
    if (!token || location) return;
    addressService.getCurrentLocation(token).then((loc) => {
      if (loc && loc.lat && loc.lng) {
        const gps: GpsLocation = { lat: loc.lat, lng: loc.lng, address: loc.displayName };
        setLocation(gps);
        setStatus('granted');
        saveToStorage(gps);
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const _persist = useCallback(
    (loc: GpsLocation) => {
      setLocation(loc);
      setStatus('granted');
      saveToStorage(loc);
      // Save to address table in DB (non-blocking)
      if (token) {
        addressService
          .upsertCurrentLocation(token, loc.lat, loc.lng, loc.address)
          .catch(() => {});
      }
    },
    [token],
  );

  const requestLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const address = await reverseGeocode(lat, lng);
          _persist({ lat, lng, address });
        } catch {
          _persist({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location access denied.');
        } else {
          setStatus('unavailable');
          setError('Unable to fetch location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [_persist]);

  const setManualLocation = useCallback(
    (lat: number, lng: number, address: string) => {
      _persist({ lat, lng, address });
    },
    [_persist],
  );

  return { status, location, error, requestLocation, setManualLocation };
}
