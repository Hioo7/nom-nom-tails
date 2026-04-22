export function hasTaskPhoneNumber(phone: string | null): phone is string {
  return typeof phone === 'string' && phone.trim().length > 0;
}

export function buildDialerHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

export function openTaskDialer(phone: string | null): void {
  if (!hasTaskPhoneNumber(phone)) {
    return;
  }

  window.location.href = buildDialerHref(phone);
}
