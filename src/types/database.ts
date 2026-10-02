export type DPRPRType = 'DPR' | 'PR';

export interface Factory {
  id: string;
  factory_code: string;
  factory_name: string;
  badge_color: string;
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  category_name: string;
  color: string;
  is_active: boolean;
  created_at?: string;
}

export interface Setting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_at?: string;
}

export interface BudgetLine {
  id: string;
  month: number; // 1 - 12
  year: number;
  factory_id: string;
  budget_line: string;
  amount_lkr: number;
  exchange_rate_used: number;
  amount_usd: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
  // Joined relation:
  factory?: Factory;
}

export interface Expense {
  id: string;
  expense_date: string; // YYYY-MM-DD
  month: number;
  year: number;
  factory_id: string;
  category_id: string;
  dpr_pr_type: DPRPRType;
  dpr_pr_number: string;
  description: string;
  amount_lkr: number;
  exchange_rate_used: number;
  amount_usd: number;
  workflow_number?: string;
  grn_number?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  // Joined relations:
  factory?: Factory;
  category?: Category;
}

export interface FactorySummary {
  factory: Factory;
  budget_lkr: number;
  budget_usd: number;
  expense_lkr: number;
  expense_usd: number;
  balance_lkr: number;
  balance_usd: number;
  utilization_pct: number;
  is_over_budget: boolean;
  has_budget: boolean;
  transaction_count: number;
}

export interface CategorySummary {
  category: Category;
  total_lkr: number;
  total_usd: number;
  transaction_count: number;
  pct_of_total: number;
}
