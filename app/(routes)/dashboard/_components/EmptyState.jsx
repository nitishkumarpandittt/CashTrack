import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Shared "nothing here yet" panel.
 *
 * Matches the dashed-border language already used by BudgetList and
 * IncomeList, so an empty dashboard reads as deliberate rather than as
 * something still loading — which is exactly what the pulsing skeletons used
 * to imply when a list was simply empty.
 */
function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`rounded-[24px] border border-dashed border-[var(--cash-line)] bg-white/60 text-center ${
        compact ? "px-5 py-8" : "px-6 py-12"
      } ${className}`}
    >
      {Icon ? (
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cash-wash)] text-[var(--cash-teal)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}

      <p className="font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
        {title}
      </p>

      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cash-muted)]">
          {description}
        </p>
      ) : null}

      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-full bg-[var(--cash-teal)] px-5 py-2.5 text-sm font-bold text-white shadow-[var(--cash-shadow-button)] transition-colors hover:bg-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2"
        >
          {actionLabel}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export default EmptyState;
