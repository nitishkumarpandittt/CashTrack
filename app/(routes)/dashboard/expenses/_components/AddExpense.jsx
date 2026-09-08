"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { addExpense } from "@/app/actions/expenses";
import { callAction } from "@/utils/callAction";

function AddExpense({ budgetId, refreshData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const addNewExpense = async () => {
    if (!(Number(amount) > 0)) {
      toast.error("Enter an expense amount greater than zero");
      return;
    }

    setLoading(true);
    try {
      await callAction(addExpense({ budgetId, name, amount }));
      setAmount("");
      setName("");
      refreshData();
      toast.success("New Expense Added!");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Unable to add expense", { description: error.message, duration: 12000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-5 shadow-[var(--cash-shadow-card)] md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cash-wash)] text-[var(--cash-teal)]">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cash-teal)]">Keep it current</p>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-[-0.06em] text-[var(--cash-ink)]">Add expense</h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="expense-name" className="mb-2 block text-sm font-semibold text-[var(--cash-ink)]">Expense name</label>
          <Input
            id="expense-name"
            placeholder="e.g. Bedroom Decor"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
          />
        </div>
        <div>
          <label htmlFor="expense-amount" className="mb-2 block text-sm font-semibold text-[var(--cash-ink)]">Expense amount</label>
          <Input
            id="expense-amount"
            type="number"
            min="0"
            placeholder="e.g. Rs.1000"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
          />
        </div>
      </div>

      <Button
        disabled={!(name.trim() && amount) || loading}
        onClick={addNewExpense}
        className="mt-6 h-12 w-full rounded-full bg-[var(--cash-teal-solid)] text-white hover:bg-[var(--cash-onyx)]"
      >
        {loading ? <Loader className="h-4 w-4 animate-spin" aria-label="Adding expense" /> : "Add new expense"}
      </Button>
    </section>
  );
}

export default AddExpense;
