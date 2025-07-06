import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function BarChartDashboard({ budgetList }) {
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return budgetList?.map(budget => ({
      name: budget.name,
      totalSpend: budget.totalSpend || 0,
      amount: budget.amount || 0,
    })) || [];
  }, [budgetList]);

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-600">
            Budget: Rs.{payload[1]?.value?.toLocaleString() || 0}
          </p>
          <p className="text-purple-600">
            Spent: Rs.{payload[0]?.value?.toLocaleString() || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border rounded-2xl p-4 md:p-6 bg-white shadow-sm">
      <h2 className="font-bold text-lg mb-4">Activity</h2>
      <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey="totalSpend"
            stackId="a"
            fill="#4845d2"
            name="Spent"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="amount"
            stackId="a"
            fill="#C3C2FF"
            name="Budget"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartDashboard;
