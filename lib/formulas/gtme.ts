import type { GTMEInputs, GTMEResults } from "@/types/calculator";

/**
 * Calculates GTM Engineering outcomes from campaign assumptions.
 *
 * Formula steps:
 * 1) opportunities = expectedLeadVolume * (leadToOpportunityRate / 100)
 * 2) newCustomers = opportunities * (opportunityToCustomerRate / 100), rounded
 * 3) projectedRevenue = newCustomers * averageDealSize
 * 4) lifetimeRevenue = projectedRevenue * clvMultiplier
 * 5) costPerLead = totalBudget / expectedLeadVolume
 * 6) costPerAcquisition = totalBudget / newCustomers
 * 7) roi = ((projectedRevenue - totalBudget) / totalBudget) * 100, rounded
 * 8) lifetimeRoi = ((lifetimeRevenue - totalBudget) / totalBudget) * 100, rounded
 */
export function calculateGTMEResults(inputs: GTMEInputs): GTMEResults {
  const opportunities = inputs.expectedLeadVolume * (inputs.leadToOpportunityRate / 100);
  const newCustomers = Math.round(opportunities * (inputs.opportunityToCustomerRate / 100));
  const projectedRevenue = newCustomers * inputs.averageDealSize;
  const lifetimeRevenue = projectedRevenue * inputs.clvMultiplier;
  const costPerLead =
    inputs.expectedLeadVolume > 0 ? inputs.totalBudget / inputs.expectedLeadVolume : 0;
  const costPerAcquisition = newCustomers > 0 ? inputs.totalBudget / newCustomers : 0;
  const roi =
    inputs.totalBudget > 0
      ? Math.round(((projectedRevenue - inputs.totalBudget) / inputs.totalBudget) * 100)
      : 0;
  const lifetimeRoi =
    inputs.totalBudget > 0
      ? Math.round(((lifetimeRevenue - inputs.totalBudget) / inputs.totalBudget) * 100)
      : 0;

  return {
    newCustomers,
    projectedRevenue,
    lifetimeRevenue,
    costPerLead,
    costPerAcquisition,
    roi,
    lifetimeRoi,
  };
}

/**
 * Buckets GTME ROI percentage into qualitative labels.
 */
export function getGTMERoiLabel(roi: number): "High ROI" | "Good ROI" | "Low ROI" | "Negative ROI" {
  if (roi >= 300) {
    return "High ROI";
  }
  if (roi >= 100) {
    return "Good ROI";
  }
  if (roi >= 0) {
    return "Low ROI";
  }
  return "Negative ROI";
}
