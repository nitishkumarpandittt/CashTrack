"use server";

import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses, Incomes } from "@/utils/schema";
import { buildFinancialContext } from "@/utils/financialContext";
import { requireEmail, requireProfile, run } from "./_shared";

async function loadEverything(email) {
  const [budgets, expenses, incomes] = await Promise.all([
    db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`coalesce(sum(${Expenses.amount}), 0)`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, email))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id)),
    db
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
      .orderBy(desc(Expenses.id)),
    db.select().from(Incomes).where(eq(Incomes.createdBy, email)).orderBy(desc(Incomes.id)),
  ]);
  return { budgets, expenses, incomes };
}

/** Everything the dashboard home renders, in one round trip. */
export async function getDashboardData() {
  return run(async () => loadEverything(await requireEmail()));
}

/**
 * The factual snapshot the assistant is briefed with. Built here so the raw
 * rows never have to travel to the browser just to be summarised.
 */
export async function getFinancialContext() {
  return run(async () => {
    const { email, firstName } = await requireProfile();
    const { budgets, expenses, incomes } = await loadEverything(email);
    return buildFinancialContext({
      budgetList: budgets,
      incomeList: incomes,
      expensesList: expenses,
      userName: firstName,
    });
  });
}
