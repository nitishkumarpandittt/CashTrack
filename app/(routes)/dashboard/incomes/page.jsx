import React from "react";
import { CircleDollarSign } from "lucide-react";
import IncomeList from "./_components/IncomeList";

function Income() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:px-8 md:py-10">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-teal)]">
          <CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
          Money coming in
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.08em] text-[var(--cash-ink)] sm:text-5xl">
          My income streams
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--cash-muted)]">
          Keep the sources behind your financial momentum in one clear place.
        </p>
      </div>
      <IncomeList />
    </div>
  );
}

export default Income;
