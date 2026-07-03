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
  totalBudget: number;
  averageNewClientROI: number;
}

export interface EventResults {
  signups: number;
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
  setupFee: 1250,
  postCallCost: 35,
};

const physicalBase = {
  attendanceRate: 0.6,
  reachRate: 0.75,
  opportunityRate: 0.24,
  closeRate: 0.24,
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

const hoursPerSignup: Record<IndustryVertical, number> = {
  "general-b2b": 7,
  "saas-tech": 6,
  "professional-services": 7,
  "finance-insurance": 9,
  "healthcare-pharma": 10,
  "manufacturing-industrial-retail": 8,
  other: 7,
};

export const EVENT_HOURLY_RATE_EUR = 60;
export const EVENT_SETUP_FEE_EUR = 1250;
export const eventHoursPerSignup = hoursPerSignup;

const HOURLY_RATE_EUR = EVENT_HOURLY_RATE_EUR;

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

export function getEventHourlyRate(currency: EventInputs["currency"]): number {
  return HOURLY_RATE_EUR * eventExchangeRates[currency];
}

export function getEventSetupFee(currency: EventInputs["currency"]): number {
  return webinarBase.setupFee * eventExchangeRates[currency];
}

export function getEventCostPerSignup(
  industryVertical: IndustryVertical,
  currency: EventInputs["currency"]
): number {
  return Math.round(getEventHourlyRate(currency) * hoursPerSignup[industryVertical]);
}

/** Minimum total budget for at least 25 sign-ups (setup fee + 25 × cost per sign-up). */
export function getEventMinBudget(
  industryVertical: IndustryVertical,
  currency: EventInputs["currency"]
): number {
  const setupFee = getEventSetupFee(currency);
  const costPerSignup = getEventCostPerSignup(industryVertical, currency);
  return Math.round(setupFee + costPerSignup * 25);
}

function roundWhole(value: number): number {
  return Math.round(value);
}

function roundClients(value: number): number {
  return Math.round(value * 10) / 10;
}

function walkFunnelRounded(
  signups: number,
  rates: {
    attendanceRate: number;
    reachRate: number;
    opportunityRate: number;
    closeRate: number;
  }
): {
  signups: number;
  attendees: number;
  reached: number;
  opportunities: number;
  clients: number;
} {
  const signupsForFunnel = Math.floor(signups);
  const attendees = Math.round(signupsForFunnel * rates.attendanceRate);
  const reached = Math.round(attendees * rates.reachRate);
  const opportunities = Math.round(reached * rates.opportunityRate);
  const clients = roundClients(opportunities * rates.closeRate);

  return { signups: signupsForFunnel, attendees, reached, opportunities, clients };
}

function signupsFromBudget(
  recruitmentBudget: number,
  costPerSignup: number
): number {
  if (costPerSignup <= 0 || recruitmentBudget <= 0) {
    return 0;
  }
  return recruitmentBudget / costPerSignup;
}

export type EventRoiLabel = "Strong return" | "Good return" | "Break-even" | "Below break-even";

/** Classifies event ROI from net return relative to total campaign cost. */
export function getEventRoiLabel(netReturn: number, campaignCost: number): EventRoiLabel {
  if (campaignCost <= 0) {
    return netReturn >= 0 ? "Good return" : "Below break-even";
  }
  if (netReturn >= campaignCost) {
    return "Strong return";
  }
  if (netReturn >= 0) {
    return "Good return";
  }
  if (netReturn >= -campaignCost * 0.2) {
    return "Break-even";
  }
  return "Below break-even";
}

/** Formats the ROI line shown in event calculator summaries. */
export function formatEventRoiSummary(results: {
  netReturn: number;
  campaignCost: number;
  roiMultiplier: number;
  roiPercentage: number;
}): string {
  const label = getEventRoiLabel(results.netReturn, results.campaignCost);

  if (label === "Below break-even") {
    return `Below break-even · −${Math.abs(results.roiPercentage)}%`;
  }

  if (label === "Break-even") {
    return `Break-even · ${results.roiPercentage}%`;
  }

  return `${results.roiMultiplier}× · ${results.roiPercentage}%`;
}

export function isEventLossMaking(netReturn: number): boolean {
  return netReturn < 0;
}

function logEventCalculationBreakdown(
  inputs: EventInputs,
  breakdown: Record<string, unknown>
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.log("[Event ROI] calculation breakdown", {
    inputs,
    ...breakdown,
  });
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
  const funnelRates = {
    attendanceRate: Math.min(base.attendanceRate * multiplier.attendance, 1),
    reachRate: Math.min(base.reachRate * multiplier.reach, 1),
    opportunityRate: Math.min(base.opportunityRate * multiplier.opportunity, 1),
    closeRate: Math.min(base.closeRate * multiplier.close, 1),
  };

  /** Step 4 — Convert EUR-based fixed costs and hourly rate to the selected currency. */
  const currencyRate = eventExchangeRates[inputs.currency];
  const setupFee = base.setupFee * currencyRate;
  const postCallCost = base.postCallCost * currencyRate;
  const hourlyRate = HOURLY_RATE_EUR * currencyRate;
  const costPerSignup = hourlyRate * hoursPerSignup[inputs.industryVertical];
  const campaignCost = inputs.totalBudget;

  let signupsRaw = 0;
  let postEventCost = 0;
  let funnel = walkFunnelRounded(0, funnelRates);

  if (inputs.campaignService === "pre-only") {
    /** Step 5a — Pre-event only: signups derived from total budget minus setup fee. */
    signupsRaw = signupsFromBudget(inputs.totalBudget - setupFee, costPerSignup);
    postEventCost = 0;
    funnel = walkFunnelRounded(signupsRaw, funnelRates);
  } else {
    /** Step 5b — Pre + post: reserve post-event calling from an estimated funnel walk. */
    const estimatedSignups = signupsFromBudget(inputs.totalBudget - setupFee, costPerSignup);
    const estimatedFunnel = walkFunnelRounded(estimatedSignups, funnelRates);
    const reservedPostEventCost = estimatedFunnel.reached * postCallCost;
    signupsRaw = signupsFromBudget(
      inputs.totalBudget - setupFee - reservedPostEventCost,
      costPerSignup
    );
    funnel = walkFunnelRounded(signupsRaw, funnelRates);
    postEventCost = funnel.reached * postCallCost;
  }

  const { signups, attendees, reached, opportunities, clients } = funnel;

  /** Step 6 — Pre-event spend is total budget minus post-event calling. */
  const preEventCost = campaignCost - postEventCost;

  /** Step 7 — Revenue equals full client value (no gross margin haircut). */
  const revenue = clients * inputs.averageNewClientROI;
  const grossProfit = revenue;

  /** Step 8 — Headline ROI metrics (net return, multiplier, percentage, break-even). */
  const netReturn = revenue - campaignCost;
  const roiLabel = getEventRoiLabel(netReturn, campaignCost);
  const roiMultiplier =
    netReturn >= 0 && campaignCost > 0
      ? Math.round((1 + netReturn / campaignCost) * 10) / 10
      : 0;
  const roiPercentage =
    campaignCost > 0 ? Math.round((netReturn / campaignCost) * 100) : 0;
  const isBreakEven = netReturn >= 0;

  /** Step 9 — Sales efficiency metrics. */
  const costPerNewClient = clients > 0 ? campaignCost / clients : 0;
  const revenueMultiple = campaignCost > 0 ? revenue / campaignCost : 0;

  logEventCalculationBreakdown(inputs, {
    campaignService: inputs.campaignService,
    funnelRates,
    setupFee,
    hourlyRate,
    costPerSignup,
    signupsRaw,
    signups,
    attendees,
    reached,
    opportunities,
    clients,
    postEventCost,
    preEventCost,
    revenue,
    grossProfit,
    netReturn,
    roiLabel,
    roiMultiplier,
    roiPercentage,
    isBreakEven,
  });

  return {
    signups,
    attendees,
    reached,
    opportunities,
    clients,
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
