"use client";

/**
 * Flow conditions (see getFlowConditions in /lib/flowConditions.ts):
 * - hasClassicOutbound = sdr-team or ae-team
 * - hasEvent = event-lead-gen
 * - hasGTME = gtme
 */

import StepCampaignDetailsEvent from "@/components/calculator/StepCampaignDetailsEvent";
import StepCampaignDetailsGTME from "@/components/calculator/StepCampaignDetailsGTME";
import StepCampaignDetailsOutbound from "@/components/calculator/StepCampaignDetailsOutbound";
import { useCalculator } from "@/lib/calculatorStore";
import { getFlowConditions } from "@/lib/flowConditions";
import { calculateEventResults } from "@/lib/formulas/event";
import { calculateOutboundResults, getCostPerMeetingForCurrency } from "@/lib/formulas/outbound";
import type { EventInputs } from "@/lib/formulas/event";
import type { GTMEInputs } from "@/types/calculator";

const INBOUND_SERVICE_IDS = [
  "performance-marketing",
  "content-marketing",
  "marketing-automation",
  "account-based-marketing",
  "channel-marketing",
] as const;

function ServiceDivider({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="my-12 flex items-center gap-4">
      <div className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
      <p className="shrink-0 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <div className="h-px flex-1 bg-[var(--color-border)]" aria-hidden="true" />
    </div>
  );
}

function CombinedFooter({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}): React.JSX.Element {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
      <button type="button" onClick={onBack} className="btn-ghost w-full sm:w-auto calculator-interactive">
        ← Back
      </button>
      <button type="button" onClick={onNext} className="btn-primary w-full sm:w-auto calculator-interactive">
        Next step →
      </button>
    </div>
  );
}

function snapshotEventInputs(eventInputs: EventInputs): Partial<EventInputs> {
  return {
    eventFormat: eventInputs.eventFormat,
    industryVertical: eventInputs.industryVertical,
    campaignService: eventInputs.campaignService,
    currency: eventInputs.currency,
    totalBudget: eventInputs.totalBudget,
    averageNewClientROI: eventInputs.averageNewClientROI,
  };
}

function snapshotGtmeCampaignInputs(gtmeInputs: GTMEInputs): Partial<GTMEInputs> {
  return {
    currency: gtmeInputs.currency,
    totalBudget: gtmeInputs.totalBudget,
    averageDealSize: gtmeInputs.averageDealSize,
    durationMonths: gtmeInputs.durationMonths,
  };
}

export default function StepCampaignDetails(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { selectedServices, outboundInputs, gtmeInputs, eventInputs } = state;

  const {
    hasClassicOutbound,
    hasEvent,
    isCombined,
    isEventOnly,
    isEventOutboundCombined,
    isEventGtmeCombined,
    isTripleCombined,
    isOutboundOnly,
    isGTMEOnly,
  } = getFlowConditions(selectedServices);

  const hasInbound = selectedServices.some((id) =>
    (INBOUND_SERVICE_IDS as readonly string[]).includes(id)
  );
  const isInboundOnly = hasInbound && !hasClassicOutbound && !hasEvent && !state.selectedServices.includes("gtme");

  const goBack = (): void => {
    dispatch({ type: "SET_STEP", payload: "select-services" });
  };

  const saveEventResults = (): void => {
    const computed = calculateEventResults(eventInputs);
    dispatch({ type: "UPDATE_EVENT_INPUTS", payload: snapshotEventInputs(eventInputs) });
    dispatch({ type: "SET_EVENT_RESULTS", payload: computed });
  };

  const saveOutboundResults = (): void => {
    const costPerMeeting = getCostPerMeetingForCurrency(outboundInputs.currency);
    const isAEService =
      selectedServices.includes("ae-team") && !selectedServices.includes("sdr-team");
    dispatch({
      type: "SET_OUTBOUND_RESULTS",
      payload: calculateOutboundResults(outboundInputs, costPerMeeting, isAEService),
    });
  };

  const saveGtmeCampaignInputs = (): void => {
    dispatch({ type: "UPDATE_GTME_INPUTS", payload: snapshotGtmeCampaignInputs(gtmeInputs) });
  };

  const goToPerformance = (): void => {
    dispatch({ type: "SET_STEP", payload: "performance" });
  };

  const handleClassicCombinedNext = (): void => {
    saveOutboundResults();
    saveGtmeCampaignInputs();
    goToPerformance();
  };

  const handleEventOutboundCombinedNext = (): void => {
    saveOutboundResults();
    saveEventResults();
    goToPerformance();
  };

  const handleEventGtmeCombinedNext = (): void => {
    saveEventResults();
    saveGtmeCampaignInputs();
    goToPerformance();
  };

  const handleTripleCombinedNext = (): void => {
    saveOutboundResults();
    saveEventResults();
    saveGtmeCampaignInputs();
    goToPerformance();
  };

  if (isTripleCombined) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <StepCampaignDetailsOutbound hideNavigation />
        <ServiceDivider label="Event Lead Generation" />
        <StepCampaignDetailsEvent hideNavigation />
        <ServiceDivider label="GTM Engineering" />
        <StepCampaignDetailsGTME hideNavigation />
        <CombinedFooter onBack={goBack} onNext={handleTripleCombinedNext} />
      </div>
    );
  }

  if (isCombined) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <StepCampaignDetailsOutbound hideNavigation />
        <ServiceDivider label="GTM Engineering" />
        <StepCampaignDetailsGTME hideNavigation />
        <CombinedFooter onBack={goBack} onNext={handleClassicCombinedNext} />
      </div>
    );
  }

  if (isEventOutboundCombined) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <StepCampaignDetailsOutbound hideNavigation />
        <ServiceDivider label="Event Lead Generation" />
        <StepCampaignDetailsEvent hideNavigation />
        <CombinedFooter onBack={goBack} onNext={handleEventOutboundCombinedNext} />
      </div>
    );
  }

  if (isEventGtmeCombined) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <StepCampaignDetailsEvent hideNavigation />
        <ServiceDivider label="GTM Engineering" />
        <StepCampaignDetailsGTME hideNavigation />
        <CombinedFooter onBack={goBack} onNext={handleEventGtmeCombinedNext} />
      </div>
    );
  }

  if (isEventOnly) {
    return <StepCampaignDetailsEvent />;
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
            onClick={goBack}
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
