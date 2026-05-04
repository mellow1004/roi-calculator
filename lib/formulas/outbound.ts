import type { OutboundInputs, OutboundResults } from "@/types/calculator";

const COST_PER_MEETING = 440;

/**
 * Calculates outbound performance metrics from user inputs.
 *
 * Formula steps:
 * 1) monthlySpend = targetMeetingsPerMonth * 440
 * 2) newClientsPerMonth = targetMeetingsPerMonth * (closeRate / 100)
 * 3) cac = monthlySpend / newClientsPerMonth
 * 4) arr = averageMRR * 12
 * 5) ltv = arr * clientLifetimeYears
 * 6) roi = ltv / cac (rounded to 1 decimal place)
 * 7) cashFlowYear1Positive = arr >= cac
 */
export function calculateOutboundResults(inputs: OutboundInputs): OutboundResults {
  const monthlySpend = inputs.targetMeetingsPerMonth * COST_PER_MEETING;
  const newClientsPerMonth = inputs.targetMeetingsPerMonth * (inputs.closeRate / 100);
  const cac = newClientsPerMonth > 0 ? monthlySpend / newClientsPerMonth : 0;
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
export function getRoiLabel(roi: number): "strong" | "good" | "low" | "negative" {
  if (roi >= 10) {
    return "strong";
  }
  if (roi >= 4) {
    return "good";
  }
  if (roi >= 1) {
    return "low";
  }
  return "negative";
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
