import type { Currency } from "@/types/calculator";

export const exchangeRates: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  SEK: 11.5,
};

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = exchangeRates[fromCurrency as Currency] ?? 1;
  const toRate = exchangeRates[toCurrency as Currency] ?? 1;
  return Math.round((amount / fromRate) * toRate);
}
