import React from 'react';
import { useData } from '../../context/DataContext';
import { SummaryPanel } from '../layout/SummaryCards';
import { FactoryBadge } from '../common/FactoryBadge';
import { formatNumber, getMonthName } from '../../lib/utils';
import {
  TrendingUp,
  AlertTriangle,
  Building,
  PieChart,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    selectedMonth,
    selectedYear,
    factorySummaries,
    categories,
    expenses,
    departmentTotalExpenseLkr,
  } = useData();

  // Category spending aggregation for charts
  const categorySpendData = categories
    .map((cat) => {
      const catExpenses = expenses.filter((e) => e.category_id === cat.id);
      const totalLkr = catExpenses.reduce((sum, e) => sum + (Number(e.amount_lkr) || 0), 0);
      const totalUsd = catExpenses.reduce((sum, e) => sum + (Number(e.amount_usd) || 0), 0);
      const pct =
        departmentTotalExpenseLkr > 0
          ? Math.round((totalLkr / departmentTotalExpenseLkr) * 1000) / 10
          : 0;

      return {
        category: cat,
        totalLkr,
        totalUsd,
        pct,
        count: catExpenses.length,
      };
    })
    .sort((a, b) => b.totalLkr - a.totalLkr);

  return (
    <div className="space-y-6">
      {/* Page Title & Month Stamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/80 gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time monthly factory budgets and DPR/PR purchase tracking
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
          <Calendar className="w-3.5 h-3.5" />
          <span>Active Period: {getMonthName(selectedMonth)} {selectedYear}</span>
        </div>
      </div>

      {/* Top 3-Row Reusable Summary Panel */}
      <SummaryPanel />

      {/* Factory Dashboard Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Factory Budget Allocations & Performance
          </h2>
          <span className="text-xs text-slate-500">
            {factorySummaries.length} Production Units Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {factorySummaries.map((fSum) => {
            const {
              factory,
              budget_lkr,
              expense_lkr,
              balance_lkr,
              budget_usd,
              expense_usd,
              balance_usd,
              utilization_pct,
              is_over_budget,
              has_budget,
            } = fSum;

            // Progress bar color logic: 0-80% normal (blue/emerald), >80% orange, >100% red
            let barColor = 'bg-blue-600';
            if (utilization_pct > 100) {
              barColor = 'bg-rose-600';
            } else if (utilization_pct > 80) {
              barColor = 'bg-amber-500';
            }

            const clampedProgress = Math.min(utilization_pct, 100);

            return (
              <div
                key={factory.id}
                className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  is_over_budget
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <FactoryBadge
                      code={factory.factory_code}
                      name={factory.factory_name}
                      color={factory.badge_color}
                      showName={false}
                    />

                    {is_over_budget ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        OVER BUDGET
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {has_budget ? `${utilization_pct}% Used` : 'No Budget'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-semibold text-slate-700 truncate mb-3" title={factory.factory_name}>
                    {factory.factory_name}
                  </h3>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-500">Budget Utilization</span>
                      <span
                        className={`font-mono font-bold ${
                          is_over_budget
                            ? 'text-rose-600'
                            : utilization_pct > 80
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {has_budget ? `${utilization_pct}%` : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${clampedProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Breakdown Table inside Card */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    {/* Budget */}
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500">Budget:</span>
                      <div className="text-right">
                        <div className="font-semibold text-slate-800 font-mono">
                          LKR {formatNumber(budget_lkr)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ${formatNumber(budget_usd)}
                        </div>
                      </div>
                    </div>

                    {/* Expense */}
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500">Expense:</span>
                      <div className="text-right">
                        <div className="font-bold text-amber-900 font-mono">
                          LKR {formatNumber(expense_lkr)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ${formatNumber(expense_usd)}
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">Balance:</span>
                      <div className="text-right">
                        <div
                          className={`font-mono font-bold ${
                            balance_lkr < 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {balance_lkr < 0 ? '-' : ''}LKR {formatNumber(Math.abs(balance_lkr))}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            balance_usd < 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {balance_usd < 0 ? '-$' : '$'}
                          {formatNumber(Math.abs(balance_usd))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section: Spending by Factory & Spending by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Spending by Factory */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Spending by Factory (LKR)</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Actual Expenses</span>
          </div>

          {departmentTotalExpenseLkr === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
              No expense records found for {getMonthName(selectedMonth)} {selectedYear}.
            </div>
          ) : (
            <div className="space-y-3.5">
              {factorySummaries.map((fSum) => {
                const pct =
                  departmentTotalExpenseLkr > 0
                    ? Math.round((fSum.expense_lkr / departmentTotalExpenseLkr) * 1000) / 10
                    : 0;

                return (
                  <div key={fSum.factory.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          {fSum.factory.factory_code}
                        </span>
                        <span className="text-slate-500 text-[11px] truncate max-w-[120px]">
                          {fSum.factory.factory_name.replace(fSum.factory.factory_code, '')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">
                          LKR {formatNumber(fSum.expense_lkr)}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 2: Spending by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Spending by Category (LKR)</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">DPR & PR Categories</span>
          </div>

          {departmentTotalExpenseLkr === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
              No expense records found for {getMonthName(selectedMonth)} {selectedYear}.
            </div>
          ) : (
            <div className="space-y-3">
              {categorySpendData.map((item) => (
                <div key={item.category.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <span className="font-semibold text-slate-800">
                        {item.category.category_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.count} items)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        LKR {formatNumber(item.totalLkr)}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                        ({item.pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
