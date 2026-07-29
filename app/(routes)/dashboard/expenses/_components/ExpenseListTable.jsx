import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    const result = await db
      .delete(Expenses)
      .where(eq(Expenses.id, expense.id))
      .returning();

    if (result) {
      toast("Expense Deleted!");
      refreshData();
    }
  };

  return (
    <section className="mt-6 rounded-[28px] border border-[var(--cash-line)] bg-white p-5 shadow-[var(--cash-shadow-card)] md:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-teal)]">
            Recent activity
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.07em] text-[var(--cash-ink)]">
            Latest expenses
          </h2>
        </div>
        <span className="hidden rounded-full bg-[var(--cash-mist)] px-3 py-1.5 text-xs font-semibold text-[var(--cash-muted)] sm:inline-flex">
          {expensesList.length} {expensesList.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[var(--cash-line)] md:block">
        <table className="min-w-full table-fixed text-left">
          <thead className="bg-[var(--cash-mist)]">
            <tr>
              <th className="w-[38%] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Name</th>
              <th className="w-[20%] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Amount</th>
              <th className="w-[25%] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Date</th>
              <th className="w-[17%] px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cash-line)]">
            {expensesList.map((expense) => (
              <tr key={expense.id} className="group transition-colors hover:bg-[var(--cash-mist)]/70">
                <td className="truncate px-4 py-4 text-sm font-semibold text-[var(--cash-ink)]">{expense.name}</td>
                <td className="px-4 py-4 font-display text-sm font-bold text-[var(--cash-ink)]">Rs.{expense.amount}</td>
                <td className="px-4 py-4 text-sm text-[var(--cash-muted)]">{expense.createdAt}</td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => deleteExpense(expense)}
                    aria-label={`Delete ${expense.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-rose-500 opacity-70 transition-colors hover:bg-rose-50 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {expensesList.map((expense) => (
          <article key={expense.id} className="rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-mist)]/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-[var(--cash-ink)]">{expense.name}</h3>
                <p className="mt-1 text-xs text-[var(--cash-muted)]">{expense.createdAt}</p>
              </div>
              <p className="shrink-0 font-display font-extrabold text-[var(--cash-ink)]">Rs.{expense.amount}</p>
            </div>
            <button
              type="button"
              onClick={() => deleteExpense(expense)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete expense
            </button>
          </article>
        ))}
      </div>

      {expensesList.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--cash-line)] bg-[var(--cash-mist)]/50 px-5 py-10 text-center">
          <p className="font-display text-base font-bold text-[var(--cash-ink)]">No expenses yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--cash-muted)]">
            Start by adding an expense to see your spending rhythm here.
          </p>
        </div>
      )}
    </section>
  );
}

export default ExpenseListTable;
