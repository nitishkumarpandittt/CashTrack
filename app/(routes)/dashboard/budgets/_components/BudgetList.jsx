"use client";

import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { describeDbError } from "@/utils/dbErrors";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import BudgetItem from "./BudgetItem";
import MountReveal from "@/app/_components/motion/MountReveal";

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // A failed load used to render exactly like a brand-new account, so a broken
  // database connection stayed invisible until the first save failed.
  const [loadError, setLoadError] = useState(null);
  const { user } = useUser();

  const getBudgetList = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
        .groupBy(Budgets.id)
        .orderBy(desc(Budgets.id));

      setBudgetList(result);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setLoadError(describeDbError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) getBudgetList();
  }, [user]);

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
