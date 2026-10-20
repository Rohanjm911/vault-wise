import React, { useState, useEffect } from "react";
import { Modal } from "../../components/Modal";
import { Category, Transaction } from "../../types";
import { api } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
  categories,
}) => {
  const { user } = useAuth();
  const currencySymbol = user?.settings?.currency_symbol || "$";

  const [type, setType] = useState<"expense" | "income" | "transfer">(
    "expense",
  );
  const [amountStr, setAmountStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmountStr(transactionToEdit.amount_display);
      setDateStr(transactionToEdit.date);
      setCategoryId(transactionToEdit.category_id || "");
      setDescription(transactionToEdit.description);
      setNotes(transactionToEdit.notes || "");
    } else {
      setType("expense");
      setAmountStr("");
      setDateStr(new Date().toISOString().split("T")[0]);
      const defaultCat = categories.find((c) => c.type === "expense");
      setCategoryId(defaultCat ? defaultCat.id : "");
      setDescription("");
      setNotes("");
    }
    setError(null);
  }, [transactionToEdit, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid monetary amount greater than 0.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description for this transaction.");
      return;
    }

    const amount_cents = Math.round(parsedAmount * 100);

    setIsSubmitting(true);
    try {
      if (transactionToEdit) {
        await api.put(`/transactions/${transactionToEdit.id}`, {
          type,
          amount_cents,
          date: dateStr,
          category_id: categoryId || null,
          description: description.trim(),
          notes: notes.trim() || null,
        });
      } else {
        await api.post("/transactions", {
          type,
          amount_cents,
          date: dateStr,
          category_id: categoryId || null,
          description: description.trim(),
          notes: notes.trim() || null,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (type === "transfer") return false;
    return c.type === type;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? "Edit Transaction" : "Record Transaction"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-950/80 border-2 border-red-600 dark:border-red-500 text-red-900 dark:text-red-200 text-xs rounded-xl font-bold shadow-[2px_2px_0px_#ef4444]">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2.5 text-xs font-black rounded-xl uppercase tracking-wider transition-all border-2 cursor-pointer ${
                type === "expense"
                  ? "bg-red-600 text-white border-slate-900 shadow-[3px_3px_0px_#000] -translate-y-0.5"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2.5 text-xs font-black rounded-xl uppercase tracking-wider transition-all border-2 cursor-pointer ${
                type === "income"
                  ? "bg-emerald-600 text-white border-slate-900 shadow-[3px_3px_0px_#000] -translate-y-0.5"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={`py-2.5 text-xs font-black rounded-xl uppercase tracking-wider transition-all border-2 cursor-pointer ${
                type === "transfer"
                  ? "bg-teal-600 text-white border-slate-900 shadow-[3px_3px_0px_#000] -translate-y-0.5"
                  : "bg-slate-100 dark:bg-[#10241d] text-slate-700 dark:text-slate-300 border-slate-900 dark:border-[#1c382d] shadow-[2px_2px_0px_#061a12] dark:shadow-[2px_2px_0px_#000]"
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Amount ({currencySymbol}) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-black text-sm">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3.5 py-2.5 neu-input text-slate-900 dark:text-white font-mono font-black text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3.5 py-2 neu-input text-slate-900 dark:text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 neu-input text-slate-900 dark:text-white text-xs font-bold"
            >
              <option value="">Uncategorized</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Description *
          </label>
          <input
            type="text"
            required
            maxLength={255}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery Store, Electric Bill"
            className="w-full px-3.5 py-2 neu-input text-slate-900 dark:text-white text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add relevant context or receipt memos..."
            className="w-full px-3.5 py-2 neu-input text-slate-900 dark:text-white text-xs font-medium"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-slate-900 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="neo-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="neo-btn px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : transactionToEdit
                ? "Update Transaction"
                : "Save Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
