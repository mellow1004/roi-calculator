"use client";

import { useState } from "react";
import { EventBenchmarkDisclaimer } from "@/components/calculator/EventBenchmarkDisclaimer";
import { LabelWithTooltip, InfoTooltipTrigger } from "@/components/calculator/Tooltip";
import { useCalculator } from "@/lib/calculatorStore";
import { formatEventCurrency } from "@/lib/formatCurrency";
import {
  calculateEventResults,
  convertEventAmount,
  eventHoursPerSignup,
  getEventHourlyRate,
  getEventMinBudget,
  type CampaignService,
  type EventFormat,
  type EventInputs,
  type IndustryVertical,
} from "@/lib/formulas/event";

const CURRENCIES: EventInputs["currency"][] = ["EUR", "USD", "GBP", "SEK", "NOK", "DKK"];

const EVENT_FORMAT_OPTIONS: Array<{ value: EventFormat; label: string }> = [
  { value: "webinar", label: "Webinar" },
  { value: "physical", label: "Physical event" },
];

const INDUSTRY_OPTIONS: Array<{ value: IndustryVertical; label: string }> = [
  { value: "general-b2b", label: "General B2B" },
  { value: "saas-tech", label: "SaaS / Technology" },
  { value: "professional-services", label: "Professional Services" },
  { value: "finance-insurance", label: "Finance / Insurance" },
  { value: "healthcare-pharma", label: "Healthcare / Pharma" },
  { value: "manufacturing-industrial-retail", label: "Manufacturing / Industrial / Retail" },
  { value: "other", label: "Other" },
];

const CAMPAIGN_SERVICE_OPTIONS: Array<{ value: CampaignService; label: string }> = [
  { value: "pre-post", label: "Pre + Post-event" },
  { value: "pre-only", label: "Pre-event only" },
];

function eventCurrencySymbol(currency: EventInputs["currency"]): string {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "SEK":
    case "NOK":
    case "DKK":
      return "kr";
    default:
      return "";
  }
}

function FunnelFlow({
  signups,
  attendees,
  opportunities,
  clients,
}: {
  signups: number;
  attendees: number;
  opportunities: number;
  clients: number;
}): React.JSX.Element {
  const stages = [
    { label: "Sign-ups", value: signups },
    { label: "Attendees", value: attendees },
    { label: "Opportunities", value: opportunities },
    { label: "New Clients", value: clients },
  ];

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
        Funnel
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-center">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex min-w-0 flex-1 items-center gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-white/45">
                {stage.label}
              </p>
              <p className="font-display mt-0.5 text-lg font-normal tabular-nums text-white">
                {Number.isInteger(stage.value)
                  ? stage.value.toLocaleString()
                  : (Math.round(stage.value * 100) / 100).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
              </p>
            </div>
            {index < stages.length - 1 ? (
              <span className="shrink-0 px-0.5 text-sm text-white/35" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StepCampaignDetailsEvent({
  hideNavigation = false,
}: {
  /** When true, footer navigation is omitted (e.g. combined flow uses one shared footer). */
  hideNavigation?: boolean;
}): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { eventInputs } = state;
  const [previousCurrency, setPreviousCurrency] = useState<EventInputs["currency"]>(
    eventInputs.currency
  );

  const results = calculateEventResults(eventInputs);
  const sym = eventCurrencySymbol(eventInputs.currency);
  const minBudget = getEventMinBudget(eventInputs.industryVertical, eventInputs.currency);
  const hourlyRate = getEventHourlyRate(eventInputs.currency);
  const industryLabel =
    INDUSTRY_OPTIONS.find((opt) => opt.value === eventInputs.industryVertical)?.label ??
    "Your industry";
  const industryHours = eventHoursPerSignup[eventInputs.industryVertical];

  const inputClass =
    "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[15px] text-[var(--color-text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 ease-out focus:border-[var(--color-accent)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]";

  const pillClass = (selected: boolean): string =>
    [
      "rounded-full border px-4 py-2 text-sm font-semibold calculator-interactive",
      selected
        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[#9CA3AF]",
    ].join(" ");

  const handleCurrencyChange = (newCurrency: EventInputs["currency"]): void => {
    if (newCurrency === eventInputs.currency) {
      return;
    }

    const nextMinBudget = getEventMinBudget(eventInputs.industryVertical, newCurrency);

    dispatch({
      type: "UPDATE_EVENT_INPUTS",
      payload: {
        currency: newCurrency,
        totalBudget: Math.max(
          nextMinBudget,
          convertEventAmount(eventInputs.totalBudget, previousCurrency, newCurrency)
        ),
        averageNewClientROI: convertEventAmount(
          eventInputs.averageNewClientROI,
          previousCurrency,
          newCurrency
        ),
      },
    });
    setPreviousCurrency(newCurrency);
  };

  const handleNext = (): void => {
    const computed = calculateEventResults(eventInputs);
    dispatch({
      type: "UPDATE_EVENT_INPUTS",
      payload: {
        eventFormat: eventInputs.eventFormat,
        industryVertical: eventInputs.industryVertical,
        campaignService: eventInputs.campaignService,
        currency: eventInputs.currency,
        totalBudget: eventInputs.totalBudget,
        averageNewClientROI: eventInputs.averageNewClientROI,
      },
    });
    dispatch({ type: "SET_EVENT_RESULTS", payload: computed });
    dispatch({ type: "SET_STEP", payload: "performance" });
  };

  return (
    <section className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Campaign details
            </h2>
            <p className="mb-6 mt-2 text-sm font-semibold text-[var(--color-accent)]">
              Configuring: Event Lead Generation
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              <LabelWithTooltip tooltipKey="EVENT_FORMAT">Event format</LabelWithTooltip>
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    dispatch({ type: "UPDATE_EVENT_INPUTS", payload: { eventFormat: opt.value } })
                  }
                  className={pillClass(eventInputs.eventFormat === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="event-industry"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              <LabelWithTooltip tooltipKey="INDUSTRY_VERTICAL">Industry vertical</LabelWithTooltip>
            </label>
            <select
              id="event-industry"
              value={eventInputs.industryVertical}
              onChange={(e) => {
                const industryVertical = e.target.value as IndustryVertical;
                const nextMinBudget = getEventMinBudget(industryVertical, eventInputs.currency);
                dispatch({
                  type: "UPDATE_EVENT_INPUTS",
                  payload: {
                    industryVertical,
                    totalBudget: Math.max(eventInputs.totalBudget, nextMinBudget),
                  },
                });
              }}
              className={inputClass}
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div
              className="mt-3 rounded-lg bg-[var(--color-green-subtle)] px-3.5 py-2.5 text-[13px] leading-snug text-[var(--color-text-primary)]"
            >
              Cost per sign-up is calculated automatically based on your industry. {industryLabel}{" "}
              campaigns typically require {industryHours} hours per sign-up at{" "}
              {formatEventCurrency(hourlyRate, eventInputs.currency)}/hr ={" "}
              {formatEventCurrency(results.costPerSignup, eventInputs.currency)}.
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              <LabelWithTooltip tooltipKey="CAMPAIGN_SERVICE">Campaign service</LabelWithTooltip>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {CAMPAIGN_SERVICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_EVENT_INPUTS",
                      payload: { campaignService: opt.value },
                    })
                  }
                  className={pillClass(eventInputs.campaignService === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-start gap-1 text-xs text-[var(--color-text-secondary)]">
              <InfoTooltipTrigger tooltipKey="CAMPAIGN_SERVICE" className="mt-0.5 shrink-0" />
              <span>
                Pre + Post-event includes recruitment and post-event calling. Pre-event only covers
                recruitment.
              </span>
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              Currency
            </label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCurrencyChange(c)}
                  className={pillClass(eventInputs.currency === c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="event-total-budget"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              <LabelWithTooltip tooltipKey="EVENT_TOTAL_BUDGET">Total campaign budget</LabelWithTooltip>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                {sym}
              </span>
              <input
                id="event-total-budget"
                type="number"
                min={minBudget}
                step={500}
                value={eventInputs.totalBudget || ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EVENT_INPUTS",
                    payload: {
                      totalBudget: Math.max(minBudget, Number(e.target.value) || minBudget),
                    },
                  })
                }
                className={`${inputClass} pl-10`}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Minimum budget for {industryLabel}:{" "}
              {formatEventCurrency(minBudget, eventInputs.currency)}
            </p>
          </div>

          <div>
            <label
              htmlFor="event-average-client-value"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              <LabelWithTooltip tooltipKey="EVENT_AVERAGE_CLIENT_ROI">
                Average new client value
              </LabelWithTooltip>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                {sym}
              </span>
              <input
                id="event-average-client-value"
                type="number"
                min={0}
                step={500}
                value={eventInputs.averageNewClientROI || ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EVENT_INPUTS",
                    payload: { averageNewClientROI: Number(e.target.value) || 0 },
                  })
                }
                className={`${inputClass} pl-10`}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Revenue from one new client won through this campaign
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-text-primary)] p-7 text-white lg:p-7">
          <h3 className="text-base font-semibold text-white">Live campaign summary</h3>
          <p className="mt-1 text-sm text-white/60">Updates as you adjust inputs.</p>

          <dl className="mt-6 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <div className="flex justify-between gap-4">
                <dt className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                  Cost / sign-up
                </dt>
                <dd className="font-display text-2xl font-normal tabular-nums text-white">
                  {formatEventCurrency(results.costPerSignup, eventInputs.currency)}
                </dd>
              </div>
              <p className="mt-1 text-[11px] text-white/45">
                Calculated automatically based on industry
              </p>
            </div>
            <div className="border-b border-white/10 pb-3">
              <div className="flex justify-between gap-4">
                <dt className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                  Sign-ups
                </dt>
                <dd className="font-display text-2xl font-normal tabular-nums text-white">
                  {results.signups.toLocaleString()}
                </dd>
              </div>
              <p className="mt-1 text-[11px] text-white/45">Based on your budget</p>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                Attendees
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {results.attendees.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                Opportunities
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {results.opportunities.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                New clients
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {Number.isInteger(results.clients)
                  ? results.clients.toLocaleString()
                  : (Math.round(results.clients * 100) / 100).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                Campaign cost
                <InfoTooltipTrigger
                  tooltipKey="EVENT_CAMPAIGN_COST"
                  iconVariant="dark"
                  className="normal-case"
                />
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {formatEventCurrency(results.campaignCost, eventInputs.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 pb-1 pt-0">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                Net return
                <InfoTooltipTrigger
                  tooltipKey="EVENT_NET_RETURN"
                  iconVariant="dark"
                  className="normal-case"
                />
              </dt>
              <dd
                className={[
                  "font-display text-2xl font-normal tabular-nums",
                  results.netReturn >= 0 ? "text-[#86EFAC]" : "text-[#FCA5A5]",
                ].join(" ")}
              >
                {formatEventCurrency(results.netReturn, eventInputs.currency)}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <EventBenchmarkDisclaimer compact />
          </div>

          <FunnelFlow
            signups={results.signups}
            attendees={results.attendees}
            opportunities={results.opportunities}
            clients={results.clients}
          />
        </div>
      </div>

      {!hideNavigation ? (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_STEP", payload: "select-services" })}
            className="btn-ghost w-full sm:w-auto calculator-interactive"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary w-full sm:w-auto calculator-interactive"
          >
            Next step →
          </button>
        </div>
      ) : null}
    </section>
  );
}
