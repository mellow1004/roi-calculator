"use client";

/**
 * Flow conditions (from selectedServices):
 * - hasOutbound = selectedServices includes any of: sdr-team, ae-team, event-lead-gen
 * - hasEvent = selectedServices includes: event-lead-gen
 * - hasGTME = selectedServices includes: gtme
 * - isCombined = hasOutbound && hasGTME
 * - isOutboundOnly = hasOutbound && !hasGTME
 * - isGTMEOnly = hasGTME && !hasOutbound
 *
 * Results layout uses saved result objects: combined UI when both gtmeResults and outboundResults exist.
 */

import { useEffect, useState } from "react";
import { EventBenchmarkDisclaimer } from "@/components/calculator/EventBenchmarkDisclaimer";
import { InfoTooltipTrigger } from "@/components/calculator/Tooltip";
import type { TooltipKey } from "@/constants/tooltips";
import { formatCurrency, formatEventCurrency } from "@/lib/formatCurrency";
import { getGTMERoiLabel } from "@/lib/formulas/gtme";
import {
  getCashFlowWarning,
  getRoiLabel,
  outboundRoiLabelBadgeClassName,
} from "@/lib/formulas/outbound";
import { useCalculator } from "@/lib/calculatorStore";
import type { Currency, EventResults, GTMEResults, OutboundResults } from "@/types/calculator";
import type { EventInputs } from "@/lib/formulas/event";
import { formatEventRoiSummary, isEventLossMaking } from "@/lib/formulas/event";

function TooltipIcon({ tooltipKey }: { tooltipKey: TooltipKey }): React.JSX.Element {
  return <InfoTooltipTrigger tooltipKey={tooltipKey} className="ml-1" />;
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

function ResultsSectionDivider({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
      <p className="shrink-0 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <div className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
    </div>
  );
}

function EventMetricTilesGrid({
  eventResults,
  eventCurrency,
}: {
  eventResults: EventResults;
  eventCurrency: EventInputs["currency"];
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile
        label="New Clients"
        value={formatEventFunnelValue(eventResults.clients)}
        tooltipKey="NEW_CLIENTS"
        surfaceClassName="bg-[var(--color-blue-subtle)]"
      />
      <MetricTile
        label="Campaign Cost"
        value={formatEventCurrency(eventResults.campaignCost, eventCurrency)}
        tooltipKey="EVENT_CAMPAIGN_COST"
        surfaceClassName="bg-[var(--color-red-subtle)]"
      />
      <MetricTile
        label="Cost per New Client"
        value={formatEventCurrency(eventResults.costPerNewClient, eventCurrency)}
        tooltipKey="COST_PER_ACQ"
        surfaceClassName="bg-[var(--color-yellow-subtle)]"
      />
      <MetricTile
        label="Revenue Multiple"
        value={`${eventResults.revenueMultiple}x`}
        tooltipKey="ROI"
        surfaceClassName="bg-[var(--color-accent-light)]"
      />
    </div>
  );
}

function formatEventFunnelValue(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function EventFunnelCards({
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
    <div className="calculator-card p-6 md:p-8">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Campaign performance funnel
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Projected flow from sign-ups to closed clients.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                {stage.label}
              </p>
              <p className="font-display mt-1 text-2xl font-normal tabular-nums text-[var(--color-text-primary)]">
                {formatEventFunnelValue(stage.value)}
              </p>
            </div>
            {index < stages.length - 1 ? (
              <span className="hidden shrink-0 text-lg text-[var(--color-text-secondary)] sm:inline" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function EventResultsSection({
  eventResults,
  eventInputs,
  showHero = true,
}: {
  eventResults: EventResults;
  eventInputs: EventInputs;
  showHero?: boolean;
}): React.JSX.Element {
  const currency = eventInputs.currency;
  const netReturnFormatted = formatEventCurrency(eventResults.netReturn, currency);

  return (
    <div className="flex flex-col gap-8">
      {showHero ? (
        <div
          className="rounded-2xl px-8 py-12 text-center text-white md:px-12 md:py-[48px]"
          style={{
            background: "linear-gradient(135deg, #0F3D24 0%, #1A5C38 100%)",
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
            NET RETURN
          </p>
          <p
            className={[
              "font-display mt-4 text-[48px] font-normal leading-none tracking-tight sm:text-[56px] md:text-[64px]",
              isEventLossMaking(eventResults.netReturn) ? "text-[#FCA5A5]" : "text-white",
            ].join(" ")}
          >
            {netReturnFormatted}
          </p>
          <p className="mt-2 text-lg font-medium text-white/80">net return</p>
          <p
            className={[
              "mt-6 text-base font-medium",
              isEventLossMaking(eventResults.netReturn)
                ? "text-[var(--color-amber)]"
                : "text-white/90",
            ].join(" ")}
          >
            {isEventLossMaking(eventResults.netReturn)
              ? formatEventRoiSummary(eventResults)
              : `${eventResults.roiMultiplier}× return on investment · ${eventResults.roiPercentage}%`}
          </p>
        </div>
      ) : null}

      <EventMetricTilesGrid eventResults={eventResults} eventCurrency={currency} />
      <EventFunnelCards
        signups={eventResults.signups}
        attendees={eventResults.attendees}
        opportunities={eventResults.opportunities}
        clients={eventResults.clients}
      />
      <EventBenchmarkDisclaimer />
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
        tooltipKey="PROJECTED_REVENUE"
        surfaceClassName="bg-[var(--color-green-subtle)]"
      />
      <MetricTile
        label="New Customers"
        value={String(gtmeResults.newCustomers)}
        tooltipKey="NEW_CLIENTS"
        surfaceClassName="bg-[var(--color-blue-subtle)]"
      />
      <MetricTile
        label="Cost per Lead"
        value={formatCurrency(gtmeResults.costPerLead, gtmeCurrency)}
        tooltipKey="COST_PER_LEAD"
        surfaceClassName="bg-[var(--color-yellow-subtle)]"
      />
      <MetricTile
        label="Cost per Acquisition"
        value={formatCurrency(gtmeResults.costPerAcquisition, gtmeCurrency)}
        tooltipKey="COST_PER_ACQ"
        surfaceClassName="bg-[var(--color-red-subtle)]"
      />
      <MetricTile
        label="Lifetime Revenue"
        value={formatCurrency(gtmeResults.lifetimeRevenue, gtmeCurrency)}
        tooltipKey="LIFETIME_REVENUE"
        surfaceClassName="bg-[var(--color-accent-light)]"
      />
      <MetricTile
        label="Lifetime ROI"
        value={`${gtmeResults.lifetimeRoi}%`}
        tooltipKey="LIFETIME_ROI"
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
        tooltipKey="NEW_CLIENTS"
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
  const { gtmeResults, outboundResults, eventResults, gtmeInputs, outboundInputs, eventInputs } =
    state;

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

  const hasEvent = eventResults !== null;
  const hasOutbound = outboundResults !== null;
  const hasGtme = gtmeResults !== null;
  const hasAnyResults = hasEvent || hasOutbound || hasGtme;

  const showEventOnly = hasEvent && !hasOutbound && !hasGtme;
  const showClassicCombined = hasOutbound && hasGtme && !hasEvent;
  const showGtmeOnlyResults = hasGtme && !hasOutbound && !hasEvent;
  const showOutboundOnlyResults = hasOutbound && !hasGtme && !hasEvent;
  const showMultiWithEvent = hasEvent && (hasOutbound || hasGtme) && !showEventOnly;

  return (
    <section className="relative mx-auto w-full pb-24">
      {showEventOnly && eventResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10">
          <EventResultsSection eventResults={eventResults} eventInputs={eventInputs} />
        </div>
      ) : null}

      {showMultiWithEvent && eventResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10">
          <ResultsSectionDivider label="Event Lead Generation" />
          <EventResultsSection eventResults={eventResults} eventInputs={eventInputs} />
        </div>
      ) : null}

      {showClassicCombined && gtmeResults && outboundResults ? (
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
            <p
              className={[
                "mt-6 inline-block rounded-full px-3.5 py-1 text-sm font-medium",
                outboundRoiLabelBadgeClassName(getRoiLabel(outboundResults.roi)),
              ].join(" ")}
            >
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

      {showMultiWithEvent && hasOutbound && !hasGtme && outboundResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10">
          {hasEvent ? <ResultsSectionDivider label="Outbound" /> : null}
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
            <p
              className={[
                "mt-6 inline-block rounded-full px-3.5 py-1 text-sm font-medium",
                outboundRoiLabelBadgeClassName(getRoiLabel(outboundResults.roi)),
              ].join(" ")}
            >
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

      {showMultiWithEvent && hasGtme && gtmeResults && !hasOutbound ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10 lg:gap-10">
          <ResultsSectionDivider label="GTM Engineering" />
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

      {showMultiWithEvent && hasOutbound && hasGtme && outboundResults && gtmeResults ? (
        <div className="mb-8 flex flex-col gap-8 lg:mb-10 lg:gap-10">
          <ResultsSectionDivider label="Outbound & GTM Engineering" />
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
        </div>
      ) : null}

      {!hasAnyResults ? (
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
