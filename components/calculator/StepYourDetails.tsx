"use client";

import type { FormEvent } from "react";
import { validateBusinessEmail } from "@/lib/emailValidation";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCalculator } from "@/lib/calculatorStore";
import type { Currency } from "@/types/calculator";

export default function StepYourDetails(): React.JSX.Element {
  const { state, dispatch } = useCalculator();
  const { leadDetails, outboundResults, gtmeResults, gtmeInputs, outboundInputs } = state;

  const emailValidation = validateBusinessEmail(leadDetails.workEmail);
  const hasTypedEmail = leadDetails.workEmail.trim().length > 0;
  const emailBorderClass = hasTypedEmail
    ? emailValidation.valid
      ? "border-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
      : "border-[#EF4444] shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
    : "border-[var(--color-border)]";

  const previewCurrency: Currency = gtmeResults ? gtmeInputs.currency : outboundInputs.currency;

  const roiHeadline = (() => {
    if (gtmeResults) {
      return `${gtmeResults.roi}%`;
    }
    if (outboundResults) {
      return `${outboundResults.roi}x`;
    }
    return "—";
  })();

  const previewTiles = (() => {
    if (gtmeResults) {
      return [
        { label: "Revenue", value: formatCurrency(gtmeResults.projectedRevenue, previewCurrency) },
        { label: "Customers", value: String(gtmeResults.newCustomers) },
        { label: "Cost/Lead", value: formatCurrency(gtmeResults.costPerLead, previewCurrency) },
        {
          label: "Cost/Acq",
          value: formatCurrency(gtmeResults.costPerAcquisition, previewCurrency),
        },
      ];
    }
    if (outboundResults) {
      return [
        { label: "Revenue", value: formatCurrency(outboundResults.arr, previewCurrency) },
        { label: "Customers", value: outboundResults.newClientsPerMonth.toFixed(1) },
        { label: "Cost/Lead", value: "—" },
        { label: "Cost/Acq", value: formatCurrency(outboundResults.cac, previewCurrency) },
      ];
    }
    return [
      { label: "Revenue", value: "—" },
      { label: "Customers", value: "—" },
      { label: "Cost/Lead", value: "—" },
      { label: "Cost/Acq", value: "—" },
    ];
  })();

  const patchLead = (partial: Partial<typeof leadDetails>): void => {
    dispatch({
      type: "SET_LEAD_DETAILS",
      payload: {
        ...leadDetails,
        ...partial,
        phoneNumber: partial.phoneNumber ?? leadDetails.phoneNumber ?? "",
      },
    });
  };

  const requiredFilled =
    leadDetails.fullName.trim() !== "" &&
    leadDetails.companyName.trim() !== "" &&
    emailValidation.valid;
  const canSubmit = requiredFilled && leadDetails.gdprConsent;

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    dispatch({
      type: "SET_LEAD_DETAILS",
      payload: {
        fullName: leadDetails.fullName.trim(),
        companyName: leadDetails.companyName.trim(),
        workEmail: leadDetails.workEmail.trim(),
        phoneNumber: (leadDetails.phoneNumber ?? "").trim(),
        gdprConsent: leadDetails.gdprConsent,
      },
    });
    dispatch({ type: "SET_STEP", payload: "results" });
  };

  const inputBase =
    "w-full rounded-lg border px-4 py-3 text-[15px] text-[var(--color-text-primary)] transition-all duration-150 ease-out focus:outline-none";

  return (
    <section className="mx-auto w-full">
      <div className="mb-8 lg:mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Your details
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Enter your business details to unlock your personalised ROI report.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <form id="your-details-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="full-name" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              value={leadDetails.fullName}
              onChange={(e) => patchLead({ fullName: e.target.value })}
              className={`${inputBase} border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]`}
            />
          </div>

          <div>
            <label htmlFor="company-name" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              autoComplete="organization"
              value={leadDetails.companyName}
              onChange={(e) => patchLead({ companyName: e.target.value })}
              className={`${inputBase} border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]`}
            />
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="work-email" className="text-sm font-medium text-[var(--color-text-primary)]">
                Work Email
              </label>
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-amber)]">
                BUSINESS EMAIL REQUIRED
              </span>
            </div>
            <input
              id="work-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={leadDetails.workEmail}
              onChange={(e) => patchLead({ workEmail: e.target.value })}
              className={[
                inputBase,
                hasTypedEmail
                  ? emailValidation.valid
                    ? "focus:border-[#10B981] focus:ring-[3px] focus:ring-[rgba(16,185,129,0.12)]"
                    : "focus:border-[#EF4444] focus:ring-[3px] focus:ring-[rgba(239,68,68,0.12)]"
                  : "focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]",
                emailBorderClass,
              ].join(" ")}
            />
            {hasTypedEmail && emailValidation.message ? (
              <p className="mt-1.5 text-sm text-[#EF4444]">{emailValidation.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
              Phone Number <span className="font-normal text-[var(--color-text-secondary)]">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={leadDetails.phoneNumber ?? ""}
              onChange={(e) => patchLead({ phoneNumber: e.target.value })}
              className={`${inputBase} border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[rgba(26,92,56,0.12)]`}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="gdpr"
              type="checkbox"
              checked={leadDetails.gdprConsent}
              onChange={(e) => patchLead({ gdprConsent: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            <label htmlFor="gdpr" className="text-sm text-[var(--color-text-primary)]">
              I agree to Brightvision&apos;s Privacy Policy and consent to receiving my ROI report
              via email.
            </label>
          </div>
        </form>

        <div className="calculator-card relative overflow-hidden p-6 lg:p-8">
          <div className="pointer-events-none select-none">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              ROI preview
            </p>
            <p className="font-display mt-4 text-center text-[48px] font-normal leading-none text-[var(--color-accent)] [filter:blur(6px)]">
              {roiHeadline}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {previewTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {tile.label}
                  </p>
                  <p className="mt-1 font-display text-lg font-normal tabular-nums text-[var(--color-text-primary)]">
                    {tile.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 px-6 text-center backdrop-blur-[2px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-12 w-12 text-[var(--color-text-primary)]"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V12.8a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="max-w-xs text-sm font-semibold text-[var(--color-text-primary)]">
              Submit your details to unlock
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_STEP", payload: "performance" })}
          className="btn-ghost w-full sm:w-auto calculator-interactive"
        >
          ← Back
        </button>
        <button
          type="submit"
          form="your-details-form"
          disabled={!canSubmit}
          className={[
            "calculator-interactive w-full rounded-[10px] text-base font-semibold text-white transition-all duration-150 sm:max-w-xs sm:flex-1",
            "h-[52px] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] enabled:hover:-translate-y-px",
            !canSubmit ? "cursor-not-allowed bg-[#D1D5DB] text-[#9CA3AF] hover:translate-y-0" : "",
          ].join(" ")}
        >
          Reveal my ROI report 🔒
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
        Your data is secure and GDPR compliant
      </p>
    </section>
  );
}
