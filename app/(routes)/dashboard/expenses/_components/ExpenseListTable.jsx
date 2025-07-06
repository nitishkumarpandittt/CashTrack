import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash } from "lucide-react";
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
    <div className="mt-3">
      <h2 className="font-bold text-lg mb-3">Latest Expenses</h2>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 rounded-tl-xl rounded-tr-xl bg-slate-200 p-3">
          <h2 className="font-bold text-sm">Name</h2>
          <h2 className="font-bold text-sm">Amount</h2>
          <h2 className="font-bold text-sm">Date</h2>
          <h2 className="font-bold text-sm">Action</h2>
        </div>
        {expensesList.map((expenses, index) => (
          <div className="grid grid-cols-4 bg-slate-50 border-b p-3 hover:bg-slate-100" key={index}>
            <h2 className="text-sm">{expenses.name}</h2>
            <h2 className="text-sm font-medium">Rs.{expenses.amount}</h2>
            <h2 className="text-sm text-gray-600">{expenses.createdAt}</h2>
            <h2
              onClick={() => deleteExpense(expenses)}
              className="text-red-500 cursor-pointer text-sm hover:text-red-700"
            >
              Delete
            </h2>
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {expensesList.map((expenses, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800">{expenses.name}</h3>
              <button
                onClick={() => deleteExpense(expenses)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Delete
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-800">Rs.{expenses.amount}</span>
              <span className="text-sm text-gray-500">{expenses.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      {expensesList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No expenses found. Start by adding some expenses to track your spending.</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseListTable;
