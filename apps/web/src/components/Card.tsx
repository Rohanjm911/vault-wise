import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  action,
  interactive = false,
}) => {
  return (
    <div
      className={`${interactive ? "neo-card-interactive" : "neo-card"} p-5 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-100 dark:border-slate-800/80">
          <div>
            {title && (
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
