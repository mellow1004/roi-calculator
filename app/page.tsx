"use client";

/**
 * Flow conditions (from selectedServices):
 * - hasOutbound = selectedServices includes any of: sdr-team, ae-team, event-lead-gen
 * - hasGTME = selectedServices includes: gtme
 * - isCombined = hasOutbound && hasGTME
 * - isOutboundOnly = hasOutbound && !hasGTME
 * - isGTMEOnly = hasGTME && !hasOutbound
 */

import { useEffect } from "react";
import StepCampaignDetails from "@/components/calculator/StepCampaignDetails";
import StepIndicator from "@/components/calculator/StepIndicator";
import StepPerformance from "@/components/calculator/StepPerformance";
import StepResults from "@/components/calculator/StepResults";
import StepSelectServices from "@/components/calculator/StepSelectServices";
import StepYourDetails from "@/components/calculator/StepYourDetails";
import { CalculatorProvider, useCalculator } from "@/lib/calculatorStore";
import { calculateOutboundResults } from "@/lib/formulas/outbound";
import type { CalculatorStep } from "@/types/calculator";

const OUTBOUND_SERVICE_IDS = ["sdr-team", "ae-team", "event-lead-gen"] as const;

function stepContent(step: CalculatorStep): React.JSX.Element {
  switch (step) {
    case "select-services":
      return <StepSelectServices />;
    case "campaign-details":
      return <StepCampaignDetails />;
    case "performance":
      return <StepPerformance />;
    case "your-details":
      return <StepYourDetails />;
    case "results":
      return <StepResults />;
    default:
      return <StepSelectServices />;
  }
}

function CalculatorShell(): React.JSX.Element {
  const { state, dispatch } = useCalculator();

  const hasGTME = state.selectedServices.includes("gtme");
  const hasOutbound = state.selectedServices.some((id) =>
    (OUTBOUND_SERVICE_IDS as readonly string[]).includes(id)
  );
  const isOutboundOnly = hasOutbound && !hasGTME;

  useEffect(() => {
    if (state.currentStep !== "performance" || !isOutboundOnly) {
      return;
    }
    if (state.outboundResults !== null) {
      return;
    }
    dispatch({
      type: "SET_OUTBOUND_RESULTS",
      payload: calculateOutboundResults(state.outboundInputs),
    });
  }, [
    dispatch,
    isOutboundOnly,
    state.currentStep,
    state.outboundInputs,
    state.outboundResults,
  ]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-20">
      <StepIndicator currentStep={state.currentStep} selectedServices={state.selectedServices} />

      <div className="pt-10">{stepContent(state.currentStep)}</div>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      <CalculatorProvider>
        <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
          <span className="text-[18px] font-bold tracking-tight text-[var(--color-accent)]">
            ▼ Brightvision
          </span>
        </header>
        <CalculatorShell />
      </CalculatorProvider>
    </div>
  );
}
