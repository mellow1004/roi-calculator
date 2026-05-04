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
import { calculateOutboundResults } from "@/lib/formulas/outbound";

const OUTBOUND_SERVICE_IDS = ["sdr-team", "ae-team", "event-lead-gen"] as const;

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

  const handleCombinedNext = (): void => {
    const outboundComputed = calculateOutboundResults(outboundInputs);
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

  return <StepCampaignDetailsOutbound />;
}
