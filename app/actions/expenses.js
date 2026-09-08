"use server";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { ActionError, requireAmount, requireEmail, requireId, requireText, run } from "./_shared";

/** Every expense across all of the user's budgets, newest first. */
export async function getExpenses() {
  return run(async () => {
    const email = await requireEmail();
    return db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt,
        budgetId: Expenses.budgetId,
      })
      .from(Expenses)
      .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, email))
      .orderBy(desc(Expenses.id));
  });
}

// The table stores the date as text in DD/MM/YYYY form (moment's old format),
// so new rows keep that shape and sort/display like the existing ones.
const todayLabel = () =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date()
  );

export async function addExpense({ budgetId, name, amount } = {}) {
  return run(async () => {
    const id = requireId(budgetId, "budget");
    const email = await requireEmail();

    const [owned] = await db
      .select({ id: Budgets.id })
      .from(Budgets)
      .where(and(eq(Budgets.createdBy, email), eq(Budgets.id, id)));
    if (!owned) throw new ActionError("That budget is not yours to add expenses to.");

    const [created] = await db
      .insert(Expenses)
      .values({
        name: requireText(name, "Expense name"),
        amount: requireAmount(amount, "Expense amount"),
        budgetId: id,
        createdAt: todayLabel(),
      })
      .returning({ id: Expenses.id });
    return created;
  });
}

export async function deleteExpense(expenseId) {
  return run(async () => {
    const id = requireId(expenseId, "expense");
    const email = await requireEmail();

    const [owned] = await db
      .select({ id: Expenses.id })
      .from(Expenses)
      .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
      .where(and(eq(Budgets.createdBy, email), eq(Expenses.id, id)));
    if (!owned) throw new ActionError("That expense is not yours to delete.");

    await db.delete(Expenses).where(eq(Expenses.id, id));
    return { id };
  });
}
