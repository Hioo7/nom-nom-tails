const KEY = 'nom_nom_addresses';

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface StoredAddress {
  id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
  lat?: number | null;
  lng?: number | null;
}

export function getAddresses(): StoredAddress[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoredAddress[];
  } catch {
    // ignore
  }
  return [];
}

export function saveAddress(address: StoredAddress): void {
  const list = getAddresses();
  const idx = list.findIndex((a) => a.id === address.id);
  if (idx >= 0) {
    list[idx] = address;
  } else {
    list.push(address);
  }
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteAddress(id: string): void {
  const list = getAddresses().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function setCachedAddresses(addresses: StoredAddress[]): void {
  localStorage.setItem(KEY, JSON.stringify(addresses));
}

export function formatAddress(a: StoredAddress): string {
  return [a.line1, a.line2, a.city, a.state, a.pin].filter(Boolean).join(', ');
}

export function formatFullAddress(a: StoredAddress): string {
  return `${a.fullName}, ${a.phone}, ${formatAddress(a)}`;
}
