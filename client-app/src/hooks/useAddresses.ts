import { useCallback, useEffect, useState } from 'react';
import { AddressService } from '../services/address.service';
import {
  getAddresses,
  saveAddress,
  deleteAddress as deleteFromCache,
  setCachedAddresses,
  type StoredAddress,
} from '../lib/addressStore';
import { useAuth } from './useAuth';

const addressService = new AddressService();

export function useAddresses() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (token) {
      try {
        const data = await addressService.list(token);
        setCachedAddresses(data);
        setAddresses(data);
      } catch {
        // fall back to local cache if API fails
        setAddresses(getAddresses());
      }
    } else {
      setAddresses(getAddresses());
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addAddress = useCallback(
    async (data: Omit<StoredAddress, 'id'>): Promise<StoredAddress> => {
      if (token) {
        const created = await addressService.create(token, data);
        saveAddress(created);
        setAddresses(getAddresses());
        return created;
      } else {
        const entry: StoredAddress = { id: crypto.randomUUID(), ...data };
        saveAddress(entry);
        setAddresses(getAddresses());
        return entry;
      }
    },
    [token],
  );

  const editAddress = useCallback(
    async (id: string, data: Partial<Omit<StoredAddress, 'id'>>): Promise<StoredAddress> => {
      if (token) {
        const updated = await addressService.update(token, id, data);
        saveAddress(updated);
        setAddresses(getAddresses());
        return updated;
      } else {
        const existing = getAddresses().find((a) => a.id === id);
        if (!existing) throw new Error('Address not found');
        const updated = { ...existing, ...data };
        saveAddress(updated);
        setAddresses(getAddresses());
        return updated;
      }
    },
    [token],
  );

  const removeAddress = useCallback(
    async (id: string): Promise<void> => {
      if (token) {
        await addressService.remove(token, id);
      }
      deleteFromCache(id);
      setAddresses(getAddresses());
    },
    [token],
  );

  return { addresses, loading, addAddress, editAddress, removeAddress };
}
