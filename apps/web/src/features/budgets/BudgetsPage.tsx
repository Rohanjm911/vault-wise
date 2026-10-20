import React, { useState, useEffect } from "react";
import { Plus, Trash2, PieChart } from "lucide-react";
import { BudgetProgress, Category } from "../../types";
import { api } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";

interface BudgetsPageProps {
  categories: Category[];
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ categories }) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const [period, setPeriod] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<BudgetProgress[]>(`/budgets?period=${period}`);
      setBudgets(data);
    } catch (err: any) {
      setError(err.message || "Failed to load budgets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [period]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const val = parseFloat(amountStr);
    if (isNaN(val) || val < 0) {
      setModalError(
        "Please enter a valid budget limit amount (zero or greater).",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/budgets", {
        category_id: selectedCatId || null,
        period,
        limit_cents: Math.round(val * 100),
      });
      setIsModalOpen(false);
      setAmountStr("");
      setSelectedCatId("");
      fetchBudgets();
    } catch (err: any) {
      setModalError(err.message || "Failed to save budget.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm("Delete this budget limit?")) return;
    try {
      await api.delete(`/budgets/${budgetId}`);
      fetchBudgets();
    } catch (err: any) {
      alert(err.message || "Failed to delete budget.");
    }
  };

  const overallBudget = budgets.find(
    (b: BudgetProgress) => b.category_id === null,
  );
  const categoryBudgets = budgets.filter(
    (b: BudgetProgress) => b.category_id !== null,
  );

  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <div className="neo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Budget Month:
          </label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="neu-input px-3.5 py-1.5 text-xs font-mono font-black text-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setAmountStr("");
            setSelectedCatId("");
            setIsModalOpen(true);
          }}
          className="neo-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center space-x-1.5 self-start sm:self-auto shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Set Budget Limit</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-900 border-2 border-red-500 rounded-xl text-xs font-bold shadow-[2px_2px_0px_#ef4444]">
          {error}
        </div>
      )}

      {overallBudget && (
        <Card
          title="Overall Monthly Budget"
          subtitle={`Total spending cap for ${period}`}
        >
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {currencySymbol}
                  {(overallBudget.spent_cents / 100).toFixed(2)}
                </span>
                <span className="text-slate-500 text-sm ml-2 font-bold">
                  of {currencySymbol}
                  {(overallBudget.limit_cents / 100).toFixed(2)} limit
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-black font-mono ${
                    overallBudget.is_over_budget
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {overallBudget.is_over_budget
                    ? `Over budget by ${currencySymbol}${(Math.abs(overallBudget.remaining_cents) / 100).toFixed(2)}`
                    : `${currencySymbol}${(overallBudget.remaining_cents / 100).toFixed(2)} remaining`}
                </span>
                <span className="text-xs text-slate-400 ml-2 font-black">
                  ({overallBudget.utilization_percent.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="w-full h-4 neu-input p-0.5 rounded-full overflow-hidden flex items-center">
              <div
                className={`h-full rounded-full transition-all duration-300 border border-slate-900 ${
                  overallBudget.is_over_budget
                    ? "bg-red-600"
                    : overallBudget.utilization_percent >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(100, overallBudget.utilization_percent)}%`,
                }}
              />
            </div>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
          Category Budgets ({categoryBudgets.length})
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold">
            Loading budget tracking metrics...
          </div>
        ) : categoryBudgets.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0f2019] border-2 border-dashed border-slate-400 dark:border-[#1c382d] rounded-xl shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000]">
            <PieChart className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[2.5]" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              No Category Budgets Configured for {period}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-3 font-medium">
              Set spending limits on groceries, dining, entertainment or
              utilities to track progress and prevent overspending.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="neo-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black inline-flex items-center space-x-1.5 shadow-[2px_2px_0px_#061a12] dark:shadow-[2px_2px_0px_#000]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Category Budget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b: BudgetProgress) => (
              <Card
                interactive
                key={b.id || b.category_id}
                className="relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-900"
                      style={{ backgroundColor: b.category_color || "#64748b" }}
                    />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {b.category_name}
                    </h4>
                  </div>
                  {b.id && (
                    <button
                      onClick={() => handleDeleteBudget(b.id!)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg border border-transparent hover:border-slate-700 transition-colors"
                      title="Remove budget"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500 font-bold">Spent:</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {currencySymbol}
                      {(b.spent_cents / 100).toFixed(2)} / {currencySymbol}
                      {(b.limit_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500 font-bold">Remaining:</span>
                    <span
                      className={`font-black ${
                        b.is_over_budget
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {b.is_over_budget ? "-" : ""}
                      {currencySymbol}
                      {(Math.abs(b.remaining_cents) / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full h-3 neu-input p-0.5 rounded-full overflow-hidden flex items-center mt-2">
                    <div
                      className={`h-full rounded-full ${
                        b.is_over_budget
                          ? "bg-red-600"
                          : b.utilization_percent >= 80
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(100, b.utilization_percent)}%`,
                      }}
                    />
                  </div>

                  <div className="text-right text-[11px] text-slate-400 pt-1 font-black">
                    {b.utilization_percent.toFixed(1)}% utilized
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Budget Limit"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-100 text-red-800 text-xs rounded font-medium">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Scope
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white"
            >
              <option value="">Overall Monthly Budget (All Expenses)</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Month Period
            </label>
            <input
              type="month"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Spending Limit ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="500.00"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Set Budget"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
