import Link from "next/link";
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

function IncomeItem({ budget, refreshData }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent any parent click events
    setIsDeleteDialogOpen(true);
  };

  const deleteIncome = async () => {
    try {
      const result = await db
        .delete(Incomes)
        .where(eq(Incomes.id, budget.id))
        .returning();

      if (result) {
        toast("Income stream deleted successfully!");
        refreshData && refreshData();
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      toast("Failed to delete income stream");
    }
  };

  return (
    <div
      className="p-5 border rounded-2xl hover:shadow-md cursor-pointer h-[170px] relative group"
    >
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <h2
            className="text-2xl p-3 px-4
              bg-slate-100 rounded-full
              "
          >
            {budget?.icon}
          </h2>
          <div>
            <h2 className="font-bold">{budget.name}</h2>
            <h2 className="text-sm text-gray-500">{budget.totalItem} Item</h2>
          </div>
        </div>
        <h2 className="font-bold text-primary text-lg"> Rs.{budget.amount}</h2>
      </div>

      {/* Delete button with confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <button
            onClick={handleDeleteClick}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md border border-red-200 hover:border-red-300"
            title="Delete income stream"
          >
            <Trash2 size={14} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Stream</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{budget.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteIncome}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default IncomeItem;
