"use client";
import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses, Incomes } from "@/utils/schema";

// Lazy load heavy components for faster initial load
const CardInfo = lazy(() => import("./_components/CardInfo"));
const BarChartDashboard = lazy(() => import("./_components/BarChartDashboard"));
const BudgetItem = lazy(() => import("./budgets/_components/BudgetItem"));
const ExpenseListTable = lazy(() => import("./expenses/_components/ExpenseListTable"));

// Import themed loading components
import { CardLoader, ChartLoader, TableLoader, AIAdviceLoader } from "@/app/_components/LoadingSpinner";

// Lightweight loading components for faster rendering
const CardInfoSkeleton = () => (
  <div className="space-y-6">
    <AIAdviceLoader />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <CardLoader key={i} />
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => <ChartLoader />;

const TableSkeleton = () => <TableLoader rows={5} />;

const BudgetSkeleton = () => <CardLoader className="h-[170px]" />;

function Dashboard() {
  const { user } = useUser();

  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getBudgetList();
    }
  }, [user]);
  /**
   * Optimized data fetching with error handling and loading states
   */
  const getBudgetList = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setIsLoading(true);

      // Parallel data fetching for better performance
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
          .orderBy(desc(Incomes.id))
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

  // Memoized refresh function for better performance
  const refreshData = useCallback(() => {
    getBudgetList();
  }, [getBudgetList]);

  // Memoized budget items to prevent unnecessary re-renders
  const budgetItems = useMemo(() => {
    if (isLoading) {
      return [1, 2, 3, 4].map((item, index) => (
        <BudgetSkeleton key={index} />
      ));
    }

    return budgetList?.length > 0
      ? budgetList.map((budget, index) => (
          <BudgetItem budget={budget} key={budget.id || index} />
        ))
      : [1, 2, 3, 4].map((item, index) => (
          <BudgetSkeleton key={index} />
        ));
  }, [budgetList, isLoading]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h2 className="font-bold text-2xl md:text-4xl mb-2">Hi, {user?.fullName} 👋</h2>
        <p className="text-gray-500 text-sm md:text-base">
          Here's what happenning with your money, Lets Manage your expense
        </p>
      </div>

      <Suspense fallback={<CardInfoSkeleton />}>
        <CardInfo
          budgetList={budgetList}
          incomeList={incomeList}
          expensesList={expensesList}
        />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 mt-4 md:mt-6 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Suspense fallback={<ChartSkeleton />}>
            <BarChartDashboard budgetList={budgetList} />
          </Suspense>

          <Suspense fallback={<TableSkeleton />}>
            <ExpenseListTable
              expensesList={expensesList}
              refreshData={refreshData}
            />
          </Suspense>
        </div>

        <div className="space-y-3 md:space-y-4">
          <h2 className="font-bold text-lg">Latest Budgets</h2>
          <div className="space-y-3">
            <Suspense fallback={[1, 2, 3, 4].map(i => <BudgetSkeleton key={i} />)}>
              {budgetItems}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
