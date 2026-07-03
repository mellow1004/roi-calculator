/**
 * Glossary strings for calculator ⓘ tooltips. Keys are referenced across steps.
 */
export const tooltips = {
  MRR: "Monthly Recurring Revenue — the total predictable revenue your business earns each month from active subscriptions.",

  ARR: "Annual Recurring Revenue — your MRR multiplied by 12. The standard way to measure the size of a subscription business.",

  LTV: "Lifetime Value — the total revenue expected from an average customer over their entire time with you. Calculated as ARR × average client lifetime.",

  CAC: "Customer Acquisition Cost — the total cost to win one new customer. Calculated as your monthly spend divided by new clients per month.",

  ROI: "Return on Investment — how much you get back relative to what you put in. A 4x ROI means every €1 spent returns €4 in lifetime value.",

  CLV: "Customer Lifetime Value — the long-term revenue a customer generates, factoring in retention and upsells. Used to stress-test different growth scenarios.",

  MEETINGS:
    "The number of qualified sales meetings you want Brightvision to book for you each month.",

  CLOSE_RATE:
    "The percentage of meetings you expect to convert into paying clients. Industry average is typically 10–20%.",

  MONTHLY_SPEND: "Your estimated monthly investment based on your target number of booked meetings.",

  NEW_CLIENTS:
    "The number of new clients you can expect per month, calculated as meetings × close rate.",

  TOTAL_BUDGET: "Your total investment for the entire campaign duration.",

  MONTHLY_COST: "Your total budget divided by the campaign duration — what you spend per month.",

  DEAL_SIZE: "The average revenue you earn per new customer won.",

  LEAD_VOLUME: "The total number of leads you expect your campaign to generate.",

  LEAD_TO_OPP: "The percentage of leads that become qualified sales opportunities.",

  OPP_TO_CUSTOMER: "The percentage of opportunities that convert into paying customers.",

  RETENTION:
    "The percentage of customers who continue after their initial contract. Higher retention dramatically increases lifetime value.",

  CLV_MULTIPLIER:
    "A multiplier applied to projected revenue to estimate long-term customer value including renewals and upsells.",

  COST_PER_LEAD:
    "How much each generated lead costs. Calculated as total budget ÷ expected lead volume.",

  COST_PER_ACQ: "How much it costs to win one new customer. Calculated as total budget ÷ new customers.",

  LIFETIME_REVENUE: "Total revenue across all customers over their full lifetime with you.",

  LIFETIME_ROI:
    "Your ROI calculated over the full customer lifetime rather than just the campaign period.",

  /** Used where tiles show campaign-level projected revenue (complements ARR / deal-size fields). */
  PROJECTED_REVENUE:
    "Estimated revenue from new customers won during this campaign, based on your budget, funnel, and deal-size inputs.",

  EVENT_FORMAT:
    "Webinars typically have lower reach-to-opportunity rates than physical events, but lower logistics cost.",

  INDUSTRY_VERTICAL:
    "Industry benchmarks adjust attendance, reach, opportunity, and close rates to reflect your market.",

  CAMPAIGN_SERVICE:
    "Pre + Post-event covers sign-up recruitment and follow-up calling after the event. Pre-event only covers recruitment — no post-event outreach.",

  EVENT_TOTAL_BUDGET:
    "Your total campaign investment with Brightvision, including recruitment, setup, and post-event calling where applicable.",

  EVENT_AVERAGE_CLIENT_ROI:
    "The full revenue value of one new client won through this event campaign.",

  EVENT_NET_RETURN:
    "Revenue from new clients minus total campaign cost. Positive means the campaign pays back.",

  EVENT_CAMPAIGN_COST:
    "Your total campaign budget, including setup, sign-up recruitment, and post-event calling where applicable.",
} as const;

export type TooltipKey = keyof typeof tooltips;
