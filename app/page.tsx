"use client";

/**
 * Flow conditions (see getFlowConditions in /lib/flowConditions.ts):
 * - hasOutbound = selectedServices includes any of: sdr-team, ae-team, event-lead-gen
 * - hasEvent = selectedServices includes: event-lead-gen
 * - hasGTME = selectedServices includes: gtme
 * - isCombined = hasOutbound && hasGTME
 * - isOutboundOnly = hasOutbound && !hasGTME
 * - isGTMEOnly = hasGTME && !hasOutbound
 */

import { useEffect } from "react";
import StepCampaignDetails from "@/components/calculator/StepCampaignDetails";
import StepConfirmation from "@/components/calculator/StepConfirmation";
import StepIndicator from "@/components/calculator/StepIndicator";
import StepPerformance from "@/components/calculator/StepPerformance";
import StepResults from "@/components/calculator/StepResults";
import StepSelectServices from "@/components/calculator/StepSelectServices";
import StepYourDetails from "@/components/calculator/StepYourDetails";
import { CalculatorProvider, useCalculator } from "@/lib/calculatorStore";
import { getFlowConditions } from "@/lib/flowConditions";
import { calculateOutboundResults, getCostPerMeetingForCurrency } from "@/lib/formulas/outbound";
import type { CalculatorStep } from "@/types";

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
    case "confirmation":
      return <StepConfirmation />;
    case "results":
      return <StepResults />;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

function CalculatorShell(): React.JSX.Element {
  const { state, dispatch } = useCalculator();

  const { isOutboundOnly } = getFlowConditions(state.selectedServices);

  useEffect(() => {
    if (state.currentStep !== "performance" || !isOutboundOnly) {
      return;
    }
    if (state.outboundResults !== null) {
      return;
    }
    const costPerMeeting = getCostPerMeetingForCurrency(state.outboundInputs.currency);
    const isAEService = state.selectedServices.includes("ae-team");
    dispatch({
      type: "SET_OUTBOUND_RESULTS",
      payload: calculateOutboundResults(state.outboundInputs, costPerMeeting, isAEService),
    });
  }, [
    dispatch,
    isOutboundOnly,
    state.currentStep,
    state.outboundInputs,
    state.outboundResults,
    state.selectedServices,
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
