import type { EventInputs } from "@/lib/formulas/event";
import type { Currency } from "@/types/calculator";

export type EventCurrency = EventInputs["currency"];

const CURRENCY_PREFIX: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  SEK: "kr",
};

const EVENT_CURRENCY_PREFIX: Record<EventCurrency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
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

/** Formats event calculator amounts (includes NOK and DKK). */
export function formatEventCurrency(value: number, currency: EventCurrency): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const rounded = Math.round(value);
  const withSeparators = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  const prefix = EVENT_CURRENCY_PREFIX[currency];
  return `${prefix}${withSeparators}`;
}
