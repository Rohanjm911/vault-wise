import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import { InsightItem } from "../../../types";
import { Card } from "../../../components/Card";

interface FinancialInsightsProps {
  insights: InsightItem[];
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  insights,
}) => {
  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 stroke-[2.5]" />
        );
      case "warning":
        return (
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 stroke-[2.5]" />
        );
      case "success":
        return (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 stroke-[2.5]" />
        );
      default:
        return (
          <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 stroke-[2.5]" />
        );
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-2 border-red-600 dark:border-red-500 bg-red-50/80 dark:bg-red-950/40 shadow-[2px_2px_0px_#ef4444]";
      case "warning":
        return "border-2 border-amber-600 dark:border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-[2px_2px_0px_#f59e0b]";
      case "success":
        return "border-2 border-emerald-600 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-[2px_2px_0px_#10b981]";
      default:
        return "border-2 border-emerald-600 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-[2px_2px_0px_#10b981]";
    }
  };

  return (
    <Card
      title="Financial Insights"
      subtitle="Calculated observations based on your recorded transactions"
    >
      {insights.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm font-semibold">
          <p>
            No critical observations found. As you record more transactions,
            automated insights will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl flex items-start space-x-3 transition-transform hover:-translate-y-0.5 ${getBorderColor(
                item.severity,
              )}`}
            >
              {getIcon(item.severity)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {item.title}
                  </h5>
                  {item.metric && (
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white shadow-[1px_1px_0px_#000]">
                      {item.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
