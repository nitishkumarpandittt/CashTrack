"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses, Incomes } from "@/utils/schema";

const CardInfo = lazy(() => import("./_components/CardInfo"));
const BarChartDashboard = lazy(() => import("./_components/BarChartDashboard"));
const BudgetItem = lazy(() => import("./budgets/_components/BudgetItem"));
const ExpenseListTable = lazy(() => import("./expenses/_components/ExpenseListTable"));

import { CardLoader, ChartLoader, TableLoader } from "@/app/_components/LoadingSpinner";
import MountReveal from "@/app/_components/motion/MountReveal";
import EmptyState from "./_components/EmptyState";

const CardInfoSkeleton = () => (
  <div className="space-y-4">
    <div className="h-64 animate-pulse rounded-[28px] border border-[var(--cash-line)] bg-white" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <CardLoader key={item} className="h-28 rounded-[24px]" />
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="rounded-[28px] border border-[var(--cash-line)] bg-white p-6">
    <ChartLoader />
  </div>
);

const TableSkeleton = () => (
  <div className="rounded-[28px] border border-[var(--cash-line)] bg-white p-6">
    <TableLoader rows={5} />
  </div>
);

const BudgetSkeleton = () => <CardLoader className="h-[170px] rounded-[24px]" />;

function Dashboard() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getBudgetList = useCallback(async () => {
    // Bail out *and* clear the loading flag — returning while it is still true
    // is the same "skeletons forever" trap, just reached a different way.
    if (!user?.primaryEmailAddress?.emailAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [budgetResult, expensesResult, incomeResult] = await Promise.all([
        db
          .select({
            ...getTableColumns(Budgets),
            totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
            totalItem: sql`count(${Expenses.id})`.mapWith(Number),
          })
          .from(Budgets)
          .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
          .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
          .groupBy(Budgets.id)
          .orderBy(desc(Budgets.id)),
        db
          .select({
            id: Expenses.id,
            name: Expenses.name,
            amount: Expenses.amount,
            createdAt: Expenses.createdAt,
          })
          .from(Budgets)
          .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
          .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
          .orderBy(desc(Expenses.id)),
        db
          .select()
          .from(Incomes)
          .where(eq(Incomes.createdBy, user.primaryEmailAddress.emailAddress))
          .orderBy(desc(Incomes.id)),
      ]);

      setBudgetList(budgetResult);
      setExpensesList(expensesResult);
      setIncomeList(incomeResult);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (user) getBudgetList();
  }, [user, getBudgetList]);

  const refreshData = useCallback(() => getBudgetList(), [getBudgetList]);

  const budgetItems = useMemo(() => {
    // Loading and empty are different states. Conflating them left an account
    // with no budgets showing skeletons that pulsed indefinitely.
    if (isLoading) {
      return [1, 2, 3].map((item) => <BudgetSkeleton key={item} />);
    }

    if (budgetList.length === 0) {
      return (
        <EmptyState
          compact
          title="No budgets yet"
          description="Your most recent budgets will show up here."
          actionLabel="Add one"
          actionHref="/dashboard/budgets"
        />
      );
    }

    return budgetList.map((budget) => <BudgetItem budget={budget} key={budget.id} />);
  }, [budgetList, isLoading]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:px-8 md:py-10">
      {/* Staggered top-down settle, mirroring the landing page's reveal
          cadence but shorter — this is a working surface, not a pitch. */}
      <MountReveal className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-teal)]">
            Your money, in focus
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-none tracking-[-0.08em] text-[var(--cash-ink)] sm:text-5xl">
            Hi, {user?.fullName} <span aria-hidden="true">👋</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--cash-muted)]">
            Here's what happenning with your money, Lets Manage your expense
          </p>
        </div>
        <div className="hidden rounded-2xl border border-[var(--cash-line)] bg-white px-4 py-3 text-right shadow-sm md:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Today</p>
          <p className="mt-1 font-display text-sm font-bold text-[var(--cash-ink)]">A clearer next move</p>
        </div>
      </MountReveal>

      <MountReveal delay={0.06}>
        <Suspense fallback={<CardInfoSkeleton />}>
          <CardInfo
            budgetList={budgetList}
            incomeList={incomeList}
            expensesList={expensesList}
            isLoading={isLoading}
          />
        </Suspense>
      </MountReveal>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <MountReveal delay={0.12}>
            <Suspense fallback={<ChartSkeleton />}>
              <BarChartDashboard budgetList={budgetList} isLoading={isLoading} />
            </Suspense>
          </MountReveal>
          <MountReveal delay={0.18}>
            <Suspense fallback={<TableSkeleton />}>
              <ExpenseListTable expensesList={expensesList} refreshData={refreshData} />
            </Suspense>
          </MountReveal>
        </div>

        <MountReveal as="aside" delay={0.24} className="min-w-0">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-teal)]">Your guardrails</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.07em] text-[var(--cash-ink)]">Latest budgets</h2>
            </div>
            <span className="rounded-full bg-[var(--cash-wash)] px-3 py-1.5 text-xs font-bold text-[var(--cash-teal)]">{budgetList.length}</span>
          </div>
          <div className="mt-4 space-y-4">
            <Suspense fallback={[1, 2, 3].map((item) => <BudgetSkeleton key={item} />)}>
              {budgetItems}
            </Suspense>
          </div>
        </MountReveal>
      </div>
    </div>
  );
}

export default Dashboard;
