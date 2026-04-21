const PAISE_PER_RUPEE = 100;
const DECIMAL_TOLERANCE = 1e-9;

export function hasAtMostTwoDecimalPlaces(amount: number): boolean {
  if (!Number.isFinite(amount)) {
    return false;
  }

  const paise = Math.round(amount * PAISE_PER_RUPEE);
  return Math.abs(amount - paise / PAISE_PER_RUPEE) < DECIMAL_TOLERANCE;
}

export function toPaise(amount: number): number {
  return Math.round(amount * PAISE_PER_RUPEE);
}
