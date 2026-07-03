export function EventBenchmarkDisclaimer({
  compact = false,
}: {
  /** Shorter copy and 12px text for inline panels. */
  compact?: boolean;
}): React.JSX.Element {
  return (
    <div
      className="rounded-lg border-l-4 border-[var(--color-amber)] bg-[#FFFBEB] leading-snug text-[#92400E]"
      style={
        compact
          ? { padding: "10px 14px", fontSize: "12px" }
          : { padding: "14px 16px", fontSize: "13px" }
      }
    >
      <span aria-hidden="true">⚠️ </span>
      {compact
        ? "Projections based on Brightvision campaign benchmarks."
        : "These are projections, not guarantees. Funnel rates are based on Brightvision benchmarks from past campaigns. Actual results may vary depending on your market, messaging, and audience."}
    </div>
  );
}
