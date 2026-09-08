"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ReceiptText } from "lucide-react";

import ExpenseListTable from "./_components/ExpenseListTable";
import { getExpenses } from "@/app/actions/expenses";
import { callAction } from "@/utils/callAction";

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const { isLoaded } = useUser();

  const getAllExpenses = useCallback(
    () =>
      callAction(getExpenses())
        .then((rows) => {
          setExpensesList(rows);
          setLoadError(null);
        })
        .catch((error) => {
          console.error("Error fetching expenses:", error);
          setLoadError(error.message);
        }),
    []
  );

  useEffect(() => {
    if (isLoaded) getAllExpenses();
  }, [isLoaded, getAllExpenses]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:px-8 md:py-10">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-teal)]">
          <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
          Recent activity
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.08em] text-[var(--cash-ink)] sm:text-5xl">
          My expenses
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--cash-muted)]">
          Every small purchase is a signal. Keep the full picture close.
        </p>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-dashed border-[rgb(var(--cash-sand-rgb)/0.9)] bg-[rgb(var(--cash-sand-rgb)/0.18)] px-5 py-4 text-sm leading-6 text-[var(--cash-ink)]"
        >
          Your expenses could not be loaded. {loadError}
        </p>
      ) : null}

      <ExpenseListTable refreshData={getAllExpenses} expensesList={expensesList} />
    </div>
  );
}

export default ExpensesScreen;
