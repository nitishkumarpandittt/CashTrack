"use server";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses, Incomes } from "@/utils/schema";
import {
  ActionError,
  optionalIcon,
  requireAmount,
  requireEmail,
  requireId,
  requireText,
  run,
} from "./_shared";

/**
 * The user's income sources plus their total tracked spend, which each card
 * uses to say what share of real spending that source covers.
 */
export async function getIncomes() {
  return run(async () => {
    const email = await requireEmail();
    const [incomes, [spend]] = await Promise.all([
      db.select().from(Incomes).where(eq(Incomes.createdBy, email)).orderBy(desc(Incomes.id)),
      db
        .select({ total: sql`coalesce(sum(${Expenses.amount}), 0)`.mapWith(Number) })
        .from(Expenses)
        .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, email)),
    ]);
    return { incomes, totalSpend: spend?.total || 0 };
  });
}

export async function createIncome({ name, amount, icon } = {}) {
  return run(async () => {
    const email = await requireEmail();
    const [created] = await db
      .insert(Incomes)
      .values({
        name: requireText(name, "Source name"),
        amount: requireAmount(amount, "Monthly amount"),
        icon: optionalIcon(icon),
        createdBy: email,
      })
      .returning({ id: Incomes.id });
    return created;
  });
}

export async function deleteIncome(incomeId) {
  return run(async () => {
    const id = requireId(incomeId, "income");
    const email = await requireEmail();
    const [deleted] = await db
      .delete(Incomes)
      .where(and(eq(Incomes.createdBy, email), eq(Incomes.id, id)))
      .returning({ id: Incomes.id });
    if (!deleted) throw new ActionError("That income source is not yours to delete.");
    return deleted;
  });
}
