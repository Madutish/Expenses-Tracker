import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { FactoryBadge } from '../common/FactoryBadge';
import { CategoryTag } from '../common/CategoryTag';
import { formatNumber, getMonthName, exportToCSV } from '../../lib/utils';
import {
  Printer,
  FileDown,
  FileSpreadsheet,
  Building,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    selectedMonth,
    selectedYear,
    factories,
    categories,
    budgetLines,
    expenses,
    departmentTotalBudgetLkr,
    departmentTotalBudgetUsd,
    departmentTotalExpenseLkr,
    departmentTotalExpenseUsd,
    departmentBalanceLkr,
    departmentBalanceUsd,
    departmentUtilizationPct,
    isDepartmentOverBudget,
  } = useData();

  // Filters
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [showDetailed, setShowDetailed] = useState<boolean>(true);

  // Active Factories for report
  const activeFactories = useMemo(() => {
    if (selectedFactoryId === 'ALL') {
      return factories.filter((f) => f.is_active);
    }
    return factories.filter((f) => f.id === selectedFactoryId);
  }, [factories, selectedFactoryId]);

  // Handle Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvRows = expenses.map((e, idx) => {
      const f = factories.find((fac) => fac.id === e.factory_id);
      const c = categories.find((cat) => cat.id === e.category_id);
      return {
        'No.': idx + 1,
        'Expense Date': e.expense_date,
        'Month': getMonthName(e.month),
        'Year': e.year,
        'Factory Code': f?.factory_code || '',
        'Factory Name': f?.factory_name || '',
        'Category': c?.category_name || '',
        'DPR/PR Type': e.dpr_pr_type,
        'DPR/PR Number': e.dpr_pr_number,
        'Description': e.description,
        'Amount LKR': e.amount_lkr,
        'Exchange Rate Used': e.exchange_rate_used,
        'Amount USD': e.amount_usd,
        'Workflow No': e.workflow_number || '',
        'GRN No': e.grn_number || '',
        'Remarks': e.remarks || '',
      };
    });

    exportToCSV(`Dept_Expense_Report_${selectedYear}_${selectedMonth}.csv`, csvRows);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const selectedFactoryName =
    selectedFactoryId === 'ALL'
      ? 'All Factories (Consolidated)'
      : factories.find((f) => f.id === selectedFactoryId)?.factory_name || 'Selected Factory';

  return (
    <div className="space-y-6">
      {/* Action and Control Bar - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Monthly Management Reports
          </h1>
          <p className="text-xs text-slate-500">
            Generate, print, or export comprehensive budget and DPR/PR expense statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar - Hidden when printing */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Report Filters:</span>
          </div>

          {/* Factory Filter */}
          <div>
            <select
              value={selectedFactoryId}
              onChange={(e) => setSelectedFactoryId(e.target.value)}
              aria-label="Filter report by factory"
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-700"
            >
              <option value="ALL">All Factories</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.factory_code} - {f.factory_name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              aria-label="Filter report by category"
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Transactions Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showDetailed}
              onChange={(e) => setShowDetailed(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <span>Show Detailed Transactions</span>
          </label>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINTABLE REPORT DOCUMENT (A4 Optimized)                        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none p-6 md:p-8 space-y-8 print:p-0">
        {/* 20. Professional Blue Report Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-6 shadow-md print:rounded-none print:p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-blue-200">
                Department Expense Tracker
              </p>
              <h2 className="text-2xl font-bold tracking-tight mt-1 text-white">
                Monthly Budget & Expense Report
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                Garment Manufacturing Department • Factory-wise DPR & PR Operations
              </p>
            </div>

            <div className="bg-blue-950/60 border border-blue-700/50 rounded-lg p-3 text-xs space-y-1 min-w-[200px]">
              <div className="flex justify-between">
                <span className="text-blue-300">Period:</span>
                <span className="font-bold text-white">
                  {getMonthName(selectedMonth)} {selectedYear}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Generated:</span>
                <span className="text-blue-100 font-mono">{currentDateFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Scope:</span>
                <span className="text-blue-100 font-medium truncate max-w-[130px]">
                  {selectedFactoryId === 'ALL' ? 'All Units' : selectedFactoryName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 21. Factory-Wise Reports */}
        <div className="space-y-8">
          {activeFactories.map((factory) => {
            // Filter budgets & expenses for this factory
            const fBudgets = budgetLines.filter((b) => b.factory_id === factory.id);
            let fExpenses = expenses.filter((e) => e.factory_id === factory.id);
            if (selectedCategoryId !== 'ALL') {
              fExpenses = fExpenses.filter((e) => e.category_id === selectedCategoryId);
            }

            const factoryBudgetLkr = fBudgets.reduce(
              (sum, b) => sum + (Number(b.amount_lkr) || 0),
              0
            );
            const factoryBudgetUsd = fBudgets.reduce(
              (sum, b) => sum + (Number(b.amount_usd) || 0),
              0
            );

            const factoryExpenseLkr = fExpenses.reduce(
              (sum, e) => sum + (Number(e.amount_lkr) || 0),
              0
            );
            const factoryExpenseUsd = fExpenses.reduce(
              (sum, e) => sum + (Number(e.amount_usd) || 0),
              0
            );

            const factoryBalanceLkr = factoryBudgetLkr - factoryExpenseLkr;
            const factoryBalanceUsd = factoryBudgetUsd - factoryExpenseUsd;

            const hasBudget = factoryBudgetLkr > 0;
            const utilPct = hasBudget
              ? Math.round((factoryExpenseLkr / factoryBudgetLkr) * 1000) / 10
              : 0;
            const isOverBudget = hasBudget
              ? factoryExpenseLkr > factoryBudgetLkr
              : factoryExpenseLkr > 0;

            // Group by category
            const categoryBreakdowns = categories
              .filter((cat) => selectedCategoryId === 'ALL' || cat.id === selectedCategoryId)
              .map((cat) => {
                const catExpenses = fExpenses.filter((e) => e.category_id === cat.id);
                const totalLkr = catExpenses.reduce(
                  (sum, e) => sum + (Number(e.amount_lkr) || 0),
                  0
                );
                const totalUsd = catExpenses.reduce(
                  (sum, e) => sum + (Number(e.amount_usd) || 0),
                  0
                );
                const pct =
                  factoryExpenseLkr > 0
                    ? Math.round((totalLkr / factoryExpenseLkr) * 1000) / 10
                    : 0;

                return {
                  category: cat,
                  count: catExpenses.length,
                  totalLkr,
                  totalUsd,
                  pct,
                };
              })
              .filter((item) => item.count > 0 || selectedCategoryId !== 'ALL');

            return (
              <div
                key={factory.id}
                className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300 print:break-inside-avoid"
              >
                {/* Factory Card Header */}
                <div className="bg-slate-100/80 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <FactoryBadge
                      code={factory.factory_code}
                      name={factory.factory_name}
                      color={factory.badge_color}
                      showName={true}
                    />
                    <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                      {factory.factory_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOverBudget ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        OVER BUDGET
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        WITHIN BUDGET
                      </span>
                    )}
                  </div>
                </div>

                {/* Category-wise summary table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4 text-center">No. of Transactions</th>
                        <th className="py-2.5 px-4 text-right">Total (LKR)</th>
                        <th className="py-2.5 px-4 text-right">Total (USD)</th>
                        <th className="py-2.5 px-4 text-right">% of Factory Spending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {categoryBreakdowns.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            No expense transactions recorded for this factory.
                          </td>
                        </tr>
                      ) : (
                        categoryBreakdowns.map((row) => (
                          <tr key={row.category.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                              <CategoryTag name={row.category.category_name} color={row.category.color} />
                            </td>
                            <td className="py-2.5 px-4 text-center font-mono">{row.count}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              LKR {formatNumber(row.totalLkr)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-600">
                              ${formatNumber(row.totalUsd)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-700">
                              {row.pct.toFixed(2)}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 22. Factory Budget Summary Bar */}
                <div className="bg-slate-50/90 border-t border-slate-200 px-5 py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                        Allocated Budget
                      </span>
                      <div className="font-mono font-bold text-slate-800 text-sm">
                        LKR {formatNumber(factoryBudgetLkr)}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        ${formatNumber(factoryBudgetUsd)} USD
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                        Total DPR/PR Expense
                      </span>
                      <div className="font-mono font-bold text-amber-900 text-sm">
                        LKR {formatNumber(factoryExpenseLkr)}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        ${formatNumber(factoryExpenseUsd)} USD
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                        Remaining Balance
                      </span>
                      <div
                        className={`font-mono font-bold text-sm ${
                          factoryBalanceLkr < 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {factoryBalanceLkr < 0 ? '-' : ''}LKR {formatNumber(Math.abs(factoryBalanceLkr))}
                      </div>
                      <div
                        className={`font-mono text-[10px] ${
                          factoryBalanceUsd < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {factoryBalanceUsd < 0 ? '-$' : '$'}
                        {formatNumber(Math.abs(factoryBalanceUsd))} USD
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                        Budget Utilization
                      </span>
                      <div
                        className={`font-mono font-bold text-sm ${
                          isOverBudget
                            ? 'text-rose-600'
                            : utilPct > 80
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {hasBudget ? `${utilPct}%` : 'No Budget'}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider">
                        {isOverBudget ? (
                          <span className="text-rose-600">OVER BUDGET</span>
                        ) : (
                          <span className="text-emerald-600">WITHIN BUDGET</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 23. GRAND TOTAL REPORT CARD */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 print:break-inside-avoid">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                Consolidated Overview
              </span>
              <h3 className="text-lg font-bold tracking-tight text-white">
                DEPARTMENT GRAND TOTALS
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">
                Overall Utilization: <strong className="text-white">{departmentUtilizationPct}%</strong>
              </span>
              {isDepartmentOverBudget ? (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-600 text-white uppercase">
                  OVER BUDGET
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white uppercase">
                  WITHIN BUDGET
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Total Department Budget
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                LKR {formatNumber(departmentTotalBudgetLkr)}
              </div>
              <div className="text-xs font-mono text-blue-300 mt-0.5">
                ${formatNumber(departmentTotalBudgetUsd)} USD
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60">
              <span className="text-xs text-amber-400 uppercase tracking-wider block">
                Total Department Expense
              </span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                LKR {formatNumber(departmentTotalExpenseLkr)}
              </div>
              <div className="text-xs font-mono text-amber-200 mt-0.5">
                ${formatNumber(departmentTotalExpenseUsd)} USD
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Remaining Net Balance
              </span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  departmentBalanceLkr < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {departmentBalanceLkr < 0 ? '-' : ''}LKR {formatNumber(Math.abs(departmentBalanceLkr))}
              </div>
              <div
                className={`text-xs font-mono mt-0.5 ${
                  departmentBalanceUsd < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {departmentBalanceUsd < 0 ? '-$' : '$'}
                {formatNumber(Math.abs(departmentBalanceUsd))} USD
              </div>
            </div>
          </div>
        </div>

        {/* 24. Detailed Expense Report Table (Toggled) */}
        {showDetailed && (
          <div className="space-y-3 pt-4 border-t border-slate-200 print:break-inside-avoid">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Itemized DPR / PR Transaction Register
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Factory</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">DPR/PR No.</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Workflow No.</th>
                    <th className="py-2.5 px-3">GRN No.</th>
                    <th className="py-2.5 px-3 text-right">Amount (LKR)</th>
                    <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.map((e) => {
                    const f = factories.find((fac) => fac.id === e.factory_id);
                    const c = categories.find((cat) => cat.id === e.category_id);
                    return (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono">{e.expense_date}</td>
                        <td className="py-2 px-3 font-semibold">{f?.factory_code}</td>
                        <td className="py-2 px-3">{c?.category_name}</td>
                        <td className="py-2 px-3 font-mono font-bold">{e.dpr_pr_type}</td>
                        <td className="py-2 px-3 font-mono">{e.dpr_pr_number}</td>
                        <td className="py-2 px-3">{e.description}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">
                          {e.workflow_number || '—'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">
                          {e.grn_number || '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatNumber(e.amount_lkr)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-blue-700">
                          ${formatNumber(e.amount_usd)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
