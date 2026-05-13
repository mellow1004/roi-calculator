"use client";

import { useState } from "react";
import { services } from "@/constants/services";
import { useCalculator } from "@/lib/calculatorStore";
import type { Service } from "@/types/calculator";

const INBOUND_CAROUSEL_ORDER = [
  "performance-marketing",
  "content-marketing",
  "marketing-automation",
  "account-based-marketing",
  "channel-marketing",
] as const;

const inboundCarouselArrowClass =
  "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-base text-[var(--color-text-primary)] transition-colors duration-150 ease-out hover:bg-[var(--color-accent-light)] calculator-interactive";

function ServiceCard({
  service,
  selected,
  showComingSoonBadge = false,
  onToggle,
}: {
  service: Service;
  selected: boolean;
  showComingSoonBadge?: boolean;
  onToggle: (serviceId: string) => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onToggle(service.id)}
      className={[
        "calculator-card group relative w-full border p-4 text-left calculator-interactive",
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-px hover:border-[#9CA3AF]",
      ].join(" ")}
      aria-pressed={selected}
    >
      {showComingSoonBadge ? (
        <span
          className="absolute right-12 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: "#F3F4F6",
            color: "var(--color-text-secondary)",
            letterSpacing: "0.04em",
          }}
        >
          Coming soon
        </span>
      ) : null}
      <span
        className={[
          "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 ease-out",
          selected ? "bg-[var(--color-accent)] text-white" : "border border-[var(--color-border)] bg-transparent",
        ].join(" ")}
        aria-hidden="true"
      >
        {selected ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.312a1 1 0 0 1-1.42-.008L3.29 9.196a1 1 0 1 1 1.42-1.408l4.04 4.073 6.542-6.595a1 1 0 0 1 1.412.024Z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </span>
      <div className="pr-10">
        <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{service.name}</h3>
        {service.sublabel ? (
          <p
            className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-accent)]"
          >
            {service.sublabel}
          </p>
        ) : null}
        <p className="mt-1 text-[14px] leading-snug text-[var(--color-text-secondary)]">
          {service.description}
        </p>
      </div>
    </button>
  );
}

export default function StepSelectServices(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const [inboundPage, setInboundPage] = useState(0);

  const outboundServices = services.filter((service) => service.category === "outbound");
  const hasSelection = state.selectedServices.length > 0;

  const byInboundId = new Map(services.filter((s) => s.category === "inbound").map((s) => [s.id, s]));
  const orderedInbound = INBOUND_CAROUSEL_ORDER.map((id) => byInboundId.get(id)).filter(
    (s): s is Service => s !== undefined
  );

  let inboundCarouselPages: [Service[], Service[]];
  if (orderedInbound.length < 5) {
    const pad = [...orderedInbound];
    while (pad.length < 4) {
      pad.push(orderedInbound[0]);
    }
    const four = pad.slice(0, 4);
    inboundCarouselPages = [four, four];
  } else {
    inboundCarouselPages = [
      [orderedInbound[0], orderedInbound[1], orderedInbound[2], orderedInbound[3]],
      [orderedInbound[0], orderedInbound[1], orderedInbound[3], orderedInbound[4]],
    ];
  }

  const hasSelectedInbound = INBOUND_CAROUSEL_ORDER.some((id) => state.selectedServices.includes(id));

  const handleToggleService = (serviceId: string): void => {
    const isSelected = state.selectedServices.includes(serviceId);
    const nextSelectedServices = isSelected
      ? state.selectedServices.filter((id) => id !== serviceId)
      : [...state.selectedServices, serviceId];

    dispatch({ type: "SET_SELECTED_SERVICES", payload: nextSelectedServices });
  };

  const handleNextStep = (): void => {
    if (!hasSelection) {
      return;
    }

    dispatch({ type: "SET_SELECTED_SERVICES", payload: state.selectedServices });
    dispatch({ type: "SET_STEP", payload: "campaign-details" });
  };

  return (
    <section className="mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-display text-[40px] font-normal leading-tight text-[var(--color-text-primary)]">
          Calculate your campaign ROI
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-secondary)] mb-2">
          Select one or more Brightvision services. You&apos;ll configure each one in turn.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          We&apos;ll ask for your business email later so we can send you your personalised ROI
          report.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Outbound Services
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {outboundServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={state.selectedServices.includes(service.id)}
                onToggle={handleToggleService}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              Inbound Services <span className="font-bold normal-case tracking-normal">(Optional)</span>
            </h3>
            <button
              type="button"
              aria-label={inboundPage === 0 ? "Next inbound services" : "Previous inbound services"}
              onClick={() => setInboundPage((p) => (p === 0 ? 1 : 0))}
              className={inboundCarouselArrowClass}
            >
              {inboundPage === 0 ? "→" : "←"}
            </button>
          </div>

          <div className="grid grid-cols-1">
            <div
              className={[
                "col-start-1 row-start-1 grid grid-cols-1 gap-4 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none md:grid-cols-2 md:grid-rows-2",
                inboundPage === 0
                  ? "z-10 translate-x-0 opacity-100"
                  : "pointer-events-none z-0 translate-x-3 opacity-0",
              ].join(" ")}
              aria-hidden={inboundPage !== 0}
            >
              {inboundCarouselPages[0].map((service) => (
                <ServiceCard
                  key={`inbound-page0-${service.id}`}
                  service={service}
                  selected={state.selectedServices.includes(service.id)}
                  showComingSoonBadge
                  onToggle={handleToggleService}
                />
              ))}
            </div>
            <div
              className={[
                "col-start-1 row-start-1 grid grid-cols-1 gap-4 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none md:grid-cols-2 md:grid-rows-2",
                inboundPage === 1
                  ? "z-10 translate-x-0 opacity-100"
                  : "pointer-events-none z-0 -translate-x-3 opacity-0",
              ].join(" ")}
              aria-hidden={inboundPage !== 1}
            >
              {inboundCarouselPages[1].map((service) => (
                <ServiceCard
                  key={`inbound-page1-${service.id}`}
                  service={service}
                  selected={state.selectedServices.includes(service.id)}
                  showComingSoonBadge
                  onToggle={handleToggleService}
                />
              ))}
            </div>
          </div>
          {hasSelectedInbound ? (
            <p className="mt-2 text-xs italic text-[var(--color-text-secondary)]">
              * Inbound service calculators are coming in v2
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!hasSelection}
          className={[
            "btn-primary w-full sm:w-auto calculator-interactive",
            !hasSelection ? "pointer-events-none opacity-80" : "",
          ].join(" ")}
        >
          Next step →
        </button>
      </div>
    </section>
  );
}
