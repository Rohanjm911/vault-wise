import React, { useState, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { Category } from "../../types";
import { api } from "../../services/apiClient";
import { Card } from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { SUPPORTED_CURRENCIES } from "../../constants/currencies";

interface ReportsPageProps {
  categories: Category[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ categories }) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [currencyCode, setCurrencyCode] = useState<string>(
    user?.settings?.currency_code || "INR",
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    user?.settings?.currency_symbol || "₹",
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.settings?.currency_code) {
      setCurrencyCode(user.settings.currency_code);
    }
    if (user?.settings?.currency_symbol) {
      setCurrencySymbol(user.settings.currency_symbol);
    }
  }, [user?.settings?.currency_code, user?.settings?.currency_symbol]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (categoryId) params.append("category_id", categoryId);
    if (currencyCode) params.append("currency_code", currencyCode);
    if (currencySymbol) params.append("currency_symbol", currencySymbol);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setIsExporting(true);
    setDownloadMessage(null);
    const dateStr = new Date().toISOString().split("T")[0];
    const query = buildQuery();

    try {
      if (format === "csv") {
        await api.downloadFile(
          `/exports/csv${query}`,
          `vaultwise-transactions-${dateStr}.csv`,
        );
      } else if (format === "excel") {
        await api.downloadFile(
          `/exports/excel${query}`,
          `vaultwise-financial-report-${dateStr}.xlsx`,
        );
      } else if (format === "pdf") {
        await api.downloadFile(
          `/exports/pdf${query}`,
          `vaultwise-statement-${dateStr}.pdf`,
        );
      }
      setDownloadMessage(
        `Successfully exported ${format.toUpperCase()} report in ${currencyCode} (${currencySymbol}).`,
      );
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="neo-card p-5 bg-white dark:bg-[#151f32]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Reports & Data Export
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
              Generate presentation-ready statements and portable backups in
              standard formats. Exported figures match your dashboard
              calculations down to the exact cent.
            </p>
          </div>
          <span className="neo-badge bg-emerald-600 text-white hidden sm:inline-block">
            Vault Exporter
          </span>
        </div>
      </div>

      <div className="p-4 bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-600 dark:border-amber-500 rounded-xl flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200 shadow-[3px_3px_0px_#d97706]">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black uppercase tracking-wider text-xs">
            Privacy Notice Regarding Exported Files
          </p>
          <p className="mt-1 leading-relaxed font-semibold text-amber-900 dark:text-amber-200">
            Exported documents contain unencrypted financial records. Ensure you
            store downloaded spreadsheets and statements in secure locations on
            your device.
          </p>
        </div>
      </div>

      {downloadMessage && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200 text-xs rounded-xl font-bold shadow-[3px_3px_0px_#10b981]">
          {downloadMessage}
        </div>
      )}

      <Card
        title="Filter Reporting Scope"
        subtitle="Optionally constrain exports to a date window, category, or currency"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 neu-input text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 neu-input text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 neu-input text-xs font-bold"
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
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Statement Currency
            </label>
            <select
              value={currencyCode}
              onChange={(e) => {
                const selected = SUPPORTED_CURRENCIES.find(
                  (c) => c.code === e.target.value,
                );
                if (selected) {
                  setCurrencyCode(selected.code);
                  setCurrencySymbol(selected.symbol);
                }
              }}
              className="w-full px-3 py-2 neu-input text-xs font-bold cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card-interactive flex flex-col justify-between p-6 bg-white dark:bg-[#0f2019]">
          <div>
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl border-2 border-slate-900 dark:border-[#1c382d] shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#020617] flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Raw CSV Export
            </h4>
            <div className="mt-2 flex items-center space-x-1.5">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Currency: {currencyCode} ({currencySymbol})
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Standard RFC-4180 CSV file containing all filtered transaction
              columns for backup or spreadsheet analysis.
            </p>
          </div>
          <button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="neo-btn mt-6 w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>

        <div className="neo-card-interactive flex flex-col justify-between p-6 bg-white dark:bg-[#0f2019]">
          <div>
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl border-2 border-slate-900 dark:border-[#1c382d] shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#020617] flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Microsoft Excel Workbook (.xlsx)
            </h4>
            <div className="mt-2 flex items-center space-x-1.5">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Currency: {currencyCode} ({currencySymbol})
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Multi-sheet Excel workbook with styled summaries, income/expense
              KPI tabs, and transaction registers.
            </p>
          </div>
          <button
            onClick={() => handleExport("excel")}
            disabled={isExporting}
            className="neo-btn mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white disabled:opacity-50"
          >
            Download Excel (.xlsx)
          </button>
        </div>

        <div className="neo-card-interactive flex flex-col justify-between p-6 bg-white dark:bg-[#0f2019]">
          <div>
            <div className="w-12 h-12 bg-red-500 text-white rounded-xl border-2 border-slate-900 dark:border-[#1c382d] shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#020617] flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Printable PDF Statement
            </h4>
            <div className="mt-2 flex items-center space-x-1.5">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                Currency: {currencyCode} ({currencySymbol})
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Clean, professional PDF statement with summary totals, solid color
              styling (no gradients), and formatted ledger.
            </p>
          </div>
          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="neo-btn mt-6 w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white disabled:opacity-50"
          >
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
