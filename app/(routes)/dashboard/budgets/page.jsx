import React from "react";
import { ArrowUpRight, PiggyBank } from "lucide-react";
import BudgetList from "./_components/BudgetList";

function Budget() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:px-8 md:py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-teal)]">
            <PiggyBank className="h-3.5 w-3.5" aria-hidden="true" />
            Your guardrails
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.08em] text-[var(--cash-ink)] sm:text-5xl">
            My budgets
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--cash-muted)]">
            Give every priority a clear limit, then let CashTrack show you what is left.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[var(--cash-line)] bg-[var(--cash-paper)] px-4 py-2.5 text-xs font-bold text-[var(--cash-muted)] shadow-sm md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cash-emerald)]" aria-hidden="true" />
          Add a budget to get started
          <ArrowUpRight className="h-3.5 w-3.5 text-[var(--cash-teal)]" aria-hidden="true" />
        </div>
      </div>
      <BudgetList />
    </div>
  );
}

export default Budget;
