import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FactoryBadge } from '../common/FactoryBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatNumber, calculateUSD, getMonthName } from '../../lib/utils';
import type { BudgetLine } from '../../types/database';
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Wallet,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    selectedMonth,
    selectedYear,
    budgetLines,
    factories,
    currentExchangeRate,
    addBudgetLine,
    updateBudgetLine,
    deleteBudgetLine,
    departmentTotalBudgetLkr,
    departmentTotalBudgetUsd,
    factorySummaries,
  } = useData();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BudgetLine | null>(null);

  // Form State
  const [formFactoryId, setFormFactoryId] = useState('');
  const [formBudgetLine, setFormBudgetLine] = useState('');
  const [formAmountLkr, setFormAmountLkr] = useState('');
  const [formRate, setFormRate] = useState(currentExchangeRate.toString());
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [linePendingDelete, setLinePendingDelete] = useState<BudgetLine | null>(null);

  const openAddModal = (factoryId?: string) => {
    setEditingLine(null);
    setFormFactoryId(factoryId || (factories[0]?.id ?? ''));
    setFormBudgetLine('Monthly Budget Allocation');
    setFormAmountLkr('');
    setFormRate(currentExchangeRate.toFixed(2));
    setFormNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (line: BudgetLine) => {
    setEditingLine(line);
    setFormFactoryId(line.factory_id);
    setFormBudgetLine(line.budget_line);
    setFormAmountLkr(line.amount_lkr.toString());
    setFormRate(line.exchange_rate_used.toString());
    setFormNote(line.note || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const calculatedUSD =
    parseFloat(formAmountLkr) && parseFloat(formRate)
      ? calculateUSD(parseFloat(formAmountLkr), parseFloat(formRate))
      : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const lkr = parseFloat(formAmountLkr);
    const rate = parseFloat(formRate);

    if (!formFactoryId) {
      setFormError('Please select a factory.');
      return;
    }
    if (!formBudgetLine.trim()) {
      setFormError('Please provide a budget line description.');
      return;
    }
    if (isNaN(lkr) || lkr <= 0) {
      setFormError('Amount (LKR) must be greater than zero.');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      setFormError('Exchange rate must be greater than zero.');
      return;
    }

    if (editingLine) {
      const ok = await updateBudgetLine(editingLine.id, {
        factory_id: formFactoryId,
        budget_line: formBudgetLine.trim(),
        amount_lkr: lkr,
        exchange_rate_used: rate,
        amount_usd: calculateUSD(lkr, rate),
        note: formNote.trim(),
      });
      if (ok) setIsModalOpen(false);
    } else {
      const ok = await addBudgetLine({
        month: selectedMonth,
        year: selectedYear,
        factory_id: formFactoryId,
        budget_line: formBudgetLine.trim(),
        amount_lkr: lkr,
        exchange_rate_used: rate,
        amount_usd: calculateUSD(lkr, rate),
        note: formNote.trim(),
      });
      if (ok) setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (linePendingDelete) {
      await deleteBudgetLine(linePendingDelete.id);
      setLinePendingDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Monthly Factory Budgets
          </h1>
          <p className="text-xs text-slate-500">
            Allocate and manage budget lines for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Budget Line</span>
        </button>
      </div>

      {/* Overview Cards: Factory-Wise Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Department Grand Total */}
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Department Budget
            </span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono">
              LKR {formatNumber(departmentTotalBudgetLkr)}
            </div>
            <div className="text-xs text-blue-300 font-mono mt-0.5">
              ${formatNumber(departmentTotalBudgetUsd)} USD
            </div>
          </div>
        </div>

        {/* Factory Budgets */}
        {factorySummaries.map((fSum) => (
          <div
            key={fSum.factory.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <FactoryBadge
                code={fSum.factory.factory_code}
                color={fSum.factory.badge_color}
              />
              <button
                onClick={() => openAddModal(fSum.factory.id)}
                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                title={`Add budget for ${fSum.factory.factory_code}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2">
              <div className="text-sm font-bold text-slate-800 font-mono">
                LKR {formatNumber(fSum.budget_lkr)}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                ${formatNumber(fSum.budget_usd)} USD
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Budget Lines Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Allocated Budget Lines ({budgetLines.length})
          </h2>
          <span className="text-xs text-slate-400">
            Stored exchange rates are locked per line
          </span>
        </div>

        {budgetLines.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No budget has been allocated for this month.</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click below to allocate an initial factory budget for {getMonthName(selectedMonth)} {selectedYear}.
            </p>
            <button
              onClick={() => openAddModal()}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Budget Line
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No.</th>
                  <th className="py-3 px-4">Factory</th>
                  <th className="py-3 px-4">Budget Line / Description</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  <th className="py-3 px-4 text-right">Rate Used</th>
                  <th className="py-3 px-4 text-right">Amount (USD)</th>
                  <th className="py-3 px-4">Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {budgetLines.map((line, index) => {
                  const factoryObj =
                    factories.find((f) => f.id === line.factory_id) || line.factory;

                  return (
                    <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <FactoryBadge
                          code={factoryObj?.factory_code || 'FTY'}
                          name={factoryObj?.factory_name}
                          color={factoryObj?.badge_color}
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {line.budget_line}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatNumber(line.amount_lkr)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                        {line.exchange_rate_used.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-blue-700">
                        ${formatNumber(line.amount_usd)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {line.note || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(line)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Line"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setLinePendingDelete(line)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingLine ? 'Edit Budget Line' : 'Add Monthly Budget Line'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Factory Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Factory *
                </label>
                <select
                  value={formFactoryId}
                  onChange={(e) => setFormFactoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  required
                >
                  <option value="" disabled>
                    Select factory
                  </option>
                  {factories
                    .filter((f) => f.is_active || f.id === formFactoryId)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.factory_code} - {f.factory_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Budget Line Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Budget Line / Title *
                </label>
                <input
                  type="text"
                  value={formBudgetLine}
                  onChange={(e) => setFormBudgetLine(e.target.value)}
                  placeholder="e.g. October Monthly Budget, Additional Top-up"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              {/* Amounts and Exchange Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formAmountLkr}
                    onChange={(e) => setFormAmountLkr(e.target.value)}
                    placeholder="500000"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Exchange Rate (1 USD = X LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Calculated USD preview */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">Calculated USD Reference:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  ${formatNumber(calculatedUSD)} USD
                </span>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Remarks / Note
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Optional memo (e.g. Approved by management)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingLine ? 'Save Changes' : 'Add Line'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(linePendingDelete)}
        title="Delete Budget Line"
        message={`Are you sure you want to delete "${linePendingDelete?.budget_line}" for LKR ${formatNumber(
          linePendingDelete?.amount_lkr
        )}? This will recalculate the factory's available balance immediately.`}
        confirmText="Delete Line"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setLinePendingDelete(null)}
      />
    </div>
  );
};
