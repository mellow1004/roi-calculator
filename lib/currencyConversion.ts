import type { Currency } from "@/types/calculator";

/** All currencies used across calculators (includes event-only NOK/DKK). */
export type ExchangeRateCurrency = Currency | "NOK" | "DKK";

// Brightvision internal rates — valid 2026-07-01 to 2026-10-31
// EUR: 10.7 SEK, USD: 9.3 SEK (source: Brightvision Sales Currency Rate)
// Update every 2 months per company policy
export const exchangeRates: Record<ExchangeRateCurrency, number> = {
  EUR: 1,
  USD: 0.8692,
  GBP: 0.86,
  SEK: 10.7,
  NOK: 11.8,
  DKK: 7.45,
};

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = exchangeRates[fromCurrency as ExchangeRateCurrency] ?? 1;
  const toRate = exchangeRates[toCurrency as ExchangeRateCurrency] ?? 1;
  return Math.round((amount / fromRate) * toRate);
}
