import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SUPPORTED_CURRENCIES, CurrencyOption } from "../constants/currencies";

interface CurrencySwitcherProps {
  className?: string;
  variant?: "header" | "sidebar" | "inline";
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  className = "",
  variant = "header",
}) => {
  const { user, updateSettings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCode = user?.settings?.currency_code || "INR";
  const currentSymbol = user?.settings?.currency_symbol || "₹";
  const activeCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currentCode) ||
    SUPPORTED_CURRENCIES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (currency: CurrencyOption) => {
    if (currency.code === currentCode && currency.symbol === currentSymbol) {
      setIsOpen(false);
      return;
    }

    try {
      setIsUpdating(true);
      await updateSettings({
        currency_code: currency.code,
        currency_symbol: currency.symbol,
      });
      setIsOpen(false);
      setSearchTerm("");
    } catch (err: any) {
      console.error("Failed to change currency:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.includes(searchTerm) ||
      c.flag.includes(searchTerm),
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border-2 active:translate-x-0.5 active:translate-y-0.5 ${
          variant === "header"
            ? "bg-white hover:bg-slate-50 text-slate-900 border-slate-900 shadow-[2.5px_2.5px_0px_#0f172a] active:shadow-none"
            : "w-full justify-between bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-700 shadow-[2px_2px_0px_#000000] active:shadow-none px-3 py-2"
        }`}
        title="Change display currency & flag"
        aria-label="Change display currency"
        aria-expanded={isOpen}
      >
        <span className="flex items-center space-x-1.5">
          <span
            className="text-base leading-none select-none"
            role="img"
            aria-label={activeCurrency.name}
          >
            {activeCurrency.flag}
          </span>
          <span
            className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] border ${
              variant === "header"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-600 bg-slate-900 text-white"
            }`}
          >
            {currentSymbol}
          </span>
          <span
            className={`font-black ${variant === "header" ? "text-slate-900" : "text-white"}`}
          >
            {currentCode}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-slate-900 rounded-xl shadow-[6px_6px_0px_#0f172a] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b-2 border-slate-900 bg-slate-50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                placeholder="Search currency or flag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 neu-input text-xs text-slate-900 placeholder-slate-400 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 px-0.5 font-bold tracking-wide">
              Select currency. Updates symbol & flag across all records.
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100">
            {filteredCurrencies.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-semibold">
                No currency matches "{searchTerm}"
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === currentCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-black"
                        : "text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="text-xl leading-none select-none shrink-0"
                        role="img"
                        aria-label={c.name}
                      >
                        {c.flag}
                      </span>
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-xs shrink-0 border-2 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-[1px_1px_0px_#064e3b]"
                            : "border-slate-900 bg-white text-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]"
                        }`}
                      >
                        {c.symbol}
                      </span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-slate-900">
                            {c.code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[130px]">
                            {c.name.split("—")[1]?.trim() || c.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
