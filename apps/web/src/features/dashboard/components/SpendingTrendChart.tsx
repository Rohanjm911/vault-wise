import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { SpendingTrendPoint } from "../../../types";
import { Card } from "../../../components/Card";
import { useAuth } from "../../../context/AuthContext";

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[];
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
}) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const chartData = data.map((d) => ({
    date: d.date.length > 7 ? d.date.slice(5) : d.date,
    fullDate: d.date,
    Spending: d.spending_cents / 100,
    Income: d.income_cents / 100,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-lg text-xs font-mono">
          <p className="font-sans font-bold text-slate-300 mb-1">
            {payload[0]?.payload?.fullDate || label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`tooltip-${index}`}
              style={{ color: entry.color }}
              className="font-semibold"
            >
              {entry.name}: {currencySymbol}
              {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Spending & Income Trend"
      subtitle="Daily breakdown across selected period"
    >
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No transactions recorded in this period.
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#334155"
                opacity={0.2}
              />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tickFormatter={(val) => `${currencySymbol}${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="rect"
              />
              <Bar
                dataKey="Spending"
                fill="#ef4444"
                radius={[2, 2, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                dataKey="Income"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
