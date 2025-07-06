import Link from "next/link";
import React from "react";

function BudgetItem({ budget }) {
  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };
  return (
    <Link href={"/dashboard/expenses/" + budget?.id}>
      <div
        className="p-4 md:p-5 border rounded-2xl
    hover:shadow-md cursor-pointer h-[150px] md:h-[170px] transition-shadow"
      >
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center flex-1 min-w-0">
            <h2
              className="text-lg md:text-2xl p-2 md:p-3 px-3 md:px-4
              bg-slate-100 rounded-full flex-shrink-0"
            >
              {budget?.icon}
            </h2>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm md:text-base truncate">{budget.name}</h2>
              <h2 className="text-xs md:text-sm text-gray-500">{budget.totalItem} Item</h2>
            </div>
          </div>
          <h2 className="font-bold text-primary text-sm md:text-lg flex-shrink-0"> Rs.{budget.amount}</h2>
        </div>

        <div className="mt-3 md:mt-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h2 className="text-xs text-slate-400">
              Rs.{budget.totalSpend ? budget.totalSpend : 0} Spend
            </h2>
            <h2 className="text-xs text-slate-400">
              Rs.{budget.amount - budget.totalSpend} Remaining
            </h2>
          </div>
          <div
            className="w-full
              bg-slate-300 h-2 rounded-full"
          >
            <div
              className="
              bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${calculateProgressPerc()}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BudgetItem;
