import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Factory, Category, Setting, BudgetLine, Expense, FactorySummary } from '../types/database';
import { calculateUSD } from '../lib/utils';

// Initial Mock/Fallback Data in case Supabase schema is not yet populated
const INITIAL_FACTORIES: Factory[] = [
  { id: '11111111-1111-1111-1111-111111111101', factory_code: 'FTY 01', factory_name: 'Factory 01 - Katunayake Plant', badge_color: 'blue', is_active: true },
  { id: '11111111-1111-1111-1111-111111111103', factory_code: 'FTY 03', factory_name: 'Factory 03 - Biyagama Plant', badge_color: 'indigo', is_active: true },
  { id: '11111111-1111-1111-1111-111111111104', factory_code: 'FTY 04', factory_name: 'Factory 04 - Avissawella Plant', badge_color: 'teal', is_active: true },
  { id: '11111111-1111-1111-1111-111111111105', factory_code: 'FTY 05', factory_name: 'Factory 05 - Koggala Plant', badge_color: 'purple', is_active: true },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: '22222222-2222-2222-2222-222222222201', category_name: 'Machine Spares', color: 'emerald', is_active: true },
  { id: '22222222-2222-2222-2222-222222222202', category_name: 'Needle', color: 'sky', is_active: true },
  { id: '22222222-2222-2222-2222-222222222203', category_name: 'Folder', color: 'amber', is_active: true },
  { id: '22222222-2222-2222-2222-222222222204', category_name: 'Jig Boards', color: 'purple', is_active: true },
  { id: '22222222-2222-2222-2222-222222222205', category_name: 'Hardware', color: 'rose', is_active: true },
];

const INITIAL_BUDGETS: BudgetLine[] = [
  {
    id: 'b1',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111101',
    budget_line: 'October Monthly Allocation',
    amount_lkr: 250000,
    exchange_rate_used: 303.3,
    amount_usd: 824.27,
    note: 'Standard monthly allocation',
  },
  {
    id: 'b2',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111103',
    budget_line: 'October Monthly Allocation',
    amount_lkr: 350000,
    exchange_rate_used: 303.3,
    amount_usd: 1154.0,
    note: 'Standard monthly allocation',
  },
  {
    id: 'b3',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111104',
    budget_line: 'October Monthly Allocation',
    amount_lkr: 450000,
    exchange_rate_used: 303.3,
    amount_usd: 1483.68,
    note: 'Standard monthly allocation',
  },
  {
    id: 'b4',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    budget_line: 'October Monthly Budget',
    amount_lkr: 500000,
    exchange_rate_used: 303.3,
    amount_usd: 1648.53,
    note: 'Monthly allocation',
  },
  {
    id: 'b5',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    budget_line: 'Additional Top-up',
    amount_lkr: 100000,
    exchange_rate_used: 303.3,
    amount_usd: 329.71,
    note: 'Peak season top-up approved',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    expense_date: '2026-10-02',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    category_id: '22222222-2222-2222-2222-222222222203',
    dpr_pr_type: 'DPR',
    dpr_pr_number: 'DPR-2026-081',
    description: 'FR-0367 Folder Attachment',
    amount_lkr: 4800,
    exchange_rate_used: 303.3,
    amount_usd: 15.83,
    workflow_number: 'WF-9912',
    grn_number: 'GRN-5541',
    remarks: 'For line 4 shirt placket',
  },
  {
    id: 'e2',
    expense_date: '2026-10-04',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111104',
    category_id: '22222222-2222-2222-2222-222222222201',
    dpr_pr_type: 'DPR',
    dpr_pr_number: 'DPR-2026-082',
    description: 'Jack MC Parts',
    amount_lkr: 13648,
    exchange_rate_used: 303.3,
    amount_usd: 45.0,
    workflow_number: 'WF-9915',
    grn_number: 'GRN-5545',
    remarks: 'Motor replacement drive',
  },
  {
    id: 'e3',
    expense_date: '2026-10-07',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111103',
    category_id: '22222222-2222-2222-2222-222222222202',
    dpr_pr_type: 'PR',
    dpr_pr_number: 'PR-2026-104',
    description: 'Needle Groz-Beckert DBx1 100pk',
    amount_lkr: 74034,
    exchange_rate_used: 303.3,
    amount_usd: 244.09,
    workflow_number: 'WF-9920',
    grn_number: 'GRN-5550',
    remarks: 'Bulk pack for sewing section',
  },
  {
    id: 'e4',
    expense_date: '2026-10-10',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    category_id: '22222222-2222-2222-2222-222222222201',
    dpr_pr_type: 'DPR',
    dpr_pr_number: 'DPR-2026-089',
    description: 'Juki DDL-9000 Looper & Parts',
    amount_lkr: 250000,
    exchange_rate_used: 303.3,
    amount_usd: 824.27,
    workflow_number: 'WF-9924',
    grn_number: 'GRN-5562',
    remarks: 'Urgent maintenance spare parts',
  },
  {
    id: 'e5',
    expense_date: '2026-10-12',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    category_id: '22222222-2222-2222-2222-222222222204',
    dpr_pr_type: 'DPR',
    dpr_pr_number: 'DPR-2026-092',
    description: 'Collar Jig Board Template',
    amount_lkr: 80000,
    exchange_rate_used: 303.3,
    amount_usd: 263.77,
    workflow_number: 'WF-9930',
    grn_number: 'GRN-5570',
    remarks: 'New order styling jigs',
  },
  {
    id: 'e6',
    expense_date: '2026-10-15',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    category_id: '22222222-2222-2222-2222-222222222205',
    dpr_pr_type: 'PR',
    dpr_pr_number: 'PR-2026-110',
    description: 'Pneumatic cylinder fittings & valves',
    amount_lkr: 40000,
    exchange_rate_used: 303.3,
    amount_usd: 131.88,
    workflow_number: 'WF-9934',
    grn_number: 'GRN-5575',
    remarks: 'Utility shop fittings',
  },
  {
    id: 'e7',
    expense_date: '2026-10-18',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111105',
    category_id: '22222222-2222-2222-2222-222222222203',
    dpr_pr_type: 'DPR',
    dpr_pr_number: 'DPR-2026-095',
    description: 'Hemming Folder Guide 1/4 inch',
    amount_lkr: 35000,
    exchange_rate_used: 303.3,
    amount_usd: 115.4,
    workflow_number: 'WF-9941',
    grn_number: 'GRN-5582',
    remarks: 'Line 2 bottom hem',
  },
  {
    id: 'e8',
    expense_date: '2026-10-20',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111101',
    category_id: '22222222-2222-2222-2222-222222222201',
    dpr_pr_type: 'PR',
    dpr_pr_number: 'PR-2026-118',
    description: 'Overlock Feed Dog & Upper Knife Set',
    amount_lkr: 58200,
    exchange_rate_used: 303.3,
    amount_usd: 191.89,
    workflow_number: 'WF-9948',
    grn_number: 'GRN-5590',
    remarks: 'Overlock preventive servicing',
  },
  {
    id: 'e9',
    expense_date: '2026-10-23',
    month: 10,
    year: 2026,
    factory_id: '11111111-1111-1111-1111-111111111104',
    category_id: '22222222-2222-2222-2222-222222222205',
    dpr_pr_type: 'DPR',
    dpr_pr_number: 'DPR-2026-102',
    description: 'Heavy duty casters & roller bearings',
    amount_lkr: 26500,
    exchange_rate_used: 303.3,
    amount_usd: 87.37,
    workflow_number: 'WF-9952',
    grn_number: 'GRN-5595',
    remarks: 'Trolley overhaul',
  },
];

interface DataContextType {
  // Current Filter State
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;

  // Master Data
  factories: Factory[];
  categories: Category[];
  currentExchangeRate: number;
  loading: boolean;
  error: string | null;

  // Monthly Data
  budgetLines: BudgetLine[];
  expenses: Expense[];

  // CRUD Operations - Budgets
  addBudgetLine: (data: Omit<BudgetLine, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateBudgetLine: (id: string, data: Partial<BudgetLine>) => Promise<boolean>;
  deleteBudgetLine: (id: string) => Promise<boolean>;

  // CRUD Operations - Expenses
  addExpense: (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  // Settings & Masters
  updateExchangeRate: (newRate: number) => Promise<boolean>;
  addFactory: (data: Omit<Factory, 'id' | 'created_at'>) => Promise<boolean>;
  updateFactory: (id: string, data: Partial<Factory>) => Promise<boolean>;
  toggleFactoryActive: (id: string, isActive: boolean) => Promise<boolean>;

  addCategory: (data: Omit<Category, 'id' | 'created_at'>) => Promise<Category | null>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<boolean>;
  toggleCategoryActive: (id: string, isActive: boolean) => Promise<boolean>;

  // Backup & Restore
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => Promise<{ success: boolean; message: string }>;

  // Calculated Summaries for Selected Month
  departmentTotalBudgetLkr: number;
  departmentTotalBudgetUsd: number;
  departmentTotalExpenseLkr: number;
  departmentTotalExpenseUsd: number;
  departmentBalanceLkr: number;
  departmentBalanceUsd: number;
  departmentUtilizationPct: number;
  isDepartmentOverBudget: boolean;

  factorySummaries: FactorySummary[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const saved = localStorage.getItem('dept_tracker_selected_month');
    return saved ? parseInt(saved, 10) : 10; // Default October 2026
  });

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const saved = localStorage.getItem('dept_tracker_selected_year');
    return saved ? parseInt(saved, 10) : 2026;
  });

  const [factories, setFactories] = useState<Factory[]>(INITIAL_FACTORIES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(303.3);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>(INITIAL_BUDGETS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync month & year preference to localStorage
  useEffect(() => {
    localStorage.setItem('dept_tracker_selected_month', selectedMonth.toString());
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem('dept_tracker_selected_year', selectedYear.toString());
  }, [selectedYear]);

  // Fetch data from Supabase
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch factories
      const { data: fData, error: fErr } = await supabase
        .from('factories')
        .select('*')
        .order('factory_code', { ascending: true });

      if (!fErr && fData && fData.length > 0) {
        setFactories(fData);
      }

      // 2. Fetch categories
      const { data: cData, error: cErr } = await supabase
        .from('categories')
        .select('*')
        .order('category_name', { ascending: true });

      if (!cErr && cData && cData.length > 0) {
        setCategories(cData);
      }

      // 3. Fetch settings
      const { data: sData } = await supabase
        .from('settings')
        .select('*')
        .eq('setting_key', 'exchange_rate')
        .maybeSingle();

      if (sData?.setting_value) {
        const parsedRate = parseFloat(sData.setting_value);
        if (!isNaN(parsedRate) && parsedRate > 0) {
          setCurrentExchangeRate(parsedRate);
        }
      }

      // 4. Fetch budget lines for selected month and year
      const { data: bData, error: bErr } = await supabase
        .from('budget_lines')
        .select('*, factory:factories(*)')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (!bErr && bData) {
        setBudgetLines(bData);
      }

      // 5. Fetch expenses for selected month and year
      const { data: eData, error: eErr } = await supabase
        .from('expenses')
        .select('*, factory:factories(*), category:categories(*)')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('expense_date', { ascending: false });

      if (!eErr && eData) {
        setExpenses(eData);
      }
    } catch (err: unknown) {
      console.warn('Supabase fetch failed, continuing with current memory data:', err);
      // Retain existing state
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  // Fetch when month/year changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Add Budget Line
  const addBudgetLine = async (data: Omit<BudgetLine, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const newLine = {
        ...data,
        amount_usd: calculateUSD(data.amount_lkr, data.exchange_rate_used),
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('budget_lines')
        .insert([newLine])
        .select('*, factory:factories(*)')
        .single();

      if (!insertErr && inserted) {
        setBudgetLines((prev) => [inserted, ...prev]);
        return true;
      }

      // Local fallback
      const localItem: BudgetLine = {
        id: crypto.randomUUID(),
        ...newLine,
        factory: factories.find((f) => f.id === data.factory_id),
      };
      setBudgetLines((prev) => [localItem, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  // Update Budget Line
  const updateBudgetLine = async (id: string, data: Partial<BudgetLine>): Promise<boolean> => {
    try {
      const updatePayload = { ...data };
      if (data.amount_lkr !== undefined && data.exchange_rate_used !== undefined) {
        updatePayload.amount_usd = calculateUSD(data.amount_lkr, data.exchange_rate_used);
      }

      const { error: updErr } = await supabase
        .from('budget_lines')
        .update(updatePayload)
        .eq('id', id);

      if (!updErr) {
        await refreshData();
        return true;
      }

      // Local fallback
      setBudgetLines((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                ...updatePayload,
                factory: updatePayload.factory_id
                  ? factories.find((f) => f.id === updatePayload.factory_id) || b.factory
                  : b.factory,
              }
            : b
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // Delete Budget Line
  const deleteBudgetLine = async (id: string): Promise<boolean> => {
    try {
      const { error: delErr } = await supabase.from('budget_lines').delete().eq('id', id);
      if (!delErr) {
        setBudgetLines((prev) => prev.filter((b) => b.id !== id));
        return true;
      }
      setBudgetLines((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  // Add Expense
  const addExpense = async (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const newExpense = {
        ...data,
        amount_usd: calculateUSD(data.amount_lkr, data.exchange_rate_used),
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select('*, factory:factories(*), category:categories(*)')
        .single();

      if (!insertErr && inserted) {
        setExpenses((prev) => [inserted, ...prev]);
        return true;
      }

      // Fallback
      const localItem: Expense = {
        id: crypto.randomUUID(),
        ...newExpense,
        factory: factories.find((f) => f.id === data.factory_id),
        category: categories.find((c) => c.id === data.category_id),
      };
      setExpenses((prev) => [localItem, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  // Update Expense
  const updateExpense = async (id: string, data: Partial<Expense>): Promise<boolean> => {
    try {
      const updatePayload = { ...data };
      if (data.amount_lkr !== undefined && data.exchange_rate_used !== undefined) {
        updatePayload.amount_usd = calculateUSD(data.amount_lkr, data.exchange_rate_used);
      }

      const { error: updErr } = await supabase
        .from('expenses')
        .update(updatePayload)
        .eq('id', id);

      if (!updErr) {
        await refreshData();
        return true;
      }

      // Fallback
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                ...updatePayload,
                factory: updatePayload.factory_id
                  ? factories.find((f) => f.id === updatePayload.factory_id) || e.factory
                  : e.factory,
                category: updatePayload.category_id
                  ? categories.find((c) => c.id === updatePayload.category_id) || e.category
                  : e.category,
              }
            : e
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // Delete Expense
  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      const { error: delErr } = await supabase.from('expenses').delete().eq('id', id);
      if (!delErr) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        return true;
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  // Update Exchange Rate (Settings)
  const updateExchangeRate = async (newRate: number): Promise<boolean> => {
    if (newRate <= 0) return false;
    try {
      const { error: updErr } = await supabase.from('settings').upsert({
        setting_key: 'exchange_rate',
        setting_value: newRate.toFixed(2),
        description: 'Current baseline exchange rate (1 USD = X LKR). Historical transactions retain their stored rate.',
        updated_at: new Date().toISOString(),
      });

      setCurrentExchangeRate(newRate);
      return !updErr;
    } catch {
      setCurrentExchangeRate(newRate);
      return true;
    }
  };

  // Factory Master Actions
  const addFactory = async (data: Omit<Factory, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('factories')
        .insert([data])
        .select()
        .single();

      if (!insertErr && inserted) {
        setFactories((prev) => [...prev, inserted]);
        return true;
      }
      const localFty: Factory = { id: crypto.randomUUID(), ...data };
      setFactories((prev) => [...prev, localFty]);
      return true;
    } catch {
      return false;
    }
  };

  const updateFactory = async (id: string, data: Partial<Factory>): Promise<boolean> => {
    try {
      await supabase.from('factories').update(data).eq('id', id);
      setFactories((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
      return true;
    } catch {
      return false;
    }
  };

  const toggleFactoryActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateFactory(id, { is_active: isActive });
  };

  // Category Master Actions
  const addCategory = async (data: Omit<Category, 'id' | 'created_at'>): Promise<Category | null> => {
    try {
      const cleanName = data.category_name.trim();
      const existing = categories.find(
        (c) => c.category_name.trim().toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        if (!existing.is_active) {
          await updateCategory(existing.id, { is_active: true });
        }
        return existing;
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('categories')
        .insert([{ ...data, category_name: cleanName }])
        .select()
        .single();

      if (!insertErr && inserted) {
        setCategories((prev) => [...prev, inserted]);
        return inserted;
      }
      const localCat: Category = { id: crypto.randomUUID(), ...data, category_name: cleanName };
      setCategories((prev) => [...prev, localCat]);
      return localCat;
    } catch {
      const localCat: Category = { id: crypto.randomUUID(), ...data };
      setCategories((prev) => [...prev, localCat]);
      return localCat;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>): Promise<boolean> => {
    try {
      await supabase.from('categories').update(data).eq('id', id);
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      return true;
    } catch {
      return false;
    }
  };

  const toggleCategoryActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateCategory(id, { is_active: isActive });
  };

  // Backup & Restore
  const exportBackupJSON = (): string => {
    const backupData = {
      exportDate: new Date().toISOString(),
      exchangeRate: currentExchangeRate,
      factories,
      categories,
      budgetLines,
      expenses,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJSON = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.factories || !parsed.categories || !parsed.budgetLines || !parsed.expenses) {
        return { success: false, message: 'Invalid backup format. Missing core data tables.' };
      }

      setFactories(parsed.factories);
      setCategories(parsed.categories);
      setBudgetLines(parsed.budgetLines);
      setExpenses(parsed.expenses);
      if (parsed.exchangeRate) {
        setCurrentExchangeRate(Number(parsed.exchangeRate));
      }

      return { success: true, message: 'Database backup restored successfully into active session.' };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Invalid JSON file.' };
    }
  };

  // ==========================================
  // CALCULATIONS FOR SELECTED MONTH & YEAR
  // ==========================================

  // Filter current month data
  const currentMonthBudgets = budgetLines.filter(
    (b) => b.month === selectedMonth && b.year === selectedYear
  );
  const currentMonthExpenses = expenses.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  // Department totals
  const departmentTotalBudgetLkr = currentMonthBudgets.reduce((sum, b) => sum + (Number(b.amount_lkr) || 0), 0);
  const departmentTotalBudgetUsd = currentMonthBudgets.reduce((sum, b) => sum + (Number(b.amount_usd) || 0), 0);

  const departmentTotalExpenseLkr = currentMonthExpenses.reduce((sum, e) => sum + (Number(e.amount_lkr) || 0), 0);
  const departmentTotalExpenseUsd = currentMonthExpenses.reduce((sum, e) => sum + (Number(e.amount_usd) || 0), 0);

  const departmentBalanceLkr = departmentTotalBudgetLkr - departmentTotalExpenseLkr;
  const departmentBalanceUsd = departmentTotalBudgetUsd - departmentTotalExpenseUsd;

  const departmentUtilizationPct =
    departmentTotalBudgetLkr > 0
      ? Math.round((departmentTotalExpenseLkr / departmentTotalBudgetLkr) * 1000) / 10
      : 0;

  const isDepartmentOverBudget = departmentTotalExpenseLkr > departmentTotalBudgetLkr;

  // Factory-wise summaries
  const factorySummaries: FactorySummary[] = factories.map((factory) => {
    const fBudgets = currentMonthBudgets.filter((b) => b.factory_id === factory.id);
    const fExpenses = currentMonthExpenses.filter((e) => e.factory_id === factory.id);

    const budget_lkr = fBudgets.reduce((sum, b) => sum + (Number(b.amount_lkr) || 0), 0);
    const budget_usd = fBudgets.reduce((sum, b) => sum + (Number(b.amount_usd) || 0), 0);

    const expense_lkr = fExpenses.reduce((sum, e) => sum + (Number(e.amount_lkr) || 0), 0);
    const expense_usd = fExpenses.reduce((sum, e) => sum + (Number(e.amount_usd) || 0), 0);

    const balance_lkr = budget_lkr - expense_lkr;
    const balance_usd = budget_usd - expense_usd;

    const has_budget = budget_lkr > 0;
    const utilization_pct = has_budget ? Math.round((expense_lkr / budget_lkr) * 1000) / 10 : 0;
    const is_over_budget = has_budget ? expense_lkr > budget_lkr : expense_lkr > 0;

    return {
      factory,
      budget_lkr,
      budget_usd,
      expense_lkr,
      expense_usd,
      balance_lkr,
      balance_usd,
      utilization_pct,
      is_over_budget,
      has_budget,
      transaction_count: fExpenses.length,
    };
  });

  return (
    <DataContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        factories,
        categories,
        currentExchangeRate,
        loading,
        error,
        budgetLines: currentMonthBudgets,
        expenses: currentMonthExpenses,
        addBudgetLine,
        updateBudgetLine,
        deleteBudgetLine,
        addExpense,
        updateExpense,
        deleteExpense,
        updateExchangeRate,
        addFactory,
        updateFactory,
        toggleFactoryActive,
        addCategory,
        updateCategory,
        toggleCategoryActive,
        exportBackupJSON,
        importBackupJSON,
        departmentTotalBudgetLkr,
        departmentTotalBudgetUsd,
        departmentTotalExpenseLkr,
        departmentTotalExpenseUsd,
        departmentBalanceLkr,
        departmentBalanceUsd,
        departmentUtilizationPct,
        isDepartmentOverBudget,
        factorySummaries,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
