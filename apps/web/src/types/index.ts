export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  settings?: UserSettings;
}

export interface UserSettings {
  currency_code: string;
  currency_symbol: string;
  date_format: string;
  theme_mode: "light" | "dark";
  ai_consent: boolean;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: "expense" | "income";
  color_hex: string;
  icon_name: string;
  is_system: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  amount_cents: number;
  amount_display: string;
  type: "expense" | "income" | "transfer";
  date: string;
  description: string;
  notes?: string;
  import_batch_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionPagination {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BudgetProgress {
  id?: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  period: string;
  limit_cents: number;
  spent_cents: number;
  remaining_cents: number;
  utilization_percent: number;
  is_over_budget: boolean;
}

export interface DashboardSummary {
  total_spending_cents: number;
  total_income_cents: number;
  net_savings_cents: number;
  budget_limit_cents: number;
  remaining_budget_cents: number;
  budget_utilization_percent: number;
  has_budget: boolean;
  transaction_count: number;
}

export interface SpendingTrendPoint {
  date: string;
  spending_cents: number;
  income_cents: number;
}

export interface CategoryBreakdownItem {
  category_id?: string;
  category_name: string;
  category_color: string;
  amount_cents: number;
  percentage: number;
}

export interface InsightItem {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "success";
  metric?: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  trend: SpendingTrendPoint[];
  category_breakdown: CategoryBreakdownItem[];
  budgets: BudgetProgress[];
  recent_transactions: Transaction[];
  insights: InsightItem[];
}

export interface CategoryHistoryTrend {
  category_id?: string;
  category_name: string;
  category_color: string;
  current_amount_cents: number;
  previous_amount_cents: number;
  absolute_change_cents: number;
  percentage_change: number | null;
}

export interface HistoricalComparison {
  period_name: string;
  current_range: string;
  previous_range: string;
  current_spending_cents: number;
  previous_spending_cents: number;
  absolute_difference_cents: number;
  percentage_change: number | null;
  is_partial_period: boolean;
  explanation?: string;
  category_trends: CategoryHistoryTrend[];
  trend_history: SpendingTrendPoint[];
}

export type HistoryResponse = HistoricalComparison;

export interface ImportPreviewRow {
  row_number: number;
  raw_data: Record<string, any>;
  detected_date?: string;
  detected_amount?: string;
  detected_description?: string;
  detected_category?: string;
  detected_type?: string;
  is_valid: boolean;
  validation_error?: string;
}

export interface ImportPreviewResponse {
  filename: string;
  total_rows: number;
  headers: string[];
  suggested_mappings: Record<string, string>;
  preview_rows: ImportPreviewRow[];
  duplicate_count: number;
}
