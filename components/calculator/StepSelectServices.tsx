import { services } from "@/constants/services";
import { useCalculator } from "@/lib/calculatorStore";
import type { Service } from "@/types/calculator";

function ServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: Service;
  selected: boolean;
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
        <p className="mt-1 text-[14px] leading-snug text-[var(--color-text-secondary)]">
          {service.description}
        </p>
      </div>
    </button>
  );
}

export default function StepSelectServices(): React.JSX.Element {
  const { state, dispatch } = useCalculator();

  const outboundServices = services.filter((service) => service.category === "outbound");
  const inboundServices = services.filter((service) => service.category === "inbound");
  const hasSelection = state.selectedServices.length > 0;

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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Select services
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
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
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Inbound Services <span className="font-bold normal-case tracking-normal">(Optional)</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {inboundServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={state.selectedServices.includes(service.id)}
                onToggle={handleToggleService}
              />
            ))}
          </div>
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
