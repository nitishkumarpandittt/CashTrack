"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import CreateIncomes from "./CreateIncomes";
import IncomeItem from "./IncomeItem";
import MountReveal from "@/app/_components/motion/MountReveal";
import { Button } from "@/components/ui/button";
import { getIncomes } from "@/app/actions/incomes";
import { callAction } from "@/utils/callAction";

function IncomeList() {
  const [incomeList, setIncomeList] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { isLoaded } = useUser();

  // Total spend comes along so each card can say what share of actual
  // spending it covers. State is only set from the promise callbacks so the
  // mount effect below stays free of synchronous updates.
  const getIncomeList = useCallback(
    () =>
      callAction(getIncomes())
        .then(({ incomes, totalSpend: spend }) => {
          setIncomeList(incomes);
          setTotalSpend(spend || 0);
          setLoadError(null);
        })
        .catch((error) => {
          console.error("Error fetching income streams:", error);
          setLoadError(error.message);
        })
        .finally(() => setIsLoading(false)),
    []
  );

  useEffect(() => {
    if (isLoaded) getIncomeList();
  }, [isLoaded, getIncomeList]);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CreateIncomes refreshData={getIncomeList} />
        {isLoading
          ? [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-[170px] animate-pulse rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)]" />
            ))
          : incomeList.length > 0
            ? incomeList.map((income, index) => (
                // Cap the stagger so a long list still finishes promptly.
                <MountReveal key={income.id} delay={Math.min(index * 0.05, 0.4)}>
                  <IncomeItem
                    budget={income}
                    refreshData={getIncomeList}
                    totalSpend={totalSpend}
                  />
                </MountReveal>
              ))
            : null}
      </div>

      {!isLoading && loadError && (
        <div
          role="alert"
          className="mt-6 rounded-[24px] border border-dashed border-[rgb(var(--cash-sand-rgb)/0.9)] bg-[rgb(var(--cash-sand-rgb)/0.18)] px-6 py-10 text-center"
        >
          <p className="font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
            Your income streams could not be loaded.
          </p>
          <p className="mx-auto mt-2 max-w-xl break-words text-sm leading-6 text-[var(--cash-muted)]">
            {loadError}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={getIncomeList}
            className="mt-5 rounded-full border-[var(--cash-line)] bg-[var(--cash-paper)] hover:bg-[var(--cash-wash)]"
          >
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !loadError && incomeList.length === 0 && (
        <div className="mt-6 rounded-[24px] border border-dashed border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.6)] px-6 py-12 text-center">
          <p className="font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
            No income streams yet.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cash-muted)]">
            Add a source above so your dashboard can understand the full picture.
          </p>
        </div>
      )}
    </div>
  );
}

export default IncomeList;
