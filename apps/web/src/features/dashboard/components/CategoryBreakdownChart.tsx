import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { CategoryBreakdownItem } from "../../../types";
import { Card } from "../../../components/Card";
import { useAuth } from "../../../context/AuthContext";

interface CategoryBreakdownChartProps {
  categories: CategoryBreakdownItem[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  categories,
}) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = categories.map((c) => ({
    name: c.category_name,
    value: c.amount_cents / 100,
    color: c.category_color || "#64748b",
    percentage: c.percentage,
  }));

  const totalAmount =
    categories.reduce((sum, c) => sum + c.amount_cents, 0) / 100;
  const activeItem =
    hoveredIndex !== null && chartData[hoveredIndex]
      ? chartData[hoveredIndex]
      : null;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
    return (
      <g className="cursor-pointer transition-all duration-200">
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#0f172a"
          strokeWidth={2.5}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 13}
          outerRadius={outerRadius + 15}
          fill={fill}
          opacity={0.9}
        />
      </g>
    );
  };

  const renderInactiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <Card
      title="Category Breakdown"
      subtitle="Distribution of expenses across categories (hover segment to inspect)"
    >
      {categories.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No expense categories recorded in this period.
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center justify-between pt-2">
          <div className="relative h-60 w-full lg:w-1/2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2.5}
                  dataKey="value"
                  strokeWidth={1.5}
                  stroke="#ffffff"
                  activeShape={renderActiveShape}
                  inactiveShape={renderInactiveShape}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all duration-200 select-none w-32 flex flex-col items-center justify-center">
              {activeItem ? (
                <div className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center">
                  <div className="flex items-center space-x-1.5 mb-0.5 max-w-[105px]">
                    <span
                      className="w-2 h-2 rounded-full border border-slate-900 dark:border-white flex-shrink-0"
                      style={{ backgroundColor: activeItem.color }}
                    />
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                      {activeItem.name}
                    </p>
                  </div>
                  <p className="font-mono text-base font-black text-slate-900 dark:text-white leading-tight">
                    {currencySymbol}
                    {activeItem.value.toFixed(2)}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
                    {activeItem.percentage.toFixed(1)}%
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Total
                  </p>
                  <p className="font-mono text-base font-black text-slate-900 dark:text-white leading-tight">
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Expenses
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-1.5 mt-4 lg:mt-0 pl-0 lg:pl-4 overflow-y-auto max-h-60">
            {categories.slice(0, 6).map((cat, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition-all cursor-pointer ${
                    isHovered
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#ffffff] scale-[1.02]"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span
                      className={`w-3 h-3 rounded-md flex-shrink-0 border border-slate-900/30 transition-transform ${
                        isHovered ? "scale-125" : ""
                      }`}
                      style={{
                        backgroundColor: cat.category_color || "#64748b",
                      }}
                    />
                    <span
                      className={`truncate transition-colors ${
                        isHovered
                          ? "font-black text-slate-900 dark:text-white"
                          : "font-semibold text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {cat.category_name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono">
                    <span
                      className={`mr-2 ${
                        isHovered
                          ? "font-black text-slate-900 dark:text-white text-sm"
                          : "font-semibold text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {currencySymbol}
                      {(cat.amount_cents / 100).toFixed(2)}
                    </span>
                    <span
                      className={`font-sans font-bold text-[11px] ${
                        isHovered
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
