"use client";

import { useState, type CSSProperties } from "react";
import { LabelWithTooltip, InfoTooltipTrigger } from "@/components/calculator/Tooltip";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  calculateOutboundResults,
  getCashFlowWarning,
  getRoiLabel,
  outboundRoiLabelBadgeClassName,
} from "@/lib/formulas/outbound";
import { useCalculator } from "@/lib/calculatorStore";
import type { Currency, OutboundServiceModel } from "@/types/calculator";

const CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "SEK"];
const SERVICE_MODELS: OutboundServiceModel[] = ["retainer", "campaign"];
const baseCostPerMeeting = 600;
const exchangeRates = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  SEK: 11.5,
} as const;
const BASE_RETAINER_MIN_EUR = 5200;
const BASE_CAMPAIGN_MIN_EUR = 7400;

function currencySymbol(currency: Currency): string {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "SEK":
      return "kr";
    default:
      return "";
  }
}

function rangePctStyle(value: number, min: number, max: number): CSSProperties {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return { "--range-pct": `${pct}%` } as CSSProperties;
}

interface StepCampaignDetailsOutboundProps {
  /** When true, footer navigation is omitted (e.g. combined flow uses one shared footer). */
  hideNavigation?: boolean;
}

export default function StepCampaignDetailsOutbound({
  hideNavigation = false,
}: StepCampaignDetailsOutboundProps): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { outboundInputs } = state;
  const [serviceModel, setServiceModel] = useState<OutboundServiceModel>(
    outboundInputs.serviceModel ?? "retainer"
  );
  const costPerMeetingByCurrency = Object.fromEntries(
    CURRENCIES.map((currency) => [currency, Math.round(baseCostPerMeeting * exchangeRates[currency])])
  ) as Record<Currency, number>;
  const costPerMeeting = costPerMeetingByCurrency[outboundInputs.currency];
  const results = calculateOutboundResults(outboundInputs, costPerMeeting);
  const roiLabel = getRoiLabel(results.roi);
  const cashWarning = getCashFlowWarning(
    results.cashFlowYear1Positive,
    results.cac,
    results.arr,
    outboundInputs.currency
  );
  const sym = currencySymbol(outboundInputs.currency);
  const yearsWhole = Math.floor(outboundInputs.clientLifetimeYears);
  const monthsTotal = Math.round(outboundInputs.clientLifetimeYears * 12);
  const minimums = {
    retainer: Object.fromEntries(
      CURRENCIES.map((currency) => [
        currency,
        Math.round(BASE_RETAINER_MIN_EUR * exchangeRates[currency]),
      ])
    ) as Record<Currency, number>,
    campaign: Object.fromEntries(
      CURRENCIES.map((currency) => [
        currency,
        Math.round(BASE_CAMPAIGN_MIN_EUR * exchangeRates[currency]),
      ])
    ) as Record<Currency, number>,
  };
  const currentMinimum = minimums[serviceModel][outboundInputs.currency];
  const isBelowMinimum = results.monthlySpend < currentMinimum;
  const monthlyBudgetLabel =
    serviceModel === "retainer" ? "Estimated monthly retainer" : "Estimated campaign investment";
  const modelWarningText =
    serviceModel === "retainer"
      ? `The minimum monthly retainer with Brightvision is ${formatCurrency(
          currentMinimum,
          outboundInputs.currency
        )}. Your current input is below this threshold — consider increasing your target meetings.`
      : `The minimum campaign investment with Brightvision is ${formatCurrency(
          currentMinimum,
          outboundInputs.currency
        )}. Your current input is below this threshold.`;

  const inputClass =
    "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[15px] text-[var(--color-text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 ease-out focus:border-[var(--color-accent)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]";

  const handleCurrencyChange = (newCurrency: Currency): void => {
    if (newCurrency === outboundInputs.currency) {
      return;
    }
    const oldRate = exchangeRates[outboundInputs.currency];
    const newRate = exchangeRates[newCurrency];
    const factor = newRate / oldRate;
    const newCostPerMeeting = costPerMeetingByCurrency[newCurrency];
    const newMinimum = minimums[serviceModel][newCurrency];
    const minMeetings = Math.ceil(newMinimum / newCostPerMeeting);
    const nextMeetings = Math.max(outboundInputs.targetMeetingsPerMonth, minMeetings);

    dispatch({
      type: "UPDATE_OUTBOUND_INPUTS",
      payload: {
        currency: newCurrency,
        averageMRR: Math.round(outboundInputs.averageMRR * factor),
        targetMeetingsPerMonth: nextMeetings,
      },
    });
  };

  return (
    <section className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Campaign details
            </h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              Service model
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_MODELS.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => {
                    setServiceModel(model);
                    dispatch({ type: "UPDATE_OUTBOUND_INPUTS", payload: { serviceModel: model } });
                  }}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold capitalize calculator-interactive",
                    serviceModel === model
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[#9CA3AF]",
                  ].join(" ")}
                >
                  {model}
                </button>
              ))}
            </div>
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
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold calculator-interactive",
                    outboundInputs.currency === c
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[#9CA3AF]",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="target-meetings"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              <LabelWithTooltip tooltipKey="MEETINGS">Desired booked meetings per month</LabelWithTooltip>
            </label>
            <input
              id="target-meetings"
              type="number"
              min={0}
              step={1}
              value={outboundInputs.targetMeetingsPerMonth || ""}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OUTBOUND_INPUTS",
                  payload: { targetMeetingsPerMonth: Number(e.target.value) || 0 },
                })
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Minimum {formatCurrency(currentMinimum, outboundInputs.currency)}{" "}
              {serviceModel === "retainer" ? "/ month" : "total"}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="close-rate" className="text-sm font-medium text-[var(--color-text-primary)]">
                <LabelWithTooltip tooltipKey="CLOSE_RATE">Close rate</LabelWithTooltip>
              </label>
              <span className="font-display text-xl tabular-nums text-[var(--color-accent)]">
                {outboundInputs.closeRate}%
              </span>
            </div>
            <input
              id="close-rate"
              type="range"
              min={1}
              max={30}
              step={1}
              value={outboundInputs.closeRate}
              style={rangePctStyle(outboundInputs.closeRate, 1, 30)}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OUTBOUND_INPUTS",
                  payload: { closeRate: Number(e.target.value) },
                })
              }
              className="calculator-range h-2 w-full cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--color-text-secondary)]">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <label htmlFor="avg-mrr" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              <LabelWithTooltip tooltipKey="MRR">Average new client MRR</LabelWithTooltip>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                {sym}
              </span>
              <input
                id="avg-mrr"
                type="number"
                min={0}
                step={100}
                value={outboundInputs.averageMRR || ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_OUTBOUND_INPUTS",
                    payload: { averageMRR: Number(e.target.value) || 0 },
                  })
                }
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <label htmlFor="client-lifetime" className="text-sm font-medium text-[var(--color-text-primary)]">
                <LabelWithTooltip tooltipKey="LTV">Average client lifetime</LabelWithTooltip>
              </label>
              <span className="font-display text-xl tabular-nums text-[var(--color-accent)]">
                {yearsWhole} {yearsWhole === 1 ? "year" : "years"} / {monthsTotal}{" "}
                {monthsTotal === 1 ? "month" : "months"}
              </span>
            </div>
            <input
              id="client-lifetime"
              type="range"
              min={1}
              max={10}
              step={1}
              value={outboundInputs.clientLifetimeYears}
              style={rangePctStyle(outboundInputs.clientLifetimeYears, 1, 10)}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OUTBOUND_INPUTS",
                  payload: { clientLifetimeYears: Number(e.target.value) },
                })
              }
              className="calculator-range h-2 w-full cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--color-text-secondary)]">
              <span>1 year</span>
              <span>10 years</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-text-primary)] p-7 text-white lg:p-7">
          <h3 className="text-base font-semibold text-white">Live ROI summary</h3>
          <p className="mt-1 text-sm text-white/60">Updates as you adjust inputs.</p>

          <dl className="mt-6 space-y-4">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                Meetings / month
                <InfoTooltipTrigger tooltipKey="MEETINGS" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {outboundInputs.targetMeetingsPerMonth}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                New clients / month
                <InfoTooltipTrigger tooltipKey="NEW_CLIENTS" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="text-right font-display text-2xl font-normal tabular-nums text-white">
                {results.newClientsPerMonth.toFixed(2)}
                <span className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-white/45">
                  ({outboundInputs.targetMeetingsPerMonth} × {outboundInputs.closeRate}%)
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                {monthlyBudgetLabel}
                <InfoTooltipTrigger tooltipKey="MONTHLY_SPEND" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.monthlySpend, outboundInputs.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                CAC
                <InfoTooltipTrigger tooltipKey="CAC" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.cac, outboundInputs.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                ARR
                <InfoTooltipTrigger tooltipKey="ARR" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.arr, outboundInputs.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                LTV
                <InfoTooltipTrigger tooltipKey="LTV" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="font-display text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.ltv, outboundInputs.currency)}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <dt className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.05em] text-white/60">
                ROI
                <InfoTooltipTrigger tooltipKey="ROI" iconVariant="dark" className="normal-case" />
              </dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className="font-display text-2xl font-normal tabular-nums text-white">
                  {results.roi}x
                </span>
                <span
                  className={[
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    outboundRoiLabelBadgeClassName(roiLabel),
                  ].join(" ")}
                >
                  {roiLabel}
                </span>
              </dd>
            </div>
          </dl>

          {cashWarning ? (
            <p className="mt-6 rounded-lg border-l-4 border-[var(--color-amber)] bg-[#FFFBEB] p-3 pl-4 text-sm leading-relaxed text-[var(--color-text-primary)]">
              {cashWarning}
            </p>
          ) : null}

          {isBelowMinimum ? (
            <p className="mt-4 rounded-lg border-l-4 border-[var(--color-amber)] bg-[#FFFBEB] px-4 py-3 text-[13px] leading-relaxed text-[#92400E]">
              ⚠️ {modelWarningText}
            </p>
          ) : null}
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
            onClick={() => {
              const computed = calculateOutboundResults(outboundInputs, costPerMeeting);
              dispatch({ type: "SET_OUTBOUND_RESULTS", payload: computed });
              dispatch({ type: "SET_STEP", payload: "performance" });
            }}
            className="btn-primary w-full sm:w-auto calculator-interactive"
          >
            Next step →
          </button>
        </div>
      ) : null}
    </section>
  );
}
