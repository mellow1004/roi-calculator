import type { CalculatorStep } from "@/types/calculator";

interface StepIndicatorProps {
  currentStep: CalculatorStep;
  selectedServices: string[];
}

interface StepConfig {
  key: CalculatorStep;
  label: string;
}

const steps: StepConfig[] = [
  { key: "select-services", label: "Select services" },
  { key: "campaign-details", label: "Campaign details" },
  { key: "performance", label: "Performance" },
  { key: "your-details", label: "Your details" },
  { key: "results", label: "Results" },
];

export default function StepIndicator({
  currentStep,
  selectedServices,
}: StepIndicatorProps): React.JSX.Element {
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);
  const hasGTME = selectedServices.includes("gtme");
  const hasOutbound = selectedServices.some((serviceId) => serviceId !== "gtme");
  const hasBothOutboundAndGTME = hasGTME && hasOutbound;

  return (
    <nav
      className="w-full border-b border-[var(--color-border)] py-8"
      aria-label="Calculator progress"
      data-has-both-services={hasBothOutboundAndGTME ? "true" : "false"}
    >
      <ol className="flex w-full items-start justify-between gap-2 md:gap-3">
        {steps.map((step, index) => {
          const isCurrent = step.key === currentStep;
          const isCompleted =
            currentStepIndex !== -1 && index < currentStepIndex && !isCurrent;
          const isUpcoming = currentStepIndex !== -1 && index > currentStepIndex;
          const showConnector = index < steps.length - 1;
          const isConnectorComplete = currentStepIndex !== -1 && index < currentStepIndex;

          return (
            <li
              key={step.key}
              className="relative flex flex-1 flex-col items-center text-center"
              style={{ zIndex: index + 1 }}
            >
              <div className="flex w-full items-center justify-center">
                <div
                  className={[
                    "relative z-30 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-150 ease-out",
                    isCompleted
                      ? "bg-[var(--color-accent)] text-white"
                      : isCurrent
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[#E5E7EB] text-[#9CA3AF]",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.312a1 1 0 0 1-1.42-.008L3.29 9.196a1 1 0 1 1 1.42-1.408l4.04 4.073 6.542-6.595a1 1 0 0 1 1.412.024Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {showConnector ? (
                  <div
                    className={[
                      "absolute left-1/2 top-[18px] h-0.5 w-full",
                      isConnectorComplete
                        ? "bg-[var(--color-accent)]"
                        : "bg-[#E5E7EB]",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                ) : null}
              </div>

              <span
                className={[
                  "mt-2 text-xs md:text-sm transition-colors duration-150 ease-out",
                  isCurrent
                    ? "font-semibold text-[var(--color-text-primary)]"
                    : isUpcoming
                      ? "font-normal text-[#9CA3AF]"
                      : "font-medium text-[var(--color-text-secondary)]",
                ].join(" ")}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
