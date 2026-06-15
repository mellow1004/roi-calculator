export const OUTBOUND_SERVICE_IDS = ["sdr-team", "ae-team", "event-lead-gen"] as const;
export const CLASSIC_OUTBOUND_SERVICE_IDS = ["sdr-team", "ae-team"] as const;
export const EVENT_SERVICE_ID = "event-lead-gen";

export function getFlowConditions(selectedServices: string[]): {
  hasOutbound: boolean;
  hasClassicOutbound: boolean;
  hasEvent: boolean;
  hasGTME: boolean;
  isCombined: boolean;
  isEventOnly: boolean;
  isEventOutboundCombined: boolean;
  isEventGtmeCombined: boolean;
  isTripleCombined: boolean;
  isOutboundOnly: boolean;
  isGTMEOnly: boolean;
} {
  const hasEvent = selectedServices.includes(EVENT_SERVICE_ID);
  const hasGTME = selectedServices.includes("gtme");
  const hasClassicOutbound = selectedServices.some((id) =>
    (CLASSIC_OUTBOUND_SERVICE_IDS as readonly string[]).includes(id)
  );
  const hasOutbound = hasClassicOutbound || hasEvent;

  return {
    hasOutbound,
    hasClassicOutbound,
    hasEvent,
    hasGTME,
    isCombined: hasClassicOutbound && hasGTME && !hasEvent,
    isEventOnly: hasEvent && !hasGTME && !hasClassicOutbound,
    isEventOutboundCombined: hasEvent && hasClassicOutbound && !hasGTME,
    isEventGtmeCombined: hasEvent && hasGTME && !hasClassicOutbound,
    isTripleCombined: hasEvent && hasClassicOutbound && hasGTME,
    isOutboundOnly: hasClassicOutbound && !hasGTME && !hasEvent,
    isGTMEOnly: hasGTME && !hasClassicOutbound && !hasEvent,
  };
}
