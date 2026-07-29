import formatNumber from "@/utils";
import getAdvancedFinancialAdvice from "@/utils/getAdvancedFinancialAdvice";
import {
  AlertCircle,
  CheckCircle,
  PiggyBank,
  ReceiptText,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import Counter from "@/app/_components/motion/Counter";
import EmptyState from "./EmptyState";
import { deriveInsights } from "@/utils/deriveInsights";

const healthStyles = {
  excellent: {
    label: "Excellent",
    icon: CheckCircle,
    iconClass: "text-[var(--cash-emerald)]",
    badgeClass: "bg-[var(--cash-wash)] text-[var(--cash-teal)]",
  },
  good: {
    label: "Good",
    icon: TrendingUp,
    iconClass: "text-[var(--cash-teal)]",
    badgeClass: "bg-[var(--cash-wash)] text-[var(--cash-teal)]",
  },
  fair: {
    label: "Fair",
    icon: AlertCircle,
    iconClass: "text-[var(--cash-sand)]",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  },
  poor: {
    label: "Needs attention",
    icon: TrendingDown,
    iconClass: "text-rose-500 dark:text-rose-400",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  },
  neutral: {
    label: "Building your picture",
    icon: Sparkles,
    iconClass: "text-[var(--cash-glaucous)]",
    badgeClass: "bg-[var(--cash-mist)] text-[var(--cash-muted)]",
  },
};

const toneStyles = {
  critical: {
    wrap: "border-rose-100 bg-rose-50/60 dark:border-rose-400/25 dark:bg-rose-400/10",
    icon: AlertCircle,
    icon_: "text-rose-500 dark:text-rose-400",
  },
  warn: {
    wrap: "border-amber-100 bg-amber-50/60 dark:border-amber-400/25 dark:bg-amber-400/10",
    icon: TrendingDown,
    icon_: "text-amber-600 dark:text-amber-300",
  },
  good: {
    wrap: "border-[var(--cash-line)] bg-[rgb(var(--cash-wash-rgb)/0.7)]",
    icon: CheckCircle,
    icon_: "text-[var(--cash-teal)]",
  },
  info: {
    wrap: "border-[var(--cash-line)] bg-[var(--cash-mist)]",
    icon: Sparkles,
    icon_: "text-[var(--cash-glaucous)]",
  },
};

const metrics = [
  { key: "savingsRate", label: "Savings rate" },
  { key: "surplus", label: "Surplus" },
  { key: "budgetUse", label: "Budget used" },
];

function CardInfo({ budgetList, incomeList, expensesList = [], isLoading = false }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [financialAdvice, setFinancialAdvice] = useState("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [savingsRate, setSavingsRate] = useState(0);
  const [financialHealth, setFinancialHealth] = useState("neutral");

  useEffect(() => {
    if (budgetList.length > 0 || incomeList.length > 0) {
      calculateCardInfo();
    }
  }, [budgetList, incomeList]);

  useEffect(() => {
    if (totalBudget > 0 || totalIncome > 0 || totalSpend > 0) {
      const fetchFinancialAdvice = async () => {
        setIsLoadingAdvice(true);
        try {
          const advice = await getAdvancedFinancialAdvice(
            totalBudget,
            totalIncome,
            totalSpend,
            budgetList,
            expensesList
          );
          setFinancialAdvice(advice);

          const savings = Number(totalIncome) - Number(totalSpend);
          const rate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
          const validRate = Number.isNaN(rate) ? 0 : rate;
          setSavingsRate(validRate);

          if (rate >= 20) setFinancialHealth("excellent");
          else if (rate >= 10) setFinancialHealth("good");
          else if (rate >= 0) setFinancialHealth("fair");
          else setFinancialHealth("poor");
        } catch (error) {
          console.error("Error fetching advice:", error);
          setFinancialAdvice("Unable to generate financial insights at the moment.");
        } finally {
          setIsLoadingAdvice(false);
        }
      };

      fetchFinancialAdvice();
    }
  }, [totalBudget, totalIncome, totalSpend, budgetList, expensesList]);

  const calculateCardInfo = () => {
    let nextBudget = 0;
    let nextSpend = 0;
    let nextIncome = 0;

    budgetList.forEach((budget) => {
      nextBudget += Number(budget.amount) || 0;
      nextSpend += Number(budget.totalSpend) || 0;
    });

    incomeList.forEach((income) => {
      nextIncome += Number(income.amount) || 0;
    });

    setTotalIncome(Number.isNaN(nextIncome) ? 0 : nextIncome);
    setTotalBudget(Number.isNaN(nextBudget) ? 0 : nextBudget);
    setTotalSpend(Number.isNaN(nextSpend) ? 0 : nextSpend);
  };

  const { insights } = useMemo(
    () => deriveInsights({ budgetList, incomeList, expensesList }),
    [budgetList, incomeList, expensesList]
  );

  const health = healthStyles[financialHealth] || healthStyles.neutral;
  const HealthIcon = health.icon;
  const metricValues = {
    savingsRate: `${Number.isNaN(savingsRate) ? "0.0" : savingsRate.toFixed(1)}%`,
    surplus: `Rs.${formatNumber(Number(totalIncome) - Number(totalSpend))}`,
    budgetUse: `${totalBudget > 0 ? ((Number(totalSpend) / Number(totalBudget)) * 100).toFixed(1) : "0.0"}%`,
  };

  return (
    <div>
      {budgetList?.length > 0 ? (
        <div>
          <section className="relative overflow-hidden rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-5 shadow-[var(--cash-shadow-card)] md:p-7">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--cash-teal)]" aria-hidden="true" />
            <div className="relative">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cash-onyx)] text-[var(--cash-emerald)]">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-teal)]">
                        Personal signal
                      </p>
                      <h2 className="mt-1 font-display text-xl font-extrabold tracking-[-0.06em] text-[var(--cash-ink)]">
                        CashTrack AI
                      </h2>
                    </div>
                  </div>
                </div>
                <div className={`flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${health.badgeClass}`}>
                  <HealthIcon className={`h-4 w-4 ${health.iconClass}`} aria-hidden="true" />
                  {health.label}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-y border-[var(--cash-line)] py-4 md:gap-4">
                {metrics.map((metric) => (
                  <div key={metric.key} className="min-w-0">
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cash-muted)]">
                      {metric.label}
                    </p>
                    <p className="mt-1 truncate font-display text-base font-extrabold tracking-[-0.05em] text-[var(--cash-ink)] md:text-xl">
                      {metricValues[metric.key]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ranked, computed observations rather than one block of prose.
                  Each row names a real figure from the user's own data and the
                  action it implies. */}
              <ul className="mt-5 space-y-2.5">
                {insights.length > 0 ? (
                  insights.slice(0, 3).map((insight) => {
                    const tone = toneStyles[insight.tone] || toneStyles.info;
                    const ToneIcon = tone.icon;
                    return (
                      <li
                        key={insight.id}
                        className={`flex gap-3 rounded-2xl border px-4 py-3.5 ${tone.wrap}`}
                      >
                        <ToneIcon
                          className={`mt-0.5 h-4 w-4 shrink-0 ${tone.icon_}`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-sm font-extrabold tracking-[-0.02em] text-[var(--cash-ink)]">
                            {insight.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--cash-muted)]">
                            {insight.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="rounded-2xl bg-[var(--cash-mist)] px-4 py-3.5 text-sm leading-6 text-[var(--cash-muted)]">
                    Add income and a few expenses and specific observations about
                    your spending will appear here.
                  </li>
                )}
              </ul>

              {/* The Gemini call is an optional extra layer; the observations
                  above stand on their own if it is unavailable. */}
              {isLoadingAdvice ? (
                <div className="mt-3 flex items-center gap-3 px-1 text-xs text-[var(--cash-muted)]">
                  <LoadingSpinner size="sm" text="" showLogo={false} />
                  <span>Looking for a deeper pattern…</span>
                </div>
              ) : financialAdvice ? (
                <p className="mt-3 border-t border-[var(--cash-line)] px-1 pt-3 text-sm leading-6 text-[var(--cash-muted)]">
                  {financialAdvice}
                </p>
              ) : null}
            </div>
          </section>

          <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-3">
            {/* Figures count up on mount, the same gesture as the landing
                page's stat rail. playOnMount because the dashboard has no
                MotionProvider and these sit above the fold. */}
            <MetricCard
              label="Total budget"
              value={<Counter value={totalBudget} playOnMount format={(n) => `Rs.${formatNumber(n)}`} />}
              icon={PiggyBank}
              iconClass="bg-[var(--cash-wash)] text-[var(--cash-teal)]"
            />
            <MetricCard
              label="Total spend"
              value={<Counter value={totalSpend} playOnMount format={(n) => `Rs.${formatNumber(n)}`} />}
              icon={ReceiptText}
              iconClass="bg-rose-50 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400"
            />
            <MetricCard
              label="Active budgets"
              value={<Counter value={budgetList.length} playOnMount />}
              icon={Wallet}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"
            />
          </div>
        </div>
      ) : isLoading ? (
        // Only pulse while data is genuinely in flight. Previously an empty
        // account fell through to this branch and skeletons pulsed forever.
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)]" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Create your first budget and CashTrack will start turning your spending into a clear picture — totals, savings rate, and a next best move."
          actionLabel="Create a budget"
          actionHref="/dashboard/budgets"
        />
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, iconClass }) {
  return (
    <article className="flex items-center justify-between rounded-[24px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-5 shadow-[var(--cash-shadow-card)] transition-transform duration-300 hover:-translate-y-0.5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cash-muted)]">{label}</p>
        <p className="mt-2 font-display text-2xl font-extrabold tracking-[-0.07em] text-[var(--cash-ink)]">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </article>
  );
}

export default CardInfo;
