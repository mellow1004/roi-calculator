"use client";

/**
 * Flow conditions (from selectedServices):
 * - hasOutbound = selectedServices includes any of: sdr-team, ae-team, event-lead-gen
 * - hasGTME = selectedServices includes: gtme
 * - isCombined = hasOutbound && hasGTME
 * - isOutboundOnly = hasOutbound && !hasGTME
 * - isGTMEOnly = hasGTME && !hasOutbound
 */

import StepCampaignDetailsGTME from "@/components/calculator/StepCampaignDetailsGTME";
import StepCampaignDetailsOutbound from "@/components/calculator/StepCampaignDetailsOutbound";
import { useCalculator } from "@/lib/calculatorStore";
import { calculateOutboundResults, getCostPerMeetingForCurrency } from "@/lib/formulas/outbound";

const OUTBOUND_SERVICE_IDS = ["sdr-team", "ae-team", "event-lead-gen"] as const;
const INBOUND_SERVICE_IDS = [
  "performance-marketing",
  "content-marketing",
  "marketing-automation",
  "account-based-marketing",
  "channel-marketing",
] as const;

export default function StepCampaignDetails(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { selectedServices, outboundInputs, gtmeInputs } = state;

  const hasOutbound = selectedServices.some((id) =>
    (OUTBOUND_SERVICE_IDS as readonly string[]).includes(id)
  );
  const hasGTME = selectedServices.includes("gtme");
  const isCombined = hasOutbound && hasGTME;
  const isOutboundOnly = hasOutbound && !hasGTME;
  const isGTMEOnly = hasGTME && !hasOutbound;
  const hasInbound = selectedServices.some((id) =>
    (INBOUND_SERVICE_IDS as readonly string[]).includes(id)
  );
  const isInboundOnly = hasInbound && !hasOutbound && !hasGTME;

  const handleCombinedNext = (): void => {
    const costPerMeeting = getCostPerMeetingForCurrency(outboundInputs.currency);
    const outboundComputed = calculateOutboundResults(outboundInputs, costPerMeeting);
    dispatch({ type: "SET_OUTBOUND_RESULTS", payload: outboundComputed });
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

  if (isCombined) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <StepCampaignDetailsOutbound hideNavigation />

        <div className="my-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
          <p className="shrink-0 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            GTM Engineering
          </p>
          <div className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
        </div>

        <StepCampaignDetailsGTME hideNavigation />

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_STEP", payload: "select-services" })}
            className="btn-ghost w-full sm:w-auto calculator-interactive"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleCombinedNext}
            className="btn-primary w-full sm:w-auto calculator-interactive"
          >
            Next step →
          </button>
        </div>
      </div>
    );
  }

  if (isOutboundOnly) {
    return <StepCampaignDetailsOutbound />;
  }

  if (isGTMEOnly) {
    return <StepCampaignDetailsGTME />;
  }

  if (isInboundOnly) {
    return (
      <section className="mx-auto w-full max-w-[600px] px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-3xl">
          🚀
        </div>
        <h2 className="font-display text-[32px] leading-tight text-[var(--color-text-primary)]">
          Inbound calculators are coming soon
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-[1.6] text-[var(--color-text-secondary)]">
          We&apos;re building ROI calculators for Performance Marketing, Content Marketing,
          Marketing Automation, Account-Based Marketing, and Channel Marketing. In the meantime,
          our experts can walk you through the numbers personally.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <a
            href="https://www.brightvision.com/contact"
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex h-[52px] w-full max-w-[320px] items-center justify-center calculator-interactive"
          >
            Book a call with an expert →
          </a>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_STEP", payload: "select-services" })}
            className="border-0 bg-transparent text-sm text-[var(--color-text-secondary)] calculator-interactive"
          >
            ← Choose different services
          </button>
        </div>
      </section>
    );
  }

  return <StepCampaignDetailsOutbound />;
}
