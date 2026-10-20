import React, { useState, useEffect } from "react";
import {
  Calendar,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { HistoryResponse, CategoryHistoryTrend } from "../../types";
import { api } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const [periodType, setPeriodType] = useState<string>("month");
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<HistoryResponse>(
        `/analytics/history?period_type=${periodType}`,
      );
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to calculate historical comparison.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [periodType]);

  const periods = [
    { id: "month", label: "Month over Month" },
    { id: "3_months", label: "Last 3 Months" },
    { id: "6_months", label: "Last 6 Months" },
    { id: "year", label: "Year to Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="neo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>Comparison Horizon:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodType(p.id)}
              className={`neo-btn px-3.5 py-1.5 text-xs font-black transition-all ${
                periodType === p.id
                  ? "bg-emerald-600 text-white border-slate-900 shadow-[3px_3px_0px_#000] -translate-y-0.5"
                  : "bg-white dark:bg-[#10241d] text-slate-800 dark:text-slate-200 border-slate-900 dark:border-[#1c382d] shadow-[2px_2px_0px_#061a12] dark:shadow-[2px_2px_0px_#000] hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-900 border-2 border-red-500 rounded-xl text-xs font-bold shadow-[2px_2px_0px_#ef4444]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">
            Computing period deltas and category shifts...
          </p>
        </div>
      ) : data ? (
        <>
          {data.explanation && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-500 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-950 dark:text-emerald-200 shadow-[3px_3px_0px_#059669] font-bold">
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 stroke-[2.5]" />
              <span>{data.explanation}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card interactive>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Period Spending
              </span>
              <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2 tracking-tight">
                {currencySymbol}
                {(data.current_spending_cents / 100).toFixed(2)}
              </p>
              <p className="text-[11px] font-bold text-slate-400 mt-1 truncate">
                {data.current_range}
              </p>
            </Card>

            <Card interactive>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Prior Equivalent Spending
              </span>
              <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2 tracking-tight">
                {currencySymbol}
                {(data.previous_spending_cents / 100).toFixed(2)}
              </p>
              <p className="text-[11px] font-bold text-slate-400 mt-1 truncate">
                {data.previous_range}
              </p>
            </Card>

            <Card interactive>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Period Comparison Delta
              </span>
              <div className="flex items-center space-x-2 mt-2">
                <p
                  className={`text-2xl font-black font-mono tracking-tight ${
                    data.absolute_difference_cents > 0
                      ? "text-red-600 dark:text-red-400"
                      : data.absolute_difference_cents < 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {data.absolute_difference_cents > 0 ? "+" : ""}
                  {currencySymbol}
                  {(data.absolute_difference_cents / 100).toFixed(2)}
                </p>

                {data.percentage_change !== null ? (
                  <span
                    className={`inline-flex items-center text-xs font-black px-2 py-0.5 rounded-md border-2 ${
                      data.percentage_change > 0
                        ? "bg-red-100 text-red-900 border-red-600 shadow-[1.5px_1.5px_0px_#dc2626]"
                        : data.percentage_change < 0
                          ? "bg-emerald-100 text-emerald-900 border-emerald-600 shadow-[1.5px_1.5px_0px_#059669]"
                          : "bg-slate-100 text-slate-800 border-slate-900 shadow-[1.5px_1.5px_0px_#000]"
                    }`}
                  >
                    {data.percentage_change > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1 stroke-[3]" />
                    ) : data.percentage_change < 0 ? (
                      <TrendingDown className="w-3 h-3 mr-1 stroke-[3]" />
                    ) : (
                      <Minus className="w-3 h-3 mr-1 stroke-[3]" />
                    )}
                    {Math.abs(data.percentage_change).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">N/A</span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                {data.percentage_change !== null && data.percentage_change > 0
                  ? "Spending increased"
                  : data.percentage_change !== null &&
                      data.percentage_change < 0
                    ? "Spending reduced"
                    : "Zero relative change"}
              </p>
            </Card>
          </div>

          <Card
            title="Period-over-Period Aggregate Comparison"
            subtitle="Comparing total recorded outflows between the two equivalent windows"
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Comparison",
                      "Prior Period": data.previous_spending_cents / 100,
                      "Current Period": data.current_spending_cents / 100,
                    },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(v) => `${currencySymbol}${v}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `${currencySymbol}${Number(value).toFixed(2)}`,
                      "",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderWidth: 2,
                      borderRadius: 12,
                      boxShadow: "4px 4px 0px #000",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  />
                  <Bar
                    dataKey="Prior Period"
                    fill="#64748B"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="Current Period"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-3 text-xs font-black">
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 bg-slate-500 rounded-md border border-slate-900 inline-block" />
                <span className="text-slate-600 dark:text-slate-300">
                  Prior Period ({data.previous_range})
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 bg-emerald-600 rounded-md border border-slate-900 inline-block" />
                <span className="text-slate-600 dark:text-slate-300">
                  Current Period ({data.current_range})
                </span>
              </span>
            </div>
          </Card>

          <Card
            title="Category Spending Shifts"
            subtitle="How spending changed within specific categories across equivalent horizons"
          >
            {data.category_trends.length === 0 ? (
              <p className="py-8 text-center text-xs font-semibold text-slate-400">
                No categorical spending records found in either comparison
                period.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border-2 border-slate-900 dark:border-[#1c382d]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#0a1511] border-b-2 border-slate-900 dark:border-[#1c382d] text-slate-800 dark:text-slate-200 uppercase tracking-wider font-black">
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Current Period</th>
                      <th className="py-3 px-3 text-right">Prior Period</th>
                      <th className="py-3 px-3 text-right">Absolute Delta</th>
                      <th className="py-3 px-3 text-right">Change %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 dark:divide-[#1c382d] bg-white dark:bg-[#0f2019] font-mono">
                    {data.category_trends.map(
                      (cat: CategoryHistoryTrend, idx: number) => (
                        <tr
                          key={idx}
                          className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
                        >
                          <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0 border border-slate-900"
                              style={{
                                backgroundColor:
                                  cat.category_color || "#64748b",
                              }}
                            />
                            <span>{cat.category_name}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                            {currencySymbol}
                            {(cat.current_amount_cents / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400 font-bold">
                            {currencySymbol}
                            {(cat.previous_amount_cents / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-black">
                            <span
                              className={
                                cat.absolute_change_cents > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : cat.absolute_change_cents < 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-500"
                              }
                            >
                              {cat.absolute_change_cents > 0 ? "+" : ""}
                              {currencySymbol}
                              {(cat.absolute_change_cents / 100).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-black">
                            {cat.percentage_change !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[11px] ${
                                  cat.percentage_change > 0
                                    ? "bg-red-50 text-red-600 border-red-500 dark:bg-red-950/50"
                                    : cat.percentage_change < 0
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-500 dark:bg-emerald-950/50"
                                      : "text-slate-500 border-slate-300"
                                }`}
                              >
                                {cat.percentage_change > 0 ? "+" : ""}
                                {cat.percentage_change.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-sans italic">
                                New / N/A
                              </span>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
};
