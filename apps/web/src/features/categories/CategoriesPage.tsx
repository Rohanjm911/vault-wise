import React, { useState } from "react";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { Category } from "../../types";
import { api } from "../../services/apiClient";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";

interface CategoriesPageProps {
  categories: Category[];
  onRefreshCategories: () => void;
}

const SOLID_PALETTE = [
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#059669",
  "#64748B",
  "#EF4444",
  "#D97706",
  "#2563EB",
  "#475569",
];

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  onRefreshCategories,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [colorHex, setColorHex] = useState<string>("#2563EB");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setType("expense");
    setColorHex("#2563EB");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColorHex(cat.color_hex);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a category title.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, {
          name: name.trim(),
          type,
          color_hex: colorHex,
        });
      } else {
        await api.post("/categories", {
          name: name.trim(),
          type,
          color_hex: colorHex,
          icon_name: "tag",
        });
      }
      setIsModalOpen(false);
      onRefreshCategories();
    } catch (err: any) {
      setError(err.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.is_system) {
      alert("System pre-seeded categories cannot be deleted.");
      return;
    }
    if (
      !window.confirm(
        `Delete "${cat.name}"? Transactions in this category will be reassigned to "Other".`,
      )
    ) {
      return;
    }
    try {
      await api.delete(`/categories/${cat.id}`);
      onRefreshCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category.");
    }
  };

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6">
      <div className="neo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Category Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Organize transactions and customize spending buckets. Deleting a
            category preserves all transaction records.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="neo-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center space-x-1.5 self-start sm:self-auto shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Category</span>
        </button>
      </div>

      <div>
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Expense Categories ({expenseCats.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {expenseCats.map((cat) => (
            <Card
              interactive
              key={cat.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 truncate">
                <span
                  className="w-4 h-4 rounded-md border border-slate-900 flex-shrink-0"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {cat.name}
                </span>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {cat.is_system ? (
                  <span title="System Category" className="text-slate-400 px-1">
                    <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1 text-slate-500 hover:text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Income Categories ({incomeCats.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {incomeCats.map((cat) => (
            <Card
              interactive
              key={cat.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 truncate">
                <span
                  className="w-4 h-4 rounded-md border border-slate-900 flex-shrink-0"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {cat.name}
                </span>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {cat.is_system ? (
                  <span title="System Category" className="text-slate-400 px-1">
                    <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1 text-slate-500 hover:text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create Custom Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-900 border-2 border-red-500 text-xs rounded-xl font-bold shadow-[2px_2px_0px_#ef4444]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Category Title *
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions, Groceries, Freelance"
              className="w-full px-3.5 py-2 neu-input text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Category Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3.5 py-2 neu-input text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Solid Accent Color (No Gradients)
            </label>
            <div className="grid grid-cols-8 gap-2 mb-3">
              {SOLID_PALETTE.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorHex(hex)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                    colorHex.toLowerCase() === hex.toLowerCase()
                      ? "border-slate-950 dark:border-white scale-110 shadow-[2px_2px_0px_#000]"
                      : "border-slate-800/40 hover:scale-105"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span
                className="w-6 h-6 rounded-md border-2 border-slate-900"
                style={{ backgroundColor: colorHex }}
              />
              <input
                type="text"
                pattern="^#[0-9A-Fa-f]{6}$"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-28 px-2.5 py-1 text-xs font-mono font-black neu-input uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-slate-900 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="neo-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
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
                : editingCategory
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
