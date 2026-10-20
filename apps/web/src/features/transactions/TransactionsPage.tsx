import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Transaction, TransactionPagination, Category } from "../../types";
import { api } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

interface TransactionsPageProps {
  onOpenAddTransaction: () => void;
  onOpenEditTransaction: (tx: Transaction) => void;
  categories: Category[];
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddTransaction,
  onOpenEditTransaction,
  categories,
}) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const [data, setData] = useState<TransactionPagination | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (search.trim()) params.append("search", search.trim());
      if (typeFilter) params.append("type", typeFilter);
      if (categoryFilter) params.append("category_id", categoryFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await api.get<TransactionPagination>(
        `/transactions?${params.toString()}`,
      );
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
  };

  const handleDelete = async (txId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this transaction record?",
      )
    )
      return;
    try {
      await api.delete(`/transactions/${txId}`);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || "Failed to delete transaction.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSearchSubmit} className="space-y-3.5">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              <input
                type="text"
                placeholder="Search descriptions, merchants, or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 neu-input text-xs md:text-sm text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button
                type="submit"
                className="neo-btn px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="neo-btn px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center space-x-1 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t-2 border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="block text-slate-500 uppercase font-black text-[10px] tracking-wider mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 neu-input text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 uppercase font-black text-[10px] tracking-wider mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 neu-input text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 uppercase font-black text-[10px] tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 neu-input text-slate-800 dark:text-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 uppercase font-black text-[10px] tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 neu-input text-slate-800 dark:text-slate-200 text-xs font-bold"
              />
            </div>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-black tracking-wide text-slate-500 dark:text-slate-400 uppercase">
            Showing {data?.items.length || 0} of {data?.total || 0} transactions
          </p>
          <button
            onClick={onOpenAddTransaction}
            className="neo-btn px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center space-x-1 shadow-[2.5px_2.5px_0px_#061a12] dark:shadow-[2.5px_2.5px_0px_#000]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-900 border-2 border-red-500 rounded-xl text-xs mb-4 font-bold shadow-[2px_2px_0px_#ef4444]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">
              Loading transactions...
            </p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-semibold">
            <p>No transactions match your search criteria.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-slate-900 dark:border-[#1c382d]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#0a1511] border-b-2 border-slate-900 dark:border-[#1c382d] text-slate-800 dark:text-slate-200 uppercase tracking-wider font-black">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-[#1c382d] bg-white dark:bg-[#0f2019]">
                {data.items.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900 dark:text-white">
                        {tx.description}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5 font-medium">
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-slate-900"
                          style={{
                            backgroundColor: tx.category_color || "#64748b",
                          }}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {tx.category_name}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge
                        variant={
                          tx.type === "expense"
                            ? "expense"
                            : tx.type === "income"
                              ? "income"
                              : "transfer"
                        }
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-black text-sm">
                      <span
                        className={
                          tx.type === "expense"
                            ? "text-red-600 dark:text-red-400"
                            : tx.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-teal-600 dark:text-teal-400"
                        }
                      >
                        {tx.type === "expense" ? "-" : "+"}
                        {currencySymbol}
                        {tx.amount_display}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onOpenEditTransaction(tx)}
                          className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200 dark:bg-[#10241d] dark:hover:bg-[#152e24] rounded-lg border border-slate-300 dark:border-[#1c382d] transition-all shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-red-600 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 rounded-lg border border-slate-300 dark:border-slate-700 transition-all shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-bold">
              Page {data.page} of {data.total_pages}
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="neo-btn p-1.5 bg-white dark:bg-slate-800 disabled:opacity-40 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                disabled={page >= data.total_pages}
                onClick={() =>
                  setPage((p) => Math.min(data.total_pages, p + 1))
                }
                className="neo-btn p-1.5 bg-white dark:bg-slate-800 disabled:opacity-40 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
