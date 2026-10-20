import React, { useState } from "react";
import { ShieldCheck, Cpu, Save, CheckCircle, Database } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { api } from "../../services/apiClient";
import { SUPPORTED_CURRENCIES as CURRENCIES } from "../../constants/currencies";

const DATE_FORMATS = [
  { id: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-10-20)" },
  { id: "DD/MM/YYYY", label: "DD/MM/YYYY (20/10/2026)" },
  { id: "MM/DD/YYYY", label: "MM/DD/YYYY (10/20/2026)" },
];

export const SettingsPage: React.FC = () => {
  const { user, updateSettings } = useAuth();

  const [currencyCode, setCurrencyCode] = useState<string>(
    user?.settings?.currency_code || "USD",
  );
  const [dateFormat, setDateFormat] = useState<string>(
    user?.settings?.date_format || "YYYY-MM-DD",
  );
  const [aiConsent, setAiConsent] = useState<boolean>(
    user?.settings?.ai_consent || false,
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [aiInsightResult, setAiInsightResult] = useState<any | null>(null);
  const [isQueryingAi, setIsQueryingAi] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const matchedCurrency = CURRENCIES.find((c) => c.code === currencyCode);
    const symbol = matchedCurrency ? matchedCurrency.symbol : "$";

    try {
      await updateSettings({
        currency_code: currencyCode,
        currency_symbol: symbol,
        date_format: dateFormat,
        theme_mode: "light",
        ai_consent: aiConsent,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAiQuery = async () => {
    if (!aiConsent) {
      alert("You must enable AI Consent and save settings first.");
      return;
    }
    setIsQueryingAi(true);
    try {
      const res = await api.post("/ai/insights");
      setAiInsightResult(res);
    } catch (err: any) {
      alert(`AI query error: ${err.message}`);
    } finally {
      setIsQueryingAi(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="neo-card p-5 bg-white dark:bg-[#151f32]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Preferences & Application Settings
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
              Configure display currency, formatting, and privacy controls.
              Changing currency adjusts display symbols without altering
              recorded numbers.
            </p>
          </div>
          <span className="neo-badge bg-emerald-600 text-white hidden sm:inline-block">
            System Preferences
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200 text-xs rounded-xl font-bold shadow-[3px_3px_0px_#10b981] flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="uppercase tracking-wider">
            Preferences updated successfully!
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Regional Display Conventions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Display Currency
              </label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full px-3 py-2.5 neu-input text-xs font-bold"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                Display symbol prefix. Does not perform unverified automatic FX
                conversions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Date Display Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2.5 neu-input text-xs font-bold"
              >
                {DATE_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                Standard format used in tables, forms, and exports.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Optional AI-Assisted Analysis"
          subtitle="Strictly opt-in. Deterministic calculations are always default."
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-start space-x-3.5 p-4 bg-white dark:bg-[#0f2019] border-2 border-slate-900 dark:border-[#1c382d] rounded-xl shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#020617]">
              <input
                type="checkbox"
                id="ai-consent-checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-2 border-slate-900 focus:ring-emerald-500"
              />
              <label
                htmlFor="ai-consent-checkbox"
                className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer font-medium"
              >
                <span className="font-black uppercase tracking-tight text-slate-900 dark:text-white block mb-1">
                  I explicitly authorize optional AI-assisted qualitative
                  analysis
                </span>
                When enabled, Vaultwise may generate qualitative
                natural-language summaries. Only sanitized aggregate figures
                (e.g. monthly category percentages) are processed; individual
                transaction descriptions, bank accounts, and personal names are
                never transmitted.
              </label>
            </div>

            {aiConsent && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isQueryingAi}
                  onClick={handleTestAiQuery}
                  className="neo-btn px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] flex items-center space-x-2 disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" />
                  <span>
                    {isQueryingAi ? "Querying..." : "Test AI Analysis Endpoint"}
                  </span>
                </button>
              </div>
            )}

            {aiInsightResult && (
              <div className="neo-card p-4 bg-slate-100 dark:bg-[#08120e] text-xs space-y-2">
                <p className="font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Endpoint Observation Response:
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {aiInsightResult.summary_text}
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  {aiInsightResult.disclaimer}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Data Isolation & Privacy Philosophy">
          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 font-medium">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#061a12] flex-shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Strict Web and Desktop Separation
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Vaultwise enforces complete dataset isolation by design. The
                  Windows Desktop Application operates offline with local
                  SQLCipher AES-256 encryption. The Web Application stores data
                  in PostgreSQL under your authenticated tenant. There is no
                  automatic synchronization and no silent cloud telemetry.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pt-3 border-t-2 border-slate-900/10 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Portable Ownership
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  To migrate records between devices or applications, use the
                  user-initiated CSV or Excel Import and Export engine.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="neo-btn px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000] flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Changes..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
