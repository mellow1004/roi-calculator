export type EventFormat = "webinar" | "physical";

export type CampaignService = "pre-only" | "pre-post";

export type IndustryVertical =
  | "general-b2b"
  | "saas-tech"
  | "professional-services"
  | "finance-insurance"
  | "healthcare-pharma"
  | "manufacturing-industrial-retail"
  | "other";

export interface EventInputs {
  eventFormat: EventFormat;
  industryVertical: IndustryVertical;
  campaignService: CampaignService;
  currency: "EUR" | "USD" | "GBP" | "SEK" | "NOK" | "DKK";
  signupTarget: number;
  budgetPerSignup: number;
  averageNewClientROI: number;
}

export interface EventResults {
  attendees: number;
  reached: number;
  opportunities: number;
  clients: number;
  preEventCost: number;
  postEventCost: number;
  campaignCost: number;
  revenue: number;
  grossProfit: number;
  netReturn: number;
  roiMultiplier: number;
  roiPercentage: number;
  costPerSignup: number;
  costPerNewClient: number;
  revenueMultiple: number;
  isBreakEven: boolean;
}

const webinarBase = {
  attendanceRate: 0.6,
  reachRate: 0.65,
  opportunityRate: 0.18,
  closeRate: 0.2,
  grossMargin: 0.7,
  setupFee: 1250,
  postCallCost: 35,
};

const physicalBase = {
  attendanceRate: 0.6,
  reachRate: 0.75,
  opportunityRate: 0.24,
  closeRate: 0.24,
  grossMargin: 0.7,
  setupFee: 1250,
  postCallCost: 35,
};

const preOnlyOverrides = {
  reachRate: 0.38,
  opportunityRate: 0.11,
  closeRate: 0.18,
  postCallCost: 0,
};

const industryMultipliers: Record<
  IndustryVertical,
  { attendance: number; reach: number; opportunity: number; close: number }
> = {
  "general-b2b": { attendance: 1.0, reach: 1.0, opportunity: 1.0, close: 1.0 },
  "saas-tech": { attendance: 0.98, reach: 1.0, opportunity: 1.08, close: 1.0 },
  "professional-services": { attendance: 1.04, reach: 1.04, opportunity: 1.05, close: 1.08 },
  "finance-insurance": { attendance: 0.96, reach: 0.95, opportunity: 0.92, close: 0.9 },
  "healthcare-pharma": { attendance: 0.94, reach: 0.92, opportunity: 0.9, close: 0.88 },
  "manufacturing-industrial-retail": { attendance: 1.05, reach: 1.03, opportunity: 1.0, close: 0.96 },
  other: { attendance: 1.0, reach: 1.0, opportunity: 1.0, close: 1.0 },
};

export const eventExchangeRates: Record<EventInputs["currency"], number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  SEK: 11.5,
  NOK: 11.8,
  DKK: 7.45,
};

/** Converts a monetary amount between event calculator currencies (EUR base). */
export function convertEventAmount(
  amount: number,
  fromCurrency: EventInputs["currency"],
  toCurrency: EventInputs["currency"]
): number {
  const fromRate = eventExchangeRates[fromCurrency] ?? 1;
  const toRate = eventExchangeRates[toCurrency] ?? 1;
  return Math.round((amount / fromRate) * toRate);
}

function roundWhole(value: number): number {
  return Math.round(value);
}

/**
 * Calculates event lead-generation ROI from campaign inputs and funnel assumptions.
 */
export function calculateEventResults(inputs: EventInputs): EventResults {
  /** Step 1 — Select base assumptions by event format. */
  const base = inputs.eventFormat === "webinar" ? { ...webinarBase } : { ...physicalBase };

  /** Step 2 — Apply pre-event-only overrides when campaign is pre-only. */
  if (inputs.campaignService === "pre-only") {
    base.reachRate = preOnlyOverrides.reachRate;
    base.opportunityRate = preOnlyOverrides.opportunityRate;
    base.closeRate = preOnlyOverrides.closeRate;
    base.postCallCost = preOnlyOverrides.postCallCost;
  }

  /** Step 3 — Apply industry multipliers, capping each rate at 100%. */
  const multiplier = industryMultipliers[inputs.industryVertical];
  const attendanceRate = Math.min(base.attendanceRate * multiplier.attendance, 1);
  const reachRate = Math.min(base.reachRate * multiplier.reach, 1);
  const opportunityRate = Math.min(base.opportunityRate * multiplier.opportunity, 1);
  const closeRate = Math.min(base.closeRate * multiplier.close, 1);
  const grossMargin = base.grossMargin;

  /** Step 4 — Convert EUR-based fixed costs to the selected currency. */
  const currencyRate = eventExchangeRates[inputs.currency];
  const setupFee = base.setupFee * currencyRate;
  const postCallCost = base.postCallCost * currencyRate;

  /** Step 5 — Walk down the funnel from signups to clients. */
  const attendees = inputs.signupTarget * attendanceRate;
  const reached = attendees * reachRate;
  const opportunities = reached * opportunityRate;
  const clients = opportunities * closeRate;

  /** Step 6 — Compute pre-event, post-event, and total campaign cost. */
  const preEventCost = inputs.signupTarget * inputs.budgetPerSignup + setupFee;
  const postEventCost =
    inputs.campaignService === "pre-post" ? reached * postCallCost : 0;
  const campaignCost = preEventCost + postEventCost;

  /** Step 7 — Revenue and gross profit from closed clients. */
  const revenue = clients * inputs.averageNewClientROI;
  const grossProfit = revenue * grossMargin;

  /** Step 8 — Headline ROI metrics (net return, multiplier, percentage, break-even). */
  const netReturn = grossProfit - campaignCost;
  const roiMultiplier =
    campaignCost > 0
      ? Math.round((1 + netReturn / campaignCost) * 10) / 10
      : 0;
  const roiPercentage =
    campaignCost > 0 ? Math.round((netReturn / campaignCost) * 100) : 0;
  const isBreakEven = netReturn >= 0;

  /** Step 9 — Sales efficiency metrics (cost per signup/client, revenue multiple). */
  const costPerSignup =
    inputs.signupTarget > 0 ? campaignCost / inputs.signupTarget : 0;
  const costPerNewClient = clients > 0 ? campaignCost / clients : 0;
  const revenueMultiple = campaignCost > 0 ? revenue / campaignCost : 0;

  return {
    attendees: roundWhole(attendees),
    reached: roundWhole(reached),
    opportunities: roundWhole(opportunities),
    clients: roundWhole(clients),
    preEventCost: roundWhole(preEventCost),
    postEventCost: roundWhole(postEventCost),
    campaignCost: roundWhole(campaignCost),
    revenue: roundWhole(revenue),
    grossProfit: roundWhole(grossProfit),
    netReturn: roundWhole(netReturn),
    roiMultiplier,
    roiPercentage,
    costPerSignup: roundWhole(costPerSignup),
    costPerNewClient: roundWhole(costPerNewClient),
    revenueMultiple: roundWhole(revenueMultiple),
    isBreakEven,
  };
}
