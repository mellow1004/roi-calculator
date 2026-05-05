"use client";

/**
 * Flow conditions (from selectedServices):
 * - hasOutbound = selectedServices includes any of: sdr-team, ae-team, event-lead-gen
 * - hasGTME = selectedServices includes: gtme
 * - isCombined = hasOutbound && hasGTME
 * - isOutboundOnly = hasOutbound && !hasGTME
 * - isGTMEOnly = hasGTME && !hasOutbound
 *
 * Step 3: GTME sliders when isCombined OR isGTMEOnly (i.e. hasGTME).
 * Outbound-only confirmation when isOutboundOnly — not merely !hasGTME.
 */

import type { CSSProperties, ReactNode } from "react";
import { LabelWithTooltip } from "@/components/calculator/Tooltip";
import { calculateGTMEResults, getGTMERoiLabel } from "@/lib/formulas/gtme";
import { calculateOutboundResults, getCostPerMeetingForCurrency } from "@/lib/formulas/outbound";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCalculator } from "@/lib/calculatorStore";

const OUTBOUND_SERVICE_IDS = ["sdr-team", "ae-team", "event-lead-gen"] as const;

const RING_RADIUS = 78;
const RING_STROKE = 10;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function RoiRing({ roiPercent }: { roiPercent: number }): React.JSX.Element {
  const normalized = Math.min(Math.max(roiPercent / 500, 0), 1);
  const dash = normalized * RING_CIRC;
  const accent = "var(--color-accent)";

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx="100"
          cy="100"
          r={RING_RADIUS}
          fill="none"
          stroke={accent}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${RING_CIRC}`}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[48px] font-normal leading-none tracking-tight text-white">
          {roiPercent}%
        </span>
      </div>
    </div>
  );
}

function rangePctStyle(value: number, min: number, max: number): CSSProperties {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return { "--range-pct": `${pct}%` } as CSSProperties;
}

interface SliderRowProps {
  id: string;
  label: ReactNode;
  valueDisplay: ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

function SliderRow({
  id,
  label,
  valueDisplay,
  min,
  max,
  step,
  value,
  onChange,
}: SliderRowProps): React.JSX.Element {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
        <span className="font-display shrink-0 text-[20px] font-normal tabular-nums text-[var(--color-accent)]">
          {valueDisplay}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={rangePctStyle(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="calculator-range h-2 w-full cursor-pointer"
      />
    </div>
  );
}

function OutboundConfirmationSummary(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { outboundInputs, outboundResults } = state;
  const costPerMeeting = getCostPerMeetingForCurrency(outboundInputs.currency);
  const results = outboundResults ?? calculateOutboundResults(outboundInputs, costPerMeeting);
  const currency = outboundInputs.currency;
  const yearsWhole = Math.floor(outboundInputs.clientLifetimeYears);
  const monthsTotal = Math.round(outboundInputs.clientLifetimeYears * 12);

  const rows: Array<{ label: string; value: string }> = [
    {
      label: "Booked meetings / month",
      value: String(outboundInputs.targetMeetingsPerMonth),
    },
    { label: "Close rate", value: `${outboundInputs.closeRate}%` },
    {
      label: "Average new client MRR",
      value: formatCurrency(outboundInputs.averageMRR, currency),
    },
    {
      label: "Average client lifetime",
      value: `${yearsWhole} ${yearsWhole === 1 ? "year" : "years"} / ${monthsTotal} ${
        monthsTotal === 1 ? "month" : "months"
      }`,
    },
    { label: "CAC", value: formatCurrency(results.cac, currency) },
    { label: "ARR", value: formatCurrency(results.arr, currency) },
    { label: "LTV", value: formatCurrency(results.ltv, currency) },
    { label: "ROI", value: `${results.roi}x` },
  ];

  return (
    <section className="mx-auto w-full">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          You&apos;re almost there!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Review your campaign details below before we collect your information.
        </p>
      </div>

      <div className="calculator-card mx-auto mt-8 max-w-xl p-6 md:p-8">
        <dl className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <dt className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                {row.label}
              </dt>
              <dd className="font-display text-right text-xl font-normal tabular-nums text-[var(--color-text-primary)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_STEP", payload: "campaign-details" })}
          className="btn-ghost w-full sm:w-auto calculator-interactive"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_STEP", payload: "your-details" })}
          className="btn-primary w-full sm:w-auto calculator-interactive"
        >
          Next step →
        </button>
      </div>
    </section>
  );
}

export default function StepPerformance(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { gtmeInputs, selectedServices } = state;

  const hasGTME = selectedServices.includes("gtme");
  const hasOutbound = selectedServices.some((id) =>
    (OUTBOUND_SERVICE_IDS as readonly string[]).includes(id)
  );
  const isOutboundOnly = hasOutbound && !hasGTME;

  if (isOutboundOnly) {
    return <OutboundConfirmationSummary />;
  }

  const results = calculateGTMEResults(gtmeInputs);
  const roiLabel = getGTMERoiLabel(results.roi);

  const handleNext = (): void => {
    const sliderSnapshot = {
      expectedLeadVolume: gtmeInputs.expectedLeadVolume,
      leadToOpportunityRate: gtmeInputs.leadToOpportunityRate,
      opportunityToCustomerRate: gtmeInputs.opportunityToCustomerRate,
      customerRetentionRate: gtmeInputs.customerRetentionRate,
      clvMultiplier: gtmeInputs.clvMultiplier,
    };
    const mergedInputs = { ...gtmeInputs, ...sliderSnapshot };
    const computed = calculateGTMEResults(mergedInputs);

    dispatch({ type: "UPDATE_GTME_INPUTS", payload: sliderSnapshot });
    dispatch({ type: "SET_GTME_RESULTS", payload: computed });
    dispatch({ type: "SET_STEP", payload: "your-details" });
  };

  return (
    <section className="mx-auto w-full">
      <div className="mb-8 lg:mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Performance
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-8">
          <SliderRow
            id="expected-lead-volume"
            label={<LabelWithTooltip tooltipKey="LEAD_VOLUME">Expected Lead Volume</LabelWithTooltip>}
            valueDisplay={gtmeInputs.expectedLeadVolume.toLocaleString()}
            min={10}
            max={5000}
            step={10}
            value={gtmeInputs.expectedLeadVolume}
            onChange={(v) =>
              dispatch({ type: "UPDATE_GTME_INPUTS", payload: { expectedLeadVolume: v } })
            }
          />

          <SliderRow
            id="lead-to-opp"
            label={<LabelWithTooltip tooltipKey="LEAD_TO_OPP">Lead → Opportunity Rate</LabelWithTooltip>}
            valueDisplay={`${gtmeInputs.leadToOpportunityRate}%`}
            min={1}
            max={50}
            step={1}
            value={gtmeInputs.leadToOpportunityRate}
            onChange={(v) =>
              dispatch({ type: "UPDATE_GTME_INPUTS", payload: { leadToOpportunityRate: v } })
            }
          />

          <SliderRow
            id="opp-to-customer"
            label={
              <LabelWithTooltip tooltipKey="OPP_TO_CUSTOMER">Opportunity → Customer Rate</LabelWithTooltip>
            }
            valueDisplay={`${gtmeInputs.opportunityToCustomerRate}%`}
            min={1}
            max={80}
            step={1}
            value={gtmeInputs.opportunityToCustomerRate}
            onChange={(v) =>
              dispatch({ type: "UPDATE_GTME_INPUTS", payload: { opportunityToCustomerRate: v } })
            }
          />

          <SliderRow
            id="retention"
            label={<LabelWithTooltip tooltipKey="RETENTION">Customer Retention Rate</LabelWithTooltip>}
            valueDisplay={`${gtmeInputs.customerRetentionRate}%`}
            min={0}
            max={100}
            step={1}
            value={gtmeInputs.customerRetentionRate}
            onChange={(v) =>
              dispatch({ type: "UPDATE_GTME_INPUTS", payload: { customerRetentionRate: v } })
            }
          />

          <SliderRow
            id="clv-mult"
            label={<LabelWithTooltip tooltipKey="CLV_MULTIPLIER">CLV Multiplier</LabelWithTooltip>}
            valueDisplay={`${gtmeInputs.clvMultiplier}x`}
            min={1}
            max={10}
            step={1}
            value={gtmeInputs.clvMultiplier}
            onChange={(v) =>
              dispatch({ type: "UPDATE_GTME_INPUTS", payload: { clvMultiplier: v } })
            }
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-text-primary)] p-7 text-white lg:p-8">
          <h3 className="text-center text-base font-semibold text-white">Projected ROI</h3>
          <p className="mt-1 text-center text-sm text-white/55">
            Based on your campaign budget and deal size.
          </p>

          <div className="mt-6 flex flex-col items-center">
            <RoiRing roiPercent={results.roi} />
            <p className="mt-4 text-center text-sm font-semibold text-white/85">{roiLabel}</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.07)] p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/55">
                New Customers
              </p>
              <p className="font-display mt-1 text-2xl font-normal tabular-nums text-white">
                {results.newCustomers}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.07)] p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/55">
                Revenue
              </p>
              <p className="font-display mt-1 text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.projectedRevenue, gtmeInputs.currency)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.07)] p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/55">
                Cost/Lead
              </p>
              <p className="font-display mt-1 text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.costPerLead, gtmeInputs.currency)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.07)] p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-white/55">
                Cost/Acq
              </p>
              <p className="font-display mt-1 text-2xl font-normal tabular-nums text-white">
                {formatCurrency(results.costPerAcquisition, gtmeInputs.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_STEP", payload: "campaign-details" })}
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
    </section>
  );
}
