"use client";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { use, useCallback, useEffect, useState } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";
import EmptyState from "../../_components/EmptyState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX, Trash2 } from "lucide-react";
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
  // Next 16 hands route params to client components as a Promise, so the old
  // `params.id` read the property off the Promise itself and got `undefined`.
  // Both queries below then filtered on undefined, which Postgres matches
  // against nothing — hence a budget card stuck on its skeleton and an expense
  // table insisting there were no expenses while rows sat in the table.
  const { id } = use(params);
  const budgetId = Number(id);

  const { user, isLoaded } = useUser();
  // undefined while loading, null once we know there is no such budget for
  // this user, the row itself when there is one.
  const [budgetInfo, setBudgetInfo] = useState(undefined);
  const [expensesList, setExpensesList] = useState([]);
  const route = useRouter();

  const email = user?.primaryEmailAddress?.emailAddress;
  // A non-numeric id would reach Postgres as a bad integer literal and throw,
  // so it is settled here during render rather than by a fetch that cannot run.
  const hasValidId = Number.isInteger(budgetId);

  const refreshData = useCallback(async () => {
    // Wait for Clerk rather than concluding "no such budget" from a session
    // that simply has not arrived yet.
    if (!isLoaded || !email || !hasValidId) return;

    try {
      // Both conditions go through one and(): chaining .where() twice replaces
      // the first condition instead of combining them, which quietly dropped
      // the ownership check and left any budget readable by id alone.
      const [budget] = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(and(eq(Budgets.createdBy, email), eq(Budgets.id, budgetId)))
        .groupBy(Budgets.id);

      if (!budget) {
        setBudgetInfo(null);
        setExpensesList([]);
        return;
      }

      setBudgetInfo(budget);
      setExpensesList(
        await db
          .select()
          .from(Expenses)
          .where(eq(Expenses.budgetId, budgetId))
          .orderBy(desc(Expenses.id))
      );
    } catch (error) {
      console.error("Error fetching budget details:", error);
      toast("Could not load this budget. Try again.");
    }
  }, [budgetId, email, hasValidId, isLoaded]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const deleteBudget = async () => {
    try {
      // Ownership is confirmed before anything is removed. It cannot be folded
      // into the deletes themselves: expenses carry a foreign key to the
      // budget, so they have to go first, and a scoped budget delete that then
      // matched nothing would leave the expenses already destroyed.
      const [owned] = await db
        .select({ id: Budgets.id })
        .from(Budgets)
        .where(and(eq(Budgets.createdBy, email), eq(Budgets.id, budgetId)));

      if (!owned) {
        toast("That budget is not yours to delete.");
        return;
      }

      await db.delete(Expenses).where(eq(Expenses.budgetId, budgetId));
      await db.delete(Budgets).where(eq(Budgets.id, budgetId));
      toast("Budget Deleted !");
      route.replace("/dashboard/budgets");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast("Unable to delete this budget right now.");
    }
  };

  const missing = !hasValidId || budgetInfo === null;

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
        {/* Editing and deleting need a budget to act on, so they stay hidden
            until one has actually loaded. */}
        {budgetInfo ? (
          <div className="flex flex-wrap gap-2">
            <EditBudget budgetInfo={budgetInfo} refreshData={refreshData} />
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
        ) : null}
      </div>

      {missing ? (
        // Previously this branch had no state of its own, so a budget that had
        // been deleted — or that never belonged to this account — left the
        // skeleton pulsing indefinitely with no explanation.
        <EmptyState
          className="mt-8"
          icon={SearchX}
          title="Budget not found"
          description="This budget no longer exists, or it belongs to a different account. Pick one from your budgets to carry on."
          actionLabel="Back to budgets"
          actionHref="/dashboard/budgets"
        />
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
            {budgetInfo ? (
              <BudgetItem budget={budgetInfo} />
            ) : (
              <div className="h-[170px] animate-pulse rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)]" />
            )}
            <AddExpense budgetId={budgetId} user={user} refreshData={refreshData} />
          </div>

          <ExpenseListTable expensesList={expensesList} refreshData={refreshData} />
        </>
      )}
    </div>
  );
}

export default ExpensesScreen;
