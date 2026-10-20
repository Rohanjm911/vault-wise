import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "income" | "expense" | "transfer" | "warning" | "info" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
}) => {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  const variantClasses = {
    income:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-2 border-emerald-600 dark:border-emerald-500 shadow-[1.5px_1.5px_0px_#059669]",
    expense:
      "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 border-2 border-red-600 dark:border-red-500 shadow-[1.5px_1.5px_0px_#dc2626]",
    transfer:
      "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border-2 border-teal-600 dark:border-teal-500 shadow-[1.5px_1.5px_0px_#0d9488]",
    warning:
      "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-2 border-amber-600 dark:border-amber-500 shadow-[1.5px_1.5px_0px_#d97706]",
    info: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border-2 border-slate-900 dark:border-slate-700 shadow-[1.5px_1.5px_0px_#000]",
    neutral:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-2 border-slate-900 dark:border-slate-700 shadow-[1.5px_1.5px_0px_#000]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-md font-black uppercase tracking-wider ${sizeClasses} ${variantClasses}`}
    >
      {children}
    </span>
  );
};
