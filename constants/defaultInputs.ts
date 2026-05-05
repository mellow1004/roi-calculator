import type { GTMEInputs, OutboundInputs } from "@/types/calculator";

export const defaultOutboundInputs: OutboundInputs = {
  targetMeetingsPerMonth: 10,
  closeRate: 15,
  averageMRR: 2000,
  clientLifetimeYears: 4,
  currency: "EUR",
  serviceModel: "retainer",
};

export const defaultGTMEInputs: GTMEInputs = {
  totalBudget: 25000,
  averageDealSize: 15000,
  durationMonths: 3,
  expectedLeadVolume: 500,
  leadToOpportunityRate: 10,
  opportunityToCustomerRate: 25,
  customerRetentionRate: 30,
  clvMultiplier: 2,
  currency: "EUR",
};
