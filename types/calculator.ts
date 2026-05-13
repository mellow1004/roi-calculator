export type ServiceCategory = "outbound" | "inbound";

export interface Service {
  id: string;
  name: string;
  sublabel?: string;
  description: string;
  category: ServiceCategory;
}

export type CalculatorStep =
  | "select-services"
  | "campaign-details"
  | "performance"
  | "your-details"
  | "confirmation"
  | "results";

export type Currency = "EUR" | "USD" | "GBP" | "SEK";

export type OutboundServiceModel = "retainer" | "campaign";

export interface OutboundInputs {
  targetMeetingsPerMonth: number;
  closeRate: number;
  averageMRR: number;
  clientLifetimeYears: number;
  currency: Currency;
  serviceModel: OutboundServiceModel;
}

export interface GTMEInputs {
  totalBudget: number;
  averageDealSize: number;
  durationMonths: 1 | 3 | 6 | 12;
  expectedLeadVolume: number;
  leadToOpportunityRate: number;
  opportunityToCustomerRate: number;
  customerRetentionRate: number;
  clvMultiplier: number;
  currency: Currency;
}

export interface OutboundResults {
  newClientsPerMonth: number;
  monthlySpend: number;
  cac: number;
  arr: number;
  ltv: number;
  roi: number;
  cashFlowYear1Positive: boolean;
}

export interface GTMEResults {
  newCustomers: number;
  projectedRevenue: number;
  lifetimeRevenue: number;
  costPerLead: number;
  costPerAcquisition: number;
  roi: number;
  lifetimeRoi: number;
}

export interface LeadDetails {
  fullName: string;
  companyName: string;
  workEmail: string;
  phoneNumber?: string;
  gdprConsent: boolean;
}

export interface CalculatorState {
  currentStep: CalculatorStep;
  selectedServices: string[];
  outboundInputs: OutboundInputs;
  gtmeInputs: GTMEInputs;
  leadDetails: LeadDetails;
  outboundResults: OutboundResults | null;
  gtmeResults: GTMEResults | null;
}
