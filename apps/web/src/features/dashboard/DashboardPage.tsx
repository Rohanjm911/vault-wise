import React, { useState, useEffect } from "react";
import { RefreshCw, Calendar, Plus, Upload, Trash2, Edit2 } from "lucide-react";
import { DashboardResponse, Transaction } from "../../types";
import { api } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { SummaryCards } from "./components/SummaryCards";
import { SpendingTrendChart } from "./components/SpendingTrendChart";
import { CategoryBreakdownChart } from "./components/CategoryBreakdownChart";
import { FinancialInsights } from "./components/FinancialInsights";
import { Card } from "../../components/Card";

interface DashboardPageProps {
  onOpenAddTransaction: () => void;
  onOpenEditTransaction: (tx: Transaction) => void;
  onNavigateToImport: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddTransaction,
  onOpenEditTransaction,
  onNavigateToImport,
}) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const [period, setPeriod] = useState<string>("this_month");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<DashboardResponse>(
        `/analytics/dashboard?period=${period}`,
      );
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const handleDeleteRecent = async (txId: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await api.delete(`/transactions/${txId}`);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to delete transaction.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="neo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>Active Period Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "this_month", label: "This Month" },
            { id: "last_month", label: "Last Month" },
            { id: "last_30_days", label: "Last 30 Days" },
            { id: "ytd", label: "Year to Date" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`neo-btn px-3 py-1.5 text-xs font-black transition-all ${
                period === btn.id
                  ? "bg-emerald-600 text-white border-slate-900 shadow-[3px_3px_0px_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[#10241d] text-slate-800 dark:text-slate-200 border-slate-900 dark:border-[#1c382d] shadow-[2px_2px_0px_#061a12] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100"
              }`}
            >
              {btn.label}
            </button>
          ))}
          <button
            onClick={fetchDashboard}
            title="Refresh analytics"
            className="neo-btn p-2 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000]"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 stroke-[2.5] ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-sm rounded">
          {error}
        </div>
      )}

      {isLoading && !data ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">
            Calculating financial metrics...
          </p>
        </div>
      ) : data ? (
        <>
          <SummaryCards summary={data.summary} />

          {data.summary.transaction_count === 0 && (
            <div className="p-8 text-center bg-surface-light dark:bg-surface-dark border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No Transactions Recorded for This Period
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                Vaultwise shows real data only without fabricating figures.
                Start recording your expenses and income or import an existing
                statement.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={onOpenAddTransaction}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Transaction</span>
                </button>
                <button
                  onClick={onNavigateToImport}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Statement</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingTrendChart data={data.trend} />
            <CategoryBreakdownChart categories={data.category_breakdown} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FinancialInsights insights={data.insights} />
            </div>

            <div className="lg:col-span-2">
              <Card
                title="Recent Activity"
                subtitle="Latest recorded entries"
                action={
                  <button
                    onClick={onOpenAddTransaction}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                }
              >
                {data.recent_transactions.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No recent transactions found.
                  </p>
                ) : (
                  <div className="divide-y divide-border-light dark:divide-border-dark overflow-x-auto">
                    {data.recent_transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: tx.category_color || "#64748b",
                            }}
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {tx.description}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              {tx.date} • {tx.category_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`font-mono font-bold ${
                              tx.type === "expense"
                                ? "text-red-600 dark:text-red-400"
                                : tx.type === "income"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-teal-600 dark:text-teal-400"
                            }`}
                          >
                            {tx.type === "expense" ? "-" : "+"}
                            {currencySymbol}
                            {tx.amount_display}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => onOpenEditTransaction(tx)}
                              className="p-1 text-slate-400 hover:text-brand-500 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecent(tx.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
