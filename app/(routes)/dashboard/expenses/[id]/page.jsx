"use client";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditBudget from "../_components/EditBudget";

function ExpensesScreen({ params }) {
  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState();
  const [expensesList, setExpensesList] = useState([]);
  const route = useRouter();

  const getExpensesList = async () => {
    const result = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.budgetId, params.id))
      .orderBy(desc(Expenses.id));
    setExpensesList(result);
  };

  const getBudgetInfo = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
        .where(eq(Budgets.id, params.id))
        .groupBy(Budgets.id);

      setBudgetInfo(result[0]);
      await getExpensesList();
    } catch (error) {
      console.error("Error fetching budget details:", error);
    }
  };

  useEffect(() => {
    if (user) getBudgetInfo();
  }, [user]);

  const deleteBudget = async () => {
    try {
      const deleteExpenseResult = await db.delete(Expenses).where(eq(Expenses.budgetId, params.id)).returning();
      if (deleteExpenseResult) {
        await db.delete(Budgets).where(eq(Budgets.id, params.id)).returning();
      }
      toast("Budget Deleted !");
      route.replace("/dashboard/budgets");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast("Unable to delete this budget right now.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:px-8 md:py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <button
            type="button"
            onClick={() => route.back()}
            className="inline-flex items-center gap-2 rounded-full text-sm font-bold text-[var(--cash-muted)] transition-colors hover:text-[var(--cash-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to budgets
          </button>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-teal)]">Budget workspace</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.08em] text-[var(--cash-ink)] sm:text-5xl">
            Track the details.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--cash-muted)]">
            Keep every expense close to the priority it supports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EditBudget budgetInfo={budgetInfo} refreshData={getBudgetInfo} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="h-10 rounded-full border-rose-200 dark:border-rose-400/30 px-4 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 hover:text-rose-600">
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete budget
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-[var(--cash-line)] bg-[var(--cash-paper)]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-xl font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
                  Delete this budget?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[var(--cash-muted)]">
                  This action cannot be undone. Your budget and its expenses will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full border-[var(--cash-line)]">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteBudget} className="rounded-full bg-rose-500 text-white hover:bg-rose-600">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[170px] animate-pulse rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)]" />
        )}
        <AddExpense budgetId={params.id} user={user} refreshData={getBudgetInfo} />
      </div>

      <ExpenseListTable expensesList={expensesList} refreshData={getBudgetInfo} />
    </div>
  );
}

export default ExpensesScreen;
