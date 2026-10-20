import React from "react";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { DashboardSummary } from "../../../types";
import { Card } from "../../../components/Card";
import { useAuth } from "../../../context/AuthContext";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const formatMoney = (cents: number) => {
    const isNegative = cents < 0;
    const absDollars = (Math.abs(cents) / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative
      ? `-${currencySymbol}${absDollars}`
      : `${currencySymbol}${absDollars}`;
  };

  const isOverbudget = summary.has_budget && summary.remaining_budget_cents < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card interactive className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Total Spending
          </span>
          <div className="p-1.5 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-lg border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000]">
            <TrendingDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {formatMoney(summary.total_spending_cents)}
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            In recorded period
          </p>
        </div>
      </Card>

      <Card interactive className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Total Income
          </span>
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-lg border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000]">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {formatMoney(summary.total_income_cents)}
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            Incoming deposits
          </p>
        </div>
      </Card>

      <Card interactive className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Net Savings
          </span>
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-lg border-2 border-slate-900 dark:border-[#1c382d] shadow-[2px_2px_0px_#061a12] dark:shadow-[2px_2px_0px_#000000]">
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-black font-mono tracking-tight ${
              summary.net_savings_cents >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatMoney(summary.net_savings_cents)}
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            Income minus spending
          </p>
        </div>
      </Card>

      <Card interactive className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Remaining Budget
          </span>
          <div
            className={`p-1.5 rounded-lg border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000] ${
              isOverbudget
                ? "bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400"
                : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isOverbudget ? (
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <PieChart className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </div>
        <div className="mt-3">
          {summary.has_budget ? (
            <>
              <p
                className={`text-2xl font-black font-mono tracking-tight ${
                  isOverbudget
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {formatMoney(summary.remaining_budget_cents)}
              </p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                {isOverbudget ? "Budget exceeded" : "Remaining spending cap"}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-black text-slate-400 dark:text-slate-500 mt-2">
                Not Configured
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                Set a budget
              </p>
            </>
          )}
        </div>
      </Card>

      <Card interactive className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Utilization
          </span>
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000]">
            <PieChart className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3">
          {summary.has_budget ? (
            <>
              <p
                className={`text-2xl font-black font-mono tracking-tight ${
                  summary.budget_utilization_percent >= 100
                    ? "text-red-600 dark:text-red-400"
                    : summary.budget_utilization_percent >= 80
                      ? "text-amber-500"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {summary.budget_utilization_percent.toFixed(1)}%
              </p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                Limit: {formatMoney(summary.budget_limit_cents)}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black font-mono text-slate-400 dark:text-slate-500">
                —
              </p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                No limit active
              </p>
            </>
          )}
        </div>
      </Card>

      <Card interactive className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Entries
          </span>
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000]">
            <FileText className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {summary.transaction_count}
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            Recorded items
          </p>
        </div>
      </Card>
    </div>
  );
};
