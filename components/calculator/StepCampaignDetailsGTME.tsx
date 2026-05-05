"use client";

import { useState } from "react";
import { LabelWithTooltip, InfoTooltipTrigger } from "@/components/calculator/Tooltip";
import { convertAmount } from "@/lib/currencyConversion";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCalculator } from "@/lib/calculatorStore";
import type { Currency } from "@/types/calculator";

const CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "SEK"];

const DURATION_OPTIONS: Array<{ value: 1 | 3 | 6 | 12; label: string }> = [
  { value: 1, label: "1 month" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
];

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

function durationLabel(months: number): string {
  return months === 1 ? "1 month" : `${months} months`;
}

interface StepCampaignDetailsGTMEProps {
  /** When true, footer navigation is omitted (e.g. combined flow uses one shared footer). */
  hideNavigation?: boolean;
}

export default function StepCampaignDetailsGTME({
  hideNavigation = false,
}: StepCampaignDetailsGTMEProps): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { gtmeInputs } = state;
  const [previousCurrency, setPreviousCurrency] = useState<Currency>(gtmeInputs.currency);
  const sym = currencySymbol(gtmeInputs.currency);
  const monthlyCost =
    gtmeInputs.durationMonths > 0 ? gtmeInputs.totalBudget / gtmeInputs.durationMonths : 0;

  const handleCurrencyChange = (newCurrency: Currency): void => {
    if (newCurrency === gtmeInputs.currency) {
      return;
    }

    const newBudget = convertAmount(gtmeInputs.totalBudget, previousCurrency, newCurrency);
    const newDealSize = convertAmount(gtmeInputs.averageDealSize, previousCurrency, newCurrency);

    dispatch({
      type: "UPDATE_GTME_INPUTS",
      payload: {
        currency: newCurrency,
        totalBudget: newBudget,
        averageDealSize: newDealSize,
      },
    });
    setPreviousCurrency(newCurrency);
  };

  const handleNext = (): void => {
    dispatch({
      type: "UPDATE_GTME_INPUTS",
      payload: {
        currency: gtmeInputs.currency,
        totalBudget: gtmeInputs.totalBudget,
        averageDealSize: gtmeInputs.averageDealSize,
        durationMonths: gtmeInputs.durationMonths,
      },
    });
    dispatch({ type: "SET_STEP", payload: "performance" });
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[15px] text-[var(--color-text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 ease-out focus:border-[var(--color-accent)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]";

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
                    gtmeInputs.currency === c
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
              htmlFor="gtme-total-budget"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              <LabelWithTooltip tooltipKey="TOTAL_BUDGET">Total Campaign Budget</LabelWithTooltip>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                {sym}
              </span>
              <input
                id="gtme-total-budget"
                type="number"
                min={0}
                step={500}
                value={gtmeInputs.totalBudget || ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_GTME_INPUTS",
                    payload: { totalBudget: Number(e.target.value) || 0 },
                  })
                }
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="gtme-deal-size"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              <LabelWithTooltip tooltipKey="DEAL_SIZE">
                Average Deal Size / Revenue per Customer
              </LabelWithTooltip>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                {sym}
              </span>
              <input
                id="gtme-deal-size"
                type="number"
                min={0}
                step={500}
                value={gtmeInputs.averageDealSize || ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_GTME_INPUTS",
                    payload: { averageDealSize: Number(e.target.value) || 0 },
                  })
                }
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              Campaign Duration
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_GTME_INPUTS",
                      payload: { durationMonths: opt.value },
                    })
                  }
                  className={[
                    "rounded-lg border px-3 py-2.5 text-center text-sm font-semibold calculator-interactive",
                    gtmeInputs.durationMonths === opt.value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[#9CA3AF]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="calculator-card p-7 lg:p-8">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Investment summary
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Updates as you edit campaign details.
          </p>

          <div className="mt-6 border-b border-[var(--color-border)] pb-6">
            <p className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              Total Budget
              <InfoTooltipTrigger tooltipKey="TOTAL_BUDGET" />
            </p>
            <p className="font-display mt-2 text-[36px] font-normal leading-none text-[var(--color-accent)]">
              {formatCurrency(gtmeInputs.totalBudget, gtmeInputs.currency)}
            </p>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-3">
              <dt className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                Monthly Cost
                <InfoTooltipTrigger tooltipKey="MONTHLY_COST" />
              </dt>
              <dd className="font-medium tabular-nums text-[var(--color-text-primary)]">
                {formatCurrency(monthlyCost, gtmeInputs.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 pb-1">
              <dt className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                Duration
              </dt>
              <dd className="font-medium text-[var(--color-text-primary)]">
                {durationLabel(gtmeInputs.durationMonths)}
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-xs text-[var(--color-text-secondary)]">
            Revenue & ROI reveal after step 4
          </p>
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
