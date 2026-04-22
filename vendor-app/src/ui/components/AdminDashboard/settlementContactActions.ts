export function hasSettlementPhoneNumber(phone: string | null): phone is string {
  return typeof phone === 'string' && phone.trim().length > 0;
}

function normalizeDialerPhone(phone: string): string {
  return phone.replace(/\s+/g, '');
}

function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\D+/g, '');
}

export function buildSettlementDialerHref(phone: string): string {
  return `tel:${normalizeDialerPhone(phone)}`;
}

export function buildSettlementWhatsAppHref(phone: string): string {
  return `https://wa.me/${normalizeWhatsAppPhone(phone)}`;
}

export function openSettlementDialer(phone: string | null): void {
  if (!hasSettlementPhoneNumber(phone)) {
    return;
  }

  window.location.href = buildSettlementDialerHref(phone);
}

export function openSettlementWhatsApp(phone: string | null): void {
  if (!hasSettlementPhoneNumber(phone)) {
    return;
  }

  window.open(buildSettlementWhatsAppHref(phone), '_blank', 'noopener,noreferrer');
}
