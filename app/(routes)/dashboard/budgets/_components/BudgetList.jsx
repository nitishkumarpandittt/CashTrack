"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import CreateBudget from "./CreateBudget";
import BudgetItem from "./BudgetItem";
import MountReveal from "@/app/_components/motion/MountReveal";
import { Button } from "@/components/ui/button";
import { getBudgets } from "@/app/actions/budgets";
import { callAction } from "@/utils/callAction";

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // A failed load used to render exactly like a brand-new account, so a broken
  // database connection stayed invisible until the first save failed.
  const [loadError, setLoadError] = useState(null);
  const { isLoaded } = useUser();

  // Skeletons only cover the very first load; a refresh after creating a
  // budget keeps the current cards on screen instead of flashing them away.
  // State is only touched from the promise callbacks, never synchronously,
  // which is what lets the effect below call this on mount.
  const getBudgetList = useCallback(
    () =>
      callAction(getBudgets())
        .then((rows) => {
          setBudgetList(rows);
          setLoadError(null);
        })
        .catch((error) => {
          console.error("Error fetching budgets:", error);
          setLoadError(error.message);
        })
        .finally(() => setIsLoading(false)),
    []
  );

  useEffect(() => {
    if (isLoaded) getBudgetList();
  }, [isLoaded, getBudgetList]);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CreateBudget refreshData={getBudgetList} />
        {isLoading
          ? [1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-[170px] animate-pulse rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)]"
              />
            ))
          : budgetList.length > 0
            ? budgetList.map((budget, index) => (
                // Cap the stagger so a long list still finishes promptly.
                <MountReveal key={budget.id} delay={Math.min(index * 0.05, 0.4)}>
                  <BudgetItem budget={budget} />
                </MountReveal>
              ))
            : null}
      </div>

      {!isLoading && loadError && (
        <div
          role="alert"
          className="mt-6 rounded-[24px] border border-dashed border-[rgb(var(--cash-sand-rgb)/0.9)] bg-[rgb(var(--cash-sand-rgb)/0.18)] px-6 py-10 text-center"
        >
          <p className="font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
            Your budgets could not be loaded.
          </p>
          <p className="mx-auto mt-2 max-w-xl break-words text-sm leading-6 text-[var(--cash-muted)]">
            {loadError}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={getBudgetList}
            className="mt-5 rounded-full border-[var(--cash-line)] bg-[var(--cash-paper)] hover:bg-[var(--cash-wash)]"
          >
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !loadError && budgetList.length === 0 && (
        <div className="mt-6 rounded-[24px] border border-dashed border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.6)] px-6 py-12 text-center">
          <p className="font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
            Your budget space is ready.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cash-muted)]">
            Create your first budget above to give your spending a little more direction.
          </p>
        </div>
      )}
    </div>
  );
}

export default BudgetList;
