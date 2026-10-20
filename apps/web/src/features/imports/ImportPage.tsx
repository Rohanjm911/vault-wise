import React, { useState } from "react";
import { Upload, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { ImportPreviewResponse } from "../../types";
import { api } from "../../services/apiClient";
import { Card } from "../../components/Card";

interface ImportPageProps {
  onImportSuccess: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [dateCol, setDateCol] = useState<string>("");
  const [amtCol, setAmtCol] = useState<string>("");
  const [descCol, setDescCol] = useState<string>("");
  const [catCol, setCatCol] = useState<string>("");
  const [typeCol, setTypeCol] = useState<string>("");
  const [notesCol, setNotesCol] = useState<string>("");
  const [dupPolicy, setDupPolicy] = useState<"skip" | "overwrite" | "allow">(
    "skip",
  );

  const [commitResult, setCommitResult] = useState<any | null>(null);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setCommitResult(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post<ImportPreviewResponse>(
        "/imports/preview",
        formData,
      );
      setPreview(response);
      setDateCol(response.suggested_mappings["date"] || "");
      setAmtCol(response.suggested_mappings["amount"] || "");
      setDescCol(response.suggested_mappings["description"] || "");
      setCatCol(response.suggested_mappings["category"] || "");
      setTypeCol(response.suggested_mappings["type"] || "");
    } catch (err: any) {
      setError(err.message || "Failed to inspect file.");
      setFile(null);
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file || !dateCol || !amtCol || !descCol) {
      setError("Please map Date, Amount, and Description columns.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const mappingPayload = {
      filename: file.name,
      date_column: dateCol,
      amount_column: amtCol,
      description_column: descCol,
      category_column: catCol || undefined,
      type_column: typeCol || undefined,
      notes_column: notesCol || undefined,
      duplicate_policy: dupPolicy,
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mapping_json", JSON.stringify(mappingPayload));

    try {
      const result = await api.post<any>("/imports/commit", formData);
      setCommitResult(result);
      onImportSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to execute import.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setCommitResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="neo-card p-5 bg-white dark:bg-[#0f2019]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Import Financial Records
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
              Safely ingest CSV and Excel statements into your personal ledger.
              External formulas and macros are disabled for security.
            </p>
          </div>
          <span className="neo-badge bg-emerald-600 text-white hidden sm:inline-block">
            Ledger Importer
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-950/60 border-2 border-red-600 dark:border-red-500 text-red-900 dark:text-red-200 text-xs rounded-xl font-bold shadow-[3px_3px_0px_#ef4444]">
          {error}
        </div>
      )}

      {!preview && !commitResult && (
        <div className="neo-card p-10 bg-white dark:bg-[#0f2019] text-center">
          <input
            type="file"
            id="statement-upload"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <label
            htmlFor="statement-upload"
            className="cursor-pointer inline-flex flex-col items-center w-full max-w-lg mx-auto p-8 rounded-xl neu-input border-2 border-dashed border-slate-900 dark:border-[#1c382d] hover:border-emerald-500 transition-colors group"
          >
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-xl border-2 border-slate-900 dark:border-[#1c382d] shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
              Select or Drop Bank Statement File
            </h4>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
              Supported formats: CSV (.csv), Excel (.xlsx, .xls) up to 10 MB
            </p>
            <span className="neo-btn px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] inline-flex items-center">
              Browse Files
            </span>
          </label>
        </div>
      )}

      {preview && !commitResult && (
        <div className="space-y-6">
          <Card
            title="Step 2: Match File Headers"
            subtitle={`Detected ${preview.total_rows} rows from "${preview.filename}"`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Date Column *
                </label>
                <select
                  value={dateCol}
                  onChange={(e) => setDateCol(e.target.value)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="">Select Date Column</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Amount Column *
                </label>
                <select
                  value={amtCol}
                  onChange={(e) => setAmtCol(e.target.value)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="">Select Amount Column</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Description Column *
                </label>
                <select
                  value={descCol}
                  onChange={(e) => setDescCol(e.target.value)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="">Select Description Column</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Category (Optional)
                </label>
                <select
                  value={catCol}
                  onChange={(e) => setCatCol(e.target.value)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="">Auto-Assign / Default</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Type (Optional)
                </label>
                <select
                  value={typeCol}
                  onChange={(e) => setTypeCol(e.target.value)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="">Infer from sign (+ / -)</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <select
                  value={notesCol}
                  onChange={(e) => setNotesCol(e.target.value)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="">None</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Duplicate Policy
                </label>
                <select
                  value={dupPolicy}
                  onChange={(e) => setDupPolicy(e.target.value as any)}
                  className="w-full px-3 py-2 neu-input text-xs font-bold"
                >
                  <option value="skip">Skip duplicates (Safe)</option>
                  <option value="overwrite">Overwrite existing</option>
                  <option value="allow">Allow all entries</option>
                </select>
              </div>
            </div>
          </Card>

          <Card
            title="Sample Rows Validation"
            subtitle="Showing first parsed records prior to commit"
          >
            <div className="border-2 border-slate-900 dark:border-[#1c382d] rounded-xl overflow-hidden shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] overflow-x-auto">
              <table className="w-full text-left text-xs bg-white dark:bg-[#0f2019]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#0a1511] border-b-2 border-slate-900 dark:border-[#1c382d] text-slate-900 dark:text-white uppercase tracking-wider font-black text-[11px]">
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-[#1c382d] font-mono">
                  {preview.preview_rows.map((row) => (
                    <tr
                      key={row.row_number}
                      className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-400">
                        {row.row_number}
                      </td>
                      <td className="py-2.5 px-3">
                        {row.is_valid ? (
                          <span className="neo-badge bg-emerald-600 text-white inline-flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Valid
                          </span>
                        ) : (
                          <span className="neo-badge bg-red-600 text-white inline-flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />{" "}
                            {row.validation_error || "Invalid"}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {row.detected_date || "—"}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white truncate max-w-xs">
                        {row.detected_description || "—"}
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white">
                        {row.detected_amount ? `$${row.detected_amount}` : "—"}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[11px] font-sans font-black text-slate-700 dark:text-slate-300">
                        {row.detected_type || "Expense"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-slate-900/10 dark:border-[#1c382d]">
              <button
                type="button"
                onClick={resetAll}
                className="neo-btn px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
              >
                Cancel & Change File
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleCommit}
                className="neo-btn px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] flex items-center space-x-2 disabled:opacity-50"
              >
                <span>
                  {isLoading ? "Importing Rows..." : "Confirm & Commit Import"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {commitResult && (
        <Card title="Import Summary Report">
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-xl border-2 border-slate-900 dark:border-[#1c382d] shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Successfully Imported {commitResult.imported_count} Records
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-xs font-mono text-left pt-2">
              <div className="neo-card-interactive p-4 bg-white dark:bg-[#0f2019]">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-black uppercase tracking-wider">
                  Total Processed
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                  {commitResult.total_processed}
                </span>
              </div>
              <div className="neo-card-interactive p-4 bg-white dark:bg-[#0f2019]">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-black uppercase tracking-wider">
                  Duplicates Skipped
                </span>
                <span className="text-xl font-black text-amber-500 mt-1 block">
                  {commitResult.skipped_duplicates}
                </span>
              </div>
              <div className="neo-card-interactive p-4 bg-white dark:bg-[#0f2019]">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-black uppercase tracking-wider">
                  Failed Rows
                </span>
                <span className="text-xl font-black text-red-500 mt-1 block">
                  {commitResult.failed_count}
                </span>
              </div>
            </div>

            {commitResult.errors.length > 0 && (
              <div className="max-w-xl mx-auto text-left text-xs bg-red-100 dark:bg-red-950/60 p-4 rounded-xl border-2 border-red-600 dark:border-red-500 text-red-900 dark:text-red-200 shadow-[3px_3px_0px_#ef4444]">
                <p className="font-black uppercase tracking-wider text-xs mb-2">
                  Row Issues Logged:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-semibold">
                  {commitResult.errors.map((err: string, idx: number) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={resetAll}
                className="neo-btn px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000]"
              >
                Import Another Statement
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
