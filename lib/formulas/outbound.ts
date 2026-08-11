import type { OutboundInputs, OutboundResults } from "@/types/calculator";
import { exchangeRates } from "@/lib/currencyConversion";

const COST_PER_MEETING = 600;

export function getCostPerMeetingForCurrency(currency: OutboundInputs["currency"]): number {
  return Math.round(COST_PER_MEETING * exchangeRates[currency]);
}

/**
 * Calculates outbound performance metrics from user inputs.
 *
 * Formula steps:
 * 1) monthlySpend = targetMeetingsPerMonth * costPerMeeting
 * 2) newClientsPerMonth = targetMeetingsPerMonth * (closeRate / 100)
 * 3) For AE as a Service, acquisition cost uses 2× monthly spend
 * 4) cac = effectiveCost / newClientsPerMonth
 * 5) arr = averageMRR * 12
 * 6) ltv = arr * clientLifetimeYears
 * 7) roi = ltv / cac (rounded to 1 decimal place)
 * 8) cashFlowYear1Positive = arr >= cac
 */
export function calculateOutboundResults(
  inputs: OutboundInputs,
  costPerMeeting = COST_PER_MEETING,
  isAEService = false
): OutboundResults {
  const monthlySpend = inputs.targetMeetingsPerMonth * costPerMeeting;
  const newClientsPerMonth = inputs.targetMeetingsPerMonth * (inputs.closeRate / 100);
  const effectiveCost = isAEService ? monthlySpend * 2 : monthlySpend;
  const cac = newClientsPerMonth > 0 ? effectiveCost / newClientsPerMonth : 0;
  const arr = inputs.averageMRR * 12;
  const ltv = arr * inputs.clientLifetimeYears;
  const rawRoi = cac > 0 ? ltv / cac : 0;
  const roi = Math.round(rawRoi * 10) / 10;
  const cashFlowYear1Positive = arr >= cac;

  return {
    newClientsPerMonth,
    monthlySpend,
    cac,
    arr,
    ltv,
    roi,
    cashFlowYear1Positive,
  };
}

/**
 * Buckets ROI multiplier into qualitative labels.
 */
export function getRoiLabel(
  roi: number
): "Strong" | "Good" | "Low" | "Break-even" | "Negative" {
  if (roi >= 15) {
    return "Strong";
  }
  if (roi >= 10) {
    return "Good";
  }
  if (roi >= 4) {
    return "Low";
  }
  if (roi >= 1) {
    return "Break-even";
  }
  return "Negative";
}

/** Tailwind classes for the outbound ROI qualitative badge (matches `getRoiLabel`). */
export function outboundRoiLabelBadgeClassName(
  label: ReturnType<typeof getRoiLabel>
): string {
  switch (label) {
    case "Strong":
      return "bg-[#0F3D24] text-white";
    case "Good":
      return "bg-[#15803d] text-white";
    case "Low":
      return "bg-amber-300 text-neutral-900";
    case "Break-even":
      return "bg-orange-500 text-white";
    case "Negative":
      return "bg-red-600 text-white";
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
}

/**
 * Returns a year-1 cash flow warning when CAC is higher than ARR.
 */
export function getCashFlowWarning(
  cashFlowYear1Positive: boolean,
  cac: number,
  arr: number,
  currency: string
): string | null {
  // Keep parameters typed and available for future interpolated warnings.
  void cac;
  void arr;
  void currency;

  if (!cashFlowYear1Positive) {
    return "Heads up: your customer acquisition cost (CAC) exceeds your first-year revenue (ARR). This means negative cash flow in year 1 — make sure you have the runway to support it before the investment pays off.";
  }

  return null;
}
