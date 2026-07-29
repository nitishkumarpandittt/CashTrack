import React, { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import EmptyState from "./EmptyState";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function BarChartDashboard({ budgetList, isLoading = false }) {
  const chartData = useMemo(
    () =>
      budgetList?.map((budget) => ({
        name: budget.name,
        totalSpend: budget.totalSpend || 0,
        amount: budget.amount || 0,
      })) || [],
    [budgetList]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-paper)] p-4 shadow-[var(--cash-shadow-card)]">
        <p className="font-display text-sm font-extrabold tracking-[-0.03em] text-[var(--cash-ink)]">
          {label}
        </p>
        <p className="mt-2 text-xs font-semibold text-[var(--cash-teal)]">
          Budget: Rs.{Number(payload[1]?.value || 0).toLocaleString()}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--cash-glaucous)]">
          Spent: Rs.{Number(payload[0]?.value || 0).toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <section className="rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-5 shadow-[var(--cash-shadow-card)] md:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-teal)]">
            Spending rhythm
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.07em] text-[var(--cash-ink)]">
            Activity
          </h2>
        </div>
        <p className="text-xs text-[var(--cash-muted)]">Budget vs. spent</p>
      </div>

      {/* With no budgets the chart used to render bare axes and an empty grid,
          which reads as broken rather than as "nothing to plot yet". */}
      {!isLoading && chartData.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={BarChart3}
          title="Nothing to plot yet"
          description="Once you have a budget with some spending against it, this chart compares what you planned with what you actually spent."
          actionLabel="Create a budget"
          actionHref="/dashboard/budgets"
        />
      ) : (
      <div className="mt-6 h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 4 }}>
            <CartesianGrid stroke="var(--cash-line)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--cash-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(value) => (value.length > 12 ? `${value.slice(0, 12)}…` : value)}
            />
            <YAxis
              tick={{ fill: "var(--cash-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
            />
            <Tooltip cursor={{ fill: "var(--cash-mist)" }} content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{ color: "var(--cash-muted)", fontSize: "11px", paddingTop: "12px" }}
            />
            <Bar
              dataKey="totalSpend"
              stackId="a"
              fill="var(--cash-teal)"
              name="Spent"
              radius={[0, 0, 5, 5]}
              maxBarSize={72}
            />
            <Bar
              dataKey="amount"
              stackId="a"
              fill="var(--cash-glaucous)"
              fillOpacity={0.42}
              name="Budget"
              radius={[5, 5, 0, 0]}
              maxBarSize={72}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </section>
  );
}

export default BarChartDashboard;
