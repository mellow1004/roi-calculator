"use client";

import { formatCurrency, formatEventCurrency } from "@/lib/formatCurrency";
import { useCalculator } from "@/lib/calculatorStore";

function firstNameFromFullName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return "there";
  }
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export default function StepConfirmation(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { leadDetails, gtmeResults, outboundResults, eventResults, gtmeInputs, outboundInputs, eventInputs } =
    state;

  const firstName = firstNameFromFullName(leadDetails.fullName);
  const workEmail = leadDetails.workEmail.trim();
  const companyName = leadDetails.companyName.trim() || "your company";

  const gtmeCurrency = gtmeInputs.currency;
  const outboundCurrency = outboundInputs.currency;
  const eventCurrency = eventInputs.currency;

  const gridCells = (() => {
    if (eventResults) {
      return [
        {
          label: "Net Return",
          value: formatEventCurrency(eventResults.netReturn, eventCurrency),
        },
        { label: "New Clients", value: String(eventResults.clients) },
        {
          label: "Campaign Cost",
          value: formatEventCurrency(eventResults.campaignCost, eventCurrency),
        },
        {
          label: "ROI",
          value: eventResults.isBreakEven
            ? `${eventResults.roiMultiplier}× · ${eventResults.roiPercentage}%`
            : `Below break-even · −${Math.abs(eventResults.roiPercentage)}%`,
        },
      ];
    }
    if (gtmeResults && outboundResults) {
      return [
        { label: "ROI", value: `${gtmeResults.roi}%` },
        { label: "Revenue", value: formatCurrency(gtmeResults.projectedRevenue, gtmeCurrency) },
        { label: "Customers", value: String(gtmeResults.newCustomers) },
        { label: "Lifetime", value: formatCurrency(gtmeResults.lifetimeRevenue, gtmeCurrency) },
      ];
    }
    if (gtmeResults) {
      return [
        { label: "ROI", value: `${gtmeResults.roi}%` },
        { label: "Revenue", value: formatCurrency(gtmeResults.projectedRevenue, gtmeCurrency) },
        { label: "Customers", value: String(gtmeResults.newCustomers) },
        { label: "Lifetime", value: formatCurrency(gtmeResults.lifetimeRevenue, gtmeCurrency) },
      ];
    }
    if (outboundResults) {
      return [
        { label: "ROI", value: `${outboundResults.roi}x` },
        { label: "CAC", value: formatCurrency(outboundResults.cac, outboundCurrency) },
        { label: "ARR", value: formatCurrency(outboundResults.arr, outboundCurrency) },
        { label: "LTV", value: formatCurrency(outboundResults.ltv, outboundCurrency) },
      ];
    }
    return [
      { label: "ROI", value: "—" },
      { label: "Revenue", value: "—" },
      { label: "Customers", value: "—" },
      { label: "Lifetime", value: "—" },
    ];
  })();

  return (
    <section className="mx-auto w-full max-w-[600px] px-0 py-12 md:py-16 lg:py-20">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.312a1 1 0 0 1-1.42-.008L3.29 9.196a1 1 0 1 1 1.42-1.408l4.04 4.073 6.542-6.595a1 1 0 0 1 1.412.024Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="font-display mt-6 text-[36px] font-normal leading-tight text-[var(--color-text-primary)]">
          Your ROI report is on its way!
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          We&apos;ve sent a detailed breakdown to{" "}
          <span className="font-medium text-[var(--color-text-primary)]">{workEmail || "your inbox"}</span>
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white"
            aria-hidden="true"
          >
            BV
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Brightvision</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Your Personalised ROI Report</p>
          </div>
        </div>

        <hr className="my-5 border-[var(--color-border)]" />

        <p className="text-left text-[15px] text-[var(--color-text-primary)]">
          Hi {firstName},
        </p>
        <p className="mt-3 text-left text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          Here&apos;s your projected ROI for {companyName} based on the services you selected:
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {gridCells.map((cell) => (
            <div key={cell.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
                {cell.label}
              </p>
              <p className="font-display mt-1 text-[20px] font-normal tabular-nums text-[var(--color-accent)]">
                {cell.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="pointer-events-none mt-6 w-full rounded-lg bg-[var(--color-accent)] py-3 text-center text-[15px] font-semibold text-white"
          aria-hidden="true"
        >
          Book a strategy call →
        </div>
      </div>

      <div className="mt-10 flex flex-col items-stretch gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_STEP", payload: "results" })}
          className="calculator-interactive h-[52px] w-full rounded-[10px] bg-[var(--color-accent)] text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-accent-hover)] hover:-translate-y-px"
        >
          View your full ROI report →
        </button>
        <a
          href="https://www.brightvision.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-[14px] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
        >
          ← Back to Brightvision.com
        </a>
      </div>
    </section>
  );
}
