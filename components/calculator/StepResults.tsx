"use client";

/**
 * Flow conditions (from selectedServices):
 * - hasOutbound = selectedServices includes any of: sdr-team, ae-team, event-lead-gen
 * - hasGTME = selectedServices includes: gtme
 * - isCombined = hasOutbound && hasGTME
 * - isOutboundOnly = hasOutbound && !hasGTME
 * - isGTMEOnly = hasGTME && !hasOutbound
 *
 * Results layout uses saved result objects: combined UI when both gtmeResults and outboundResults exist.
 */

import { useEffect, useState } from "react";
import { tooltips } from "@/constants/tooltips";
import { formatCurrency } from "@/lib/formatCurrency";
import { getGTMERoiLabel } from "@/lib/formulas/gtme";
import { getCashFlowWarning, getRoiLabel } from "@/lib/formulas/outbound";
import { useCalculator } from "@/lib/calculatorStore";
import type { Currency, GTMEResults, OutboundResults } from "@/types/calculator";

type TooltipKey = keyof typeof tooltips;

function TooltipIcon({ tooltipKey }: { tooltipKey: TooltipKey }): React.JSX.Element {
  const text = tooltips[tooltipKey];
  return (
    <span
      className="ml-1 inline-flex cursor-help text-[var(--color-text-secondary)] opacity-70 transition-opacity duration-150 hover:opacity-100"
      title={text}
      tabIndex={0}
      role="note"
      aria-label={text}
    >
      ⓘ
    </span>
  );
}

function MetricTile({
  label,
  value,
  tooltipKey,
  surfaceClassName = "bg-[var(--color-surface)]",
}: {
  label: string;
  value: string;
  tooltipKey: TooltipKey;
  surfaceClassName?: string;
}): React.JSX.Element {
  return (
    <div
      className={[
        "rounded-xl border border-[var(--color-border)] px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        surfaceClassName,
      ].join(" ")}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
        {label}
        <TooltipIcon tooltipKey={tooltipKey} />
      </p>
      <p className="font-display mt-2 text-[28px] font-normal leading-tight tabular-nums text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function HorizontalBarRow({
  label,
  valueText,
  percent,
  barClassName,
}: {
  label: string;
  valueText: string;
  percent: number;
  barClassName: string;
}): React.JSX.Element {
  const target = Math.min(Math.max(percent, 0), 100);
  const [widthPct, setWidthPct] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setWidthPct(target));
    });
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-[var(--color-text-primary)]">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-[var(--color-text-primary)]">
          {valueText}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-[#E5E7EB]">
        <div
          className={["h-full rounded transition-[width] duration-700 ease-out", barClassName].join(" ")}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

function GtmeMetricTilesGrid({
  gtmeResults,
  gtmeCurrency,
}: {
  gtmeResults: GTMEResults;
  gtmeCurrency: Currency;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricTile
        label="Projected Revenue"
        value={formatCurrency(gtmeResults.projectedRevenue, gtmeCurrency)}
        tooltipKey="ARR"
        surfaceClassName="bg-[var(--color-green-subtle)]"
      />
      <MetricTile
        label="New Customers"
        value={String(gtmeResults.newCustomers)}
        tooltipKey="MRR"
        surfaceClassName="bg-[var(--color-blue-subtle)]"
      />
      <MetricTile
        label="Cost per Lead"
        value={formatCurrency(gtmeResults.costPerLead, gtmeCurrency)}
        tooltipKey="CAC"
        surfaceClassName="bg-[var(--color-yellow-subtle)]"
      />
      <MetricTile
        label="Cost per Acquisition"
        value={formatCurrency(gtmeResults.costPerAcquisition, gtmeCurrency)}
        tooltipKey="CLV"
        surfaceClassName="bg-[var(--color-red-subtle)]"
      />
      <MetricTile
        label="Lifetime Revenue"
        value={formatCurrency(gtmeResults.lifetimeRevenue, gtmeCurrency)}
        tooltipKey="LTV"
        surfaceClassName="bg-[var(--color-accent-light)]"
      />
      <MetricTile
        label="Lifetime ROI"
        value={`${gtmeResults.lifetimeRoi}%`}
        tooltipKey="ROI"
        surfaceClassName="bg-[var(--color-surface)]"
      />
    </div>
  );
}

function OutboundMetricTilesGrid({
  outboundResults,
  outboundCurrency,
}: {
  outboundResults: OutboundResults;
  outboundCurrency: Currency;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile
        label="New clients / month"
        value={outboundResults.newClientsPerMonth.toFixed(2)}
        tooltipKey="MRR"
      />
      <MetricTile
        label="CAC"
        value={formatCurrency(outboundResults.cac, outboundCurrency)}
        tooltipKey="CAC"
      />
      <MetricTile
        label="ARR"
        value={formatCurrency(outboundResults.arr, outboundCurrency)}
        tooltipKey="ARR"
      />
      <MetricTile
        label="LTV"
        value={formatCurrency(outboundResults.ltv, outboundCurrency)}
        tooltipKey="LTV"
      />
    </div>
  );
}

function InvestmentVsReturnCard({
  gtmeResults,
  gtmeInputs,
  gtmeCurrency,
}: {
  gtmeResults: GTMEResults;
  gtmeInputs: { totalBudget: number };
  gtmeCurrency: Currency;
}): React.JSX.Element {
  const cost = gtmeInputs.totalBudget;
  const projected = gtmeResults.projectedRevenue;
  const lifetime = gtmeResults.lifetimeRevenue;
  const max = Math.max(cost, projected, lifetime, 1);
  const investmentBars = {
    cost,
    projected,
    lifetime,
    costPct: (cost / max) * 100,
    projectedPct: (projected / max) * 100,
    lifetimePct: (lifetime / max) * 100,
  };

  return (
    <div className="calculator-card p-6 md:p-8">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Investment vs. return</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Bar lengths are proportional to each amount (scaled to the largest value). Based on your GTM
        Engineering campaign.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <HorizontalBarRow
          label="Campaign cost"
          valueText={formatCurrency(investmentBars.cost, gtmeCurrency)}
          percent={investmentBars.costPct}
          barClassName="bg-[#B91C1C]"
        />
        <HorizontalBarRow
          label="Projected revenue"
          valueText={formatCurrency(investmentBars.projected, gtmeCurrency)}
          percent={investmentBars.projectedPct}
          barClassName="bg-[#2563EB]"
        />
        <HorizontalBarRow
          label="Lifetime revenue"
          valueText={formatCurrency(investmentBars.lifetime, gtmeCurrency)}
          percent={investmentBars.lifetimePct}
          barClassName="bg-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}

export default function StepResults(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { gtmeResults, outboundResults, gtmeInputs, outboundInputs } = state;

  const [pdfToastVisible, setPdfToastVisible] = useState(false);

  useEffect(() => {
    if (!pdfToastVisible) {
      return;
    }
    const t = window.setTimeout(() => setPdfToastVisible(false), 3200);
    return () => window.clearTimeout(t);
  }, [pdfToastVisible]);

  const gtmeCurrency = gtmeInputs.currency;
  const outboundCurrency = outboundInputs.currency;

  const handleRecalculate = (): void => {
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_STEP", payload: "select-services" });
  };

  const handleDownloadPdf = (): void => {
    setPdfToastVisible(true);
  };

  const investmentBarsGtmeOnly = (() => {
    if (!gtmeResults) {
      return null;
    }
    const cost = gtmeInputs.totalBudget;
    const projected = gtmeResults.projectedRevenue;
    const lifetime = gtmeResults.lifetimeRevenue;
    const max = Math.max(cost, projected, lifetime, 1);
    return {
      cost,
      projected,
      lifetime,
      costPct: (cost / max) * 100,
      projectedPct: (projected / max) * 100,
      lifetimePct: (lifetime / max) * 100,
    };
  })();

  const showCombinedResults = gtmeResults !== null && outboundResults !== null;
  const showGtmeOnlyResults = gtmeResults !== null && outboundResults === null;
  const showOutboundOnlyResults = outboundResults !== null && gtmeResults === null;

  return (
    <section className="relative mx-auto w-full pb-24">
      {showCombinedResults && gtmeResults && outboundResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10 lg:gap-10">
          <div
            className="rounded-2xl px-6 py-10 text-white md:px-12 md:py-12"
            style={{
              background: "linear-gradient(135deg, #0F3D24 0%, #1A5C38 100%)",
            }}
          >
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
              YOUR PROJECTED ROI
            </p>
            <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-white/20">
              <div className="flex flex-col items-center px-2 text-center md:pr-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/70">
                  Outbound ROI
                </p>
                <p className="font-display mt-3 text-[56px] font-normal leading-none tracking-tight text-white sm:text-[64px] md:text-[72px]">
                  {outboundResults.roi}x
                </p>
              </div>
              <div className="flex flex-col items-center px-2 text-center md:pl-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/70">
                  GTM Engineering ROI
                </p>
                <p className="font-display mt-3 text-[56px] font-normal leading-none tracking-tight text-white sm:text-[64px] md:text-[72px]">
                  {gtmeResults.roi}%
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              GTM Engineering
            </h3>
            <GtmeMetricTilesGrid gtmeResults={gtmeResults} gtmeCurrency={gtmeCurrency} />
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Outbound
            </h3>
            <OutboundMetricTilesGrid
              outboundResults={outboundResults}
              outboundCurrency={outboundCurrency}
            />
          </div>

          <InvestmentVsReturnCard
            gtmeResults={gtmeResults}
            gtmeInputs={gtmeInputs}
            gtmeCurrency={gtmeCurrency}
          />

          {!outboundResults.cashFlowYear1Positive ? (
            <div
              className="rounded-lg border border-[var(--color-border)] py-3 pl-4 pr-4 text-sm text-[var(--color-text-primary)]"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: "var(--color-amber)",
                background: "#FFFBEB",
              }}
            >
              {getCashFlowWarning(
                outboundResults.cashFlowYear1Positive,
                outboundResults.cac,
                outboundResults.arr,
                outboundCurrency
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {showGtmeOnlyResults && gtmeResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10 lg:gap-10">
          <div
            className="rounded-2xl px-8 py-12 text-center text-white md:px-12 md:py-[48px]"
            style={{
              background: "linear-gradient(135deg, #0F3D24 0%, #1A5C38 100%)",
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
              YOUR PROJECTED ROI
            </p>
            <p className="font-display mt-6 text-[80px] font-normal leading-none tracking-tight text-white md:text-[80px]">
              {gtmeResults.roi}%
            </p>
            <p className="mt-6 inline-block rounded-full bg-white/15 px-3.5 py-1 text-sm font-medium text-white">
              {getGTMERoiLabel(gtmeResults.roi)}
            </p>
          </div>

          <GtmeMetricTilesGrid gtmeResults={gtmeResults} gtmeCurrency={gtmeCurrency} />

          {investmentBarsGtmeOnly ? (
            <div className="calculator-card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Investment vs. return
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Bar lengths are proportional to each amount (scaled to the largest value).
              </p>
              <div className="mt-8 flex flex-col gap-8">
                <HorizontalBarRow
                  label="Campaign cost"
                  valueText={formatCurrency(investmentBarsGtmeOnly.cost, gtmeCurrency)}
                  percent={investmentBarsGtmeOnly.costPct}
                  barClassName="bg-[#B91C1C]"
                />
                <HorizontalBarRow
                  label="Projected revenue"
                  valueText={formatCurrency(investmentBarsGtmeOnly.projected, gtmeCurrency)}
                  percent={investmentBarsGtmeOnly.projectedPct}
                  barClassName="bg-[#2563EB]"
                />
                <HorizontalBarRow
                  label="Lifetime revenue"
                  valueText={formatCurrency(investmentBarsGtmeOnly.lifetime, gtmeCurrency)}
                  percent={investmentBarsGtmeOnly.lifetimePct}
                  barClassName="bg-[var(--color-accent)]"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showOutboundOnlyResults && outboundResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10">
          <div
            className="rounded-2xl px-8 py-12 text-center text-white md:px-12 md:py-[48px]"
            style={{
              background: "linear-gradient(135deg, #0F3D24 0%, #1A5C38 100%)",
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
              YOUR PROJECTED ROI
            </p>
            <p className="font-display mt-6 text-[80px] font-normal leading-none tracking-tight text-white">
              {outboundResults.roi}x
            </p>
            <p className="mt-6 inline-block rounded-full bg-white/15 px-3.5 py-1 text-sm font-medium capitalize text-white">
              {getRoiLabel(outboundResults.roi)}
            </p>
          </div>

          <OutboundMetricTilesGrid
            outboundResults={outboundResults}
            outboundCurrency={outboundCurrency}
          />

          {!outboundResults.cashFlowYear1Positive ? (
            <div
              className="rounded-lg border border-[var(--color-border)] py-3 pl-4 pr-4 text-sm text-[var(--color-text-primary)]"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: "var(--color-amber)",
                background: "#FFFBEB",
              }}
            >
              {getCashFlowWarning(
                outboundResults.cashFlowYear1Positive,
                outboundResults.cac,
                outboundResults.arr,
                outboundCurrency
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {!gtmeResults && !outboundResults ? (
        <p className="calculator-card border-dashed p-10 text-center text-[var(--color-text-secondary)]">
          No saved results to display yet. Go back through the calculator to generate your ROI
          report.
        </p>
      ) : null}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
        <a
          href="https://www.brightvision.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary calculator-interactive inline-flex w-full sm:w-auto"
        >
          Talk to an Expert
        </a>
        <button
          type="button"
          onClick={handleRecalculate}
          className="btn-ghost calculator-interactive w-full sm:w-auto"
        >
          Recalculate
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="btn-ghost calculator-interactive w-full sm:w-auto"
        >
          Download PDF
        </button>
      </div>

      {pdfToastVisible ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-text-primary)] px-5 py-3 text-sm font-medium text-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
        >
          PDF download coming soon
        </div>
      ) : null}
    </section>
  );
}
