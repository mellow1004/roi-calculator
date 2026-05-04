import type { Currency } from "@/types/calculator";

const CURRENCY_PREFIX: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  SEK: "kr",
};

/**
 * Formats amounts with the symbol before the number and comma thousands separators (en-US).
 * Example: €25,000
 */
export function formatCurrency(value: number, currency: Currency): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const rounded = Math.round(value);
  const withSeparators = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  const prefix = CURRENCY_PREFIX[currency];
  return `${prefix}${withSeparators}`;
}
