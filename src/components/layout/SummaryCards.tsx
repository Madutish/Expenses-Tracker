import React from 'react';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../lib/utils';
import { AlertCircle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

export const SummaryPanel: React.FC<{ title?: string }> = ({ title }) => {
  const {
    departmentTotalBudgetLkr,
    departmentTotalBudgetUsd,
    departmentTotalExpenseLkr,
    departmentTotalExpenseUsd,
    departmentBalanceLkr,
    departmentBalanceUsd,
    departmentUtilizationPct,
    isDepartmentOverBudget,
  } = useData();

  const isBalancePositive = departmentBalanceLkr >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {title || 'Department Monthly Budget vs Expense Summary'}
            </h2>
            <p className="text-xs text-slate-500">
              Primary currency: LKR | Reference conversion: USD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-50 border-slate-200 text-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Utilization: {departmentUtilizationPct}%</span>
          </div>

          {isDepartmentOverBudget ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              OVER BUDGET
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              WITHIN BUDGET
            </span>
          )}
        </div>
      </div>

      {/* 3-Row Table Layout as explicitly specified in Requirement 14 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider text-xs w-1/3">
                Metric
              </th>
              <th className="py-2.5 px-4 font-semibold text-slate-700 text-right text-xs uppercase tracking-wider w-1/3">
                Amount (LKR)
              </th>
              <th className="py-2.5 px-4 font-semibold text-slate-700 text-right text-xs uppercase tracking-wider w-1/3">
                Amount (USD Reference)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Row 1: Budget */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Allocated Budget
              </td>
              <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">
                {formatNumber(departmentTotalBudgetLkr)}
              </td>
              <td className="py-3 px-4 text-right font-medium text-slate-600 font-mono">
                ${formatNumber(departmentTotalBudgetUsd)}
              </td>
            </tr>

            {/* Row 2: Expense (Visually Highlighted as requested) */}
            <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors border-l-4 border-l-amber-500">
              <td className="py-3 px-4 font-bold text-amber-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Total DPR / PR Expenses
              </td>
              <td className="py-3 px-4 text-right font-bold text-amber-900 font-mono text-base">
                {formatNumber(departmentTotalExpenseLkr)}
              </td>
              <td className="py-3 px-4 text-right font-bold text-amber-800 font-mono">
                ${formatNumber(departmentTotalExpenseUsd)}
              </td>
            </tr>

            {/* Row 3: Balance (Green if positive, Red if negative) */}
            <tr
              className={`transition-colors font-bold ${
                isBalancePositive ? 'bg-emerald-50/30 text-emerald-900' : 'bg-rose-50/40 text-rose-900'
              }`}
            >
              <td className="py-3.5 px-4 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isBalancePositive ? 'bg-emerald-600' : 'bg-rose-600 animate-ping'
                  }`}
                ></span>
                Remaining Balance
              </td>
              <td
                className={`py-3.5 px-4 text-right font-mono text-base ${
                  isBalancePositive ? 'text-emerald-700' : 'text-rose-700 font-extrabold'
                }`}
              >
                {departmentBalanceLkr < 0 ? '-' : ''}
                {formatNumber(Math.abs(departmentBalanceLkr))}
              </td>
              <td
                className={`py-3.5 px-4 text-right font-mono ${
                  isBalancePositive ? 'text-emerald-700' : 'text-rose-700 font-bold'
                }`}
              >
                {departmentBalanceUsd < 0 ? '-$' : '$'}
                {formatNumber(Math.abs(departmentBalanceUsd))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
