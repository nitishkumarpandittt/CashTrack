"use client";

import React, { useEffect, useMemo, useState } from "react";
import CreateIncomes from "./CreateIncomes";
import { db } from "@/utils/dbConfig";
import { desc, eq, sql } from "drizzle-orm";
import { Budgets, Expenses, Incomes } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import IncomeItem from "./IncomeItem";
import MountReveal from "@/app/_components/motion/MountReveal";

function IncomeList() {
  const [incomeList, setIncomeList] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const totalIncome = useMemo(
    () => incomeList.reduce((sum, income) => sum + (Number(income.amount) || 0), 0),
    [incomeList]
  );

  const getIncomeList = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Total spend comes along so each card can say what share of actual
      // spending it covers, rather than showing a decorative bar.
      const [result, spendResult] = await Promise.all([
        db
          .select()
          .from(Incomes)
          .where(eq(Incomes.createdBy, user.primaryEmailAddress.emailAddress))
          .orderBy(desc(Incomes.id)),
        db
          .select({ total: sql`coalesce(sum(${Expenses.amount}), 0)`.mapWith(Number) })
          .from(Expenses)
          .leftJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
          .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress)),
      ]);
      setIncomeList(result);
      setTotalSpend(spendResult?.[0]?.total || 0);
    } catch (error) {
      console.error("Error fetching income streams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) getIncomeList();
  }, [user]);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CreateIncomes refreshData={getIncomeList} />
        {isLoading
          ? [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-[170px] animate-pulse rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)]" />
            ))
          : incomeList.length > 0
            ? incomeList.map((income, index) => (
                // Cap the stagger so a long list still finishes promptly.
                <MountReveal key={income.id} delay={Math.min(index * 0.05, 0.4)}>
                  <IncomeItem
                    budget={income}
                    refreshData={getIncomeList}
                    totalSpend={totalSpend}
                  />
                </MountReveal>
              ))
            : null}
      </div>

      {!isLoading && incomeList.length === 0 && (
        <div className="mt-6 rounded-[24px] border border-dashed border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.6)] px-6 py-12 text-center">
          <p className="font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
            No income streams yet.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cash-muted)]">
            Add a source above so your dashboard can understand the full picture.
          </p>
        </div>
      )}
    </div>
  );
}

export default IncomeList;
