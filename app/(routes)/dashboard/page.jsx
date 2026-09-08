"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useUser } from "@clerk/nextjs";

const CardInfo = lazy(() => import("./_components/CardInfo"));
const BarChartDashboard = lazy(() => import("./_components/BarChartDashboard"));
const BudgetItem = lazy(() => import("./budgets/_components/BudgetItem"));
const ExpenseListTable = lazy(() => import("./expenses/_components/ExpenseListTable"));

import { CardLoader, ChartLoader, TableLoader } from "@/app/_components/LoadingSpinner";
import MountReveal from "@/app/_components/motion/MountReveal";
import { Button } from "@/components/ui/button";
import EmptyState from "./_components/EmptyState";
import { getDashboardData } from "@/app/actions/dashboard";
import { callAction } from "@/utils/callAction";

const CardInfoSkeleton = () => (
  <div className="space-y-4">
    <div className="h-64 animate-pulse rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)]" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <CardLoader key={item} className="h-28 rounded-[24px]" />
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-6">
    <ChartLoader />
  </div>
);

const TableSkeleton = () => (
  <div className="rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-6">
    <TableLoader rows={5} />
  </div>
);

const BudgetSkeleton = () => <CardLoader className="h-[170px] rounded-[24px]" />;

function Dashboard() {
  const { user, isLoaded } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // One server round trip for everything on the page. State is only touched
  // from the promise callbacks so the mount effect stays synchronous-free.
  const loadDashboard = useCallback(
    () =>
      callAction(getDashboardData())
        .then(({ budgets, expenses, incomes }) => {
          setBudgetList(budgets);
          setExpensesList(expenses);
          setIncomeList(incomes);
          setLoadError(null);
        })
        .catch((error) => {
          console.error("Error fetching dashboard data:", error);
          setLoadError(error.message);
        })
        .finally(() => setIsLoading(false)),
    []
  );

  useEffect(() => {
    if (isLoaded) loadDashboard();
  }, [isLoaded, loadDashboard]);

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
            Hi, {user?.firstName || user?.fullName || "there"} <span aria-hidden="true">👋</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--cash-muted)]">
            Here&apos;s what&apos;s happening with your money. Let&apos;s keep your spending on track.
          </p>
        </div>
        <div className="hidden rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-paper)] px-4 py-3 text-right shadow-sm md:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Today</p>
          <p className="mt-1 font-display text-sm font-bold text-[var(--cash-ink)]">A clearer next move</p>
        </div>
      </MountReveal>

      {loadError ? (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-[24px] border border-dashed border-[rgb(var(--cash-sand-rgb)/0.9)] bg-[rgb(var(--cash-sand-rgb)/0.18)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-base font-extrabold tracking-[-0.03em] text-[var(--cash-ink)]">
              Your figures could not be loaded.
            </p>
            <p className="mt-1 break-words text-sm leading-6 text-[var(--cash-muted)]">{loadError}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loadDashboard}
            className="shrink-0 rounded-full border-[var(--cash-line)] bg-[var(--cash-paper)] hover:bg-[var(--cash-wash)]"
          >
            Try again
          </Button>
        </div>
      ) : null}

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
              <ExpenseListTable expensesList={expensesList} refreshData={loadDashboard} />
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
