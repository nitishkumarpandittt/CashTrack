"use server";

import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import {
  ActionError,
  optionalIcon,
  requireAmount,
  requireEmail,
  requireId,
  requireText,
  run,
} from "./_shared";

const budgetWithTotals = () => ({
  ...getTableColumns(Budgets),
  totalSpend: sql`coalesce(sum(${Expenses.amount}), 0)`.mapWith(Number),
  totalItem: sql`count(${Expenses.id})`.mapWith(Number),
});

/** Every budget of the signed-in user, newest first, with spend totals. */
export async function getBudgets() {
  return run(async () => {
    const email = await requireEmail();
    return db
      .select(budgetWithTotals())
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, email))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id));
  });
}

/** True when the user has created at least one budget. */
export async function hasBudgets() {
  return run(async () => {
    const email = await requireEmail();
    const rows = await db
      .select({ id: Budgets.id })
      .from(Budgets)
      .where(eq(Budgets.createdBy, email))
      .limit(1);
    return rows.length > 0;
  });
}

/**
 * One budget with its totals and its expenses. `budget` is null when there is
 * no such budget for this user, which the page shows as "not found".
 */
export async function getBudgetWithExpenses(budgetId) {
  return run(async () => {
    const id = requireId(budgetId, "budget");
    const email = await requireEmail();

    const [budget] = await db
      .select(budgetWithTotals())
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(and(eq(Budgets.createdBy, email), eq(Budgets.id, id)))
      .groupBy(Budgets.id);

    if (!budget) return { budget: null, expenses: [] };

    const expenses = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.budgetId, id))
      .orderBy(desc(Expenses.id));

    return { budget, expenses };
  });
}

export async function createBudget({ name, amount, icon } = {}) {
  return run(async () => {
    const email = await requireEmail();
    const [created] = await db
      .insert(Budgets)
      .values({
        name: requireText(name, "Budget name"),
        amount: requireAmount(amount, "Budget amount"),
        icon: optionalIcon(icon),
        createdBy: email,
      })
      .returning({ id: Budgets.id });
    return created;
  });
}

export async function updateBudget(budgetId, { name, amount, icon } = {}) {
  return run(async () => {
    const id = requireId(budgetId, "budget");
    const email = await requireEmail();
    const [updated] = await db
      .update(Budgets)
      .set({
        name: requireText(name, "Budget name"),
        amount: requireAmount(amount, "Budget amount"),
        icon: optionalIcon(icon),
      })
      // Ownership is part of the WHERE, so a foreign id updates nothing.
      .where(and(eq(Budgets.createdBy, email), eq(Budgets.id, id)))
      .returning({ id: Budgets.id });
    if (!updated) throw new ActionError("That budget is not yours to edit.");
    return updated;
  });
}

export async function deleteBudget(budgetId) {
  return run(async () => {
    const id = requireId(budgetId, "budget");
    const email = await requireEmail();

    // Expenses carry a foreign key to the budget, so they go first, and the
    // ownership check has to happen before either delete.
    const [owned] = await db
      .select({ id: Budgets.id })
      .from(Budgets)
      .where(and(eq(Budgets.createdBy, email), eq(Budgets.id, id)));
    if (!owned) throw new ActionError("That budget is not yours to delete.");

    await db.delete(Expenses).where(eq(Expenses.budgetId, id));
    await db.delete(Budgets).where(eq(Budgets.id, id));
    return { id };
  });
}
