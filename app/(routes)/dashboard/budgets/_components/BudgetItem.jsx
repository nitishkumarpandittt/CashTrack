import Link from "next/link";
import React from "react";
import formatNumber from "@/utils";

function BudgetItem({ budget }) {
  const amount = Number(budget?.amount) || 0;
  const spend = Number(budget?.totalSpend) || 0;
  const progress = amount > 0 ? Math.min((spend / amount) * 100, 100) : 0;
  const remaining = Math.max(amount - spend, 0);

  return (
    <Link
      href={`/dashboard/expenses/${budget?.id}`}
      className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2"
      aria-label={`Open ${budget?.name} budget`}
    >
      <article className="min-h-[170px] rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-5 shadow-[var(--cash-shadow-card)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[rgb(var(--cash-teal-rgb)/0.35)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--cash-mist)] text-2xl">
              {budget?.icon}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-extrabold tracking-[-0.04em] text-[var(--cash-ink)]">
                {budget.name}
              </h2>
              <p className="mt-1 text-xs text-[var(--cash-muted)]">
                {budget.totalItem || 0} {Number(budget.totalItem) === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <p className="shrink-0 font-display text-sm font-extrabold tracking-[-0.04em] text-[var(--cash-teal)]">
            Rs.{formatNumber(amount)}
          </p>
        </div>

        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-[var(--cash-muted)]">
            <span>Rs.{formatNumber(spend)} spent</span>
            <span>Rs.{formatNumber(remaining)} left</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--cash-wash)]">
            <div
              className="h-full rounded-full bg-[var(--cash-teal)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BudgetItem;
