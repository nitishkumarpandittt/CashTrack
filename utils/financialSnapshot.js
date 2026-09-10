// Server-only. Loads one user's rows and turns them into the FINANCIAL CONTEXT
// text the model is briefed with. Deliberately *not* a "use server" file: its
// functions take an email and must never be callable from the browser, which
// is exactly what exporting them from an action module would allow.

import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "./dbConfig";
import { Budgets, Expenses, Incomes } from "./schema";
import { buildFinancialContext } from "./financialContext";

/** Budgets with totals, expenses across all budgets, and income sources. */
export async function loadFinancialData(email) {
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

/** The briefing text for one user, ready to append to a system prompt. */
export async function buildSnapshotFor({ email, firstName = "" }) {
  const { budgets, expenses, incomes } = await loadFinancialData(email);
  return buildFinancialContext({
    budgetList: budgets,
    incomeList: incomes,
    expensesList: expenses,
    userName: firstName,
  });
}
