import React from "react";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  History,
  Tags,
  Upload,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export type NavTab =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "history"
  | "categories"
  | "import"
  | "reports"
  | "settings";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <Receipt className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: <PieChart className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "history",
      label: "Spending History",
      icon: <History className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Tags className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "import",
      label: "Import Statement",
      icon: <Upload className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "reports",
      label: "Reports & Export",
      icon: <FileText className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5 stroke-[2.2]" />,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#0a1511] text-emerald-50 border-r-2 border-slate-900 dark:border-[#1c382d] w-64 select-none">
      <div className="p-5 border-b-2 border-slate-900 dark:border-[#1c382d] bg-[#060e0a]">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Vaultwise Logo"
            className="w-12 h-12 object-contain filter drop-shadow-md shrink-0 transition-transform duration-200 hover:scale-105"
          />
          <div>
            <h1 className="font-black text-xl tracking-tight text-white leading-tight">
              Vaultwise
            </h1>
            <p className="text-[11px] font-black text-emerald-400 tracking-wider uppercase mt-0.5">
              Your Money. Your Rules.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-2 ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-[3px_3px_0px_#000000] translate-x-0.5"
                  : "text-slate-300 border-transparent hover:border-[#1c382d] hover:bg-[#10241d] hover:text-white"
              }`}
            >
              <span className={isActive ? "text-white" : "text-emerald-400/80"}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-slate-900 dark:border-[#1c382d] bg-[#060e0a]">
        <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-black tracking-wider uppercase mb-3 px-1">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
          <span>Local Vault Encrypted</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1c382d]">
          <div className="truncate mr-2">
            <p className="text-xs font-black text-white truncate">
              {user?.full_name}
            </p>
            <p className="text-[11px] text-emerald-300/70 truncate font-mono">
              {user?.email}
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 border border-[#1c382d] bg-[#10241d] hover:bg-red-950/60 hover:border-red-700 rounded-lg text-slate-300 hover:text-red-400 transition-all shadow-[1.5px_1.5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block h-screen sticky top-0">{content}</aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-xs h-full bg-[#0a1511] shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
