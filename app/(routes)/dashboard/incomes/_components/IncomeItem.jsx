import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { db } from "@/utils/dbConfig";
import { Incomes } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
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
import formatNumber from "@/utils";

function IncomeItem({ budget, refreshData, totalSpend = 0 }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const amount = Number(budget?.amount) || 0;

  const covers = totalSpend > 0 ? (amount / totalSpend) * 100 : null;

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const deleteIncome = async () => {
    try {
      const result = await db.delete(Incomes).where(eq(Incomes.id, budget.id)).returning();

      if (result) {
        toast("Income stream deleted successfully!");
        refreshData?.();
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      toast("Failed to delete income stream");
    }
  };

  return (
    <article className="group relative min-h-[170px] rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-5 shadow-[var(--cash-shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--cash-teal-rgb)/0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--cash-mist)] text-2xl">
            {budget?.icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-extrabold tracking-[-0.04em] text-[var(--cash-ink)]">
              {budget.name}
            </h2>
            <p className="mt-1 text-xs text-[var(--cash-muted)]">Income source</p>
          </div>
        </div>
        <p className="shrink-0 font-display text-sm font-extrabold tracking-[-0.04em] text-[var(--cash-teal)]">
          Rs.{formatNumber(amount)}
        </p>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4 border-t border-[var(--cash-line)] pt-4">
        <div className="min-w-0 flex-1">
          {/* Share-of-income was dropped: with a single source it is always
              100%, which tells you nothing. Coverage of actual spending is the
              figure that changes and carries meaning. */}
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cash-muted)]">
            Covers spending
          </p>
          <p className="mt-1 text-sm leading-5 text-[var(--cash-ink)]">
            {covers === null ? (
              <span className="text-[var(--cash-muted)]">No spending tracked yet</span>
            ) : covers >= 100 ? (
              <>
                <span className="font-display font-extrabold">All</span>{" "}
                <span className="text-[var(--cash-muted)]">of your tracked spend</span>
              </>
            ) : (
              <>
                <span className="font-display font-extrabold">{covers.toFixed(0)}%</span>{" "}
                <span className="text-[var(--cash-muted)]">of your tracked spend</span>
              </>
            )}
          </p>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded-full border border-transparent p-2 text-rose-500 dark:text-rose-400 opacity-70 transition-all hover:border-rose-200 dark:border-rose-400/30 hover:bg-rose-50 dark:hover:bg-rose-400/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              title="Delete income stream"
              aria-label={`Delete ${budget.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-[var(--cash-line)] bg-[var(--cash-paper)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
                Delete income stream
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[var(--cash-muted)]">
                Are you sure you want to delete &quot;{budget.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full border-[var(--cash-line)]">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteIncome} className="rounded-full bg-rose-500 text-white hover:bg-rose-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}

export default IncomeItem;
