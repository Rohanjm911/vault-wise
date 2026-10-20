import React from "react";
import { Menu, Plus } from "lucide-react";
import { CurrencySwitcher } from "./CurrencySwitcher";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onOpenAddTransaction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenAddTransaction,
}) => {
  return (
    <header className="bg-white dark:bg-[#0f2019] border-b-2 border-slate-900 dark:border-[#1d3d30] px-4 py-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_0px_rgba(15,23,42,0.06)]">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-700 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-[#152e24] neo-btn rounded-xl"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-slate-500 dark:text-emerald-300/70 font-semibold mt-0.5 tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <CurrencySwitcher variant="header" />

        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="neo-btn flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs md:text-sm shadow-[3px_3px_0px_#061a12] dark:shadow-[3px_3px_0px_#000000]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>
    </header>
  );
};
