export interface IPriceService {
  formatPaiseAmount(amount: number): string;
  formatPaiseInput(amount: number): string;
  parseRupeeInput(value: string): number | null;
  isValidRupeeInput(value: string): boolean;
}

const RUPEE_INPUT_PATTERN = /^\d+(?:\.\d{1,2})?$/;

function trimTrailingZeros(value: string): string {
  return value.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export class PriceService implements IPriceService {
  formatPaiseAmount(amount: number): string {
    return (amount / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  formatPaiseInput(amount: number): string {
    return trimTrailingZeros((amount / 100).toFixed(2));
  }

  parseRupeeInput(value: string): number | null {
    const normalized = value.trim().replace(/,/g, '');

    if (!RUPEE_INPUT_PATTERN.test(normalized)) {
      return null;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }

  isValidRupeeInput(value: string): boolean {
    return this.parseRupeeInput(value) !== null;
  }
}

export const priceService = new PriceService();
