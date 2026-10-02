import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { SummaryPanel } from '../layout/SummaryCards';
import { FactoryBadge } from '../common/FactoryBadge';
import { CategoryTag } from '../common/CategoryTag';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatNumber, calculateUSD, getMonthName } from '../../lib/utils';
import type { Expense, DPRPRType } from '../../types/database';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Save,
  RotateCcw,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface ExpensesViewProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onShowToast }) => {
  const {
    selectedMonth,
    selectedYear,
    expenses,
    factories,
    categories,
    currentExchangeRate,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
  } = useData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFactory, setFilterFactory] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // New Category Inline Creation State
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Form Fields
  const [formDate, setFormDate] = useState('');
  const [formFactoryId, setFormFactoryId] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formType, setFormType] = useState<DPRPRType>('DPR');
  const [formDprPrNo, setFormDprPrNo] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAmountLkr, setFormAmountLkr] = useState('');
  const [formRate, setFormRate] = useState(currentExchangeRate.toString());
  const [formWorkflow, setFormWorkflow] = useState('');
  const [formGrn, setFormGrn] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [expensePendingDelete, setExpensePendingDelete] = useState<Expense | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Search query (DPR/PR No, Description, Workflow, GRN)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          item.dpr_pr_number.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.workflow_number && item.workflow_number.toLowerCase().includes(q)) ||
          (item.grn_number && item.grn_number.toLowerCase().includes(q)) ||
          (item.remarks && item.remarks.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // Factory filter
      if (filterFactory !== 'ALL' && item.factory_id !== filterFactory) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'ALL' && item.category_id !== filterCategory) {
        return false;
      }

      // DPR/PR Type filter
      if (filterType !== 'ALL' && item.dpr_pr_type !== filterType) {
        return false;
      }

      // Date range filter
      if (startDate && item.expense_date < startDate) return false;
      if (endDate && item.expense_date > endDate) return false;

      return true;
    });
  }, [expenses, searchQuery, filterFactory, filterCategory, filterType, startDate, endDate]);

  // Paginated records
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterFactory('ALL');
    setFilterCategory('ALL');
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Open Modal helpers
  const openAddModal = () => {
    setEditingExpense(null);
    setIsViewOnly(false);
    setIsAddingNewCategory(false);
    setNewCategoryName('');

    // Default to current date in YYYY-MM-DD within selected month
    const defaultDay = '01';
    const monthPad = selectedMonth.toString().padStart(2, '0');
    setFormDate(`${selectedYear}-${monthPad}-${defaultDay}`);

    setFormFactoryId(factories[0]?.id || '');
    setFormCategoryId(categories[0]?.id || '');
    setFormType('DPR');
    setFormDprPrNo('');
    setFormDesc('');
    setFormAmountLkr('');
    setFormRate(currentExchangeRate.toFixed(2));
    setFormWorkflow('');
    setFormGrn('');
    setFormRemarks('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsViewOnly(false);
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setFormDate(expense.expense_date);
    setFormFactoryId(expense.factory_id);
    setFormCategoryId(expense.category_id);
    setFormType(expense.dpr_pr_type);
    setFormDprPrNo(expense.dpr_pr_number);
    setFormDesc(expense.description);
    setFormAmountLkr(expense.amount_lkr.toString());
    setFormRate(expense.exchange_rate_used.toString());
    setFormWorkflow(expense.workflow_number || '');
    setFormGrn(expense.grn_number || '');
    setFormRemarks(expense.remarks || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openViewModal = (expense: Expense) => {
    openEditModal(expense);
    setIsViewOnly(true);
  };

  // Immediate Save & Select for typing new category
  const handleCreateCategoryNow = async () => {
    if (!newCategoryName.trim()) {
      setFormError('Please type a category name.');
      return;
    }
    setIsCreatingCategory(true);
    setFormError(null);
    const cat = await addCategory({
      category_name: newCategoryName.trim(),
      color: 'emerald',
      is_active: true,
    });
    setIsCreatingCategory(false);
    if (cat) {
      setFormCategoryId(cat.id);
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      onShowToast(`Category "${cat.category_name}" saved to database and selected.`, 'success');
    } else {
      setFormError('Failed to save category to database.');
    }
  };

  const calculatedUSD =
    parseFloat(formAmountLkr) && parseFloat(formRate)
      ? calculateUSD(parseFloat(formAmountLkr), parseFloat(formRate))
      : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) {
      setIsModalOpen(false);
      return;
    }

    const lkr = parseFloat(formAmountLkr);
    const rate = parseFloat(formRate);

    if (!formDate) {
      setFormError('Date is required.');
      return;
    }
    if (!formFactoryId) {
      setFormError('Please select a factory.');
      return;
    }

    // Resolve Category ID (create new in database if user typed a new one)
    let resolvedCategoryId = formCategoryId;
    if (isAddingNewCategory) {
      if (!newCategoryName.trim()) {
        setFormError('Please enter a name for the new category.');
        return;
      }
      setIsCreatingCategory(true);
      const cat = await addCategory({
        category_name: newCategoryName.trim(),
        color: 'emerald',
        is_active: true,
      });
      setIsCreatingCategory(false);
      if (!cat) {
        setFormError('Could not save the new category to database.');
        return;
      }
      resolvedCategoryId = cat.id;
      setFormCategoryId(cat.id);
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      onShowToast(`New category "${cat.category_name}" saved to database.`, 'success');
    } else if (!formCategoryId) {
      setFormError('Please select a category.');
      return;
    }

    if (!formDprPrNo.trim()) {
      setFormError('DPR / PR Number is required.');
      return;
    }
    if (!formDesc.trim()) {
      setFormError('Description is required.');
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

    // Determine month and year from the chosen date
    const d = new Date(formDate);
    const expMonth = d.getMonth() + 1;
    const expYear = d.getFullYear();

    const payload = {
      expense_date: formDate,
      month: expMonth,
      year: expYear,
      factory_id: formFactoryId,
      category_id: resolvedCategoryId,
      dpr_pr_type: formType,
      dpr_pr_number: formDprPrNo.trim(),
      description: formDesc.trim(),
      amount_lkr: lkr,
      exchange_rate_used: rate,
      amount_usd: calculateUSD(lkr, rate),
      workflow_number: formWorkflow.trim() || undefined,
      grn_number: formGrn.trim() || undefined,
      remarks: formRemarks.trim() || undefined,
    };

    if (editingExpense) {
      const ok = await updateExpense(editingExpense.id, payload);
      if (ok) {
        setIsModalOpen(false);
        onShowToast('Expense updated successfully.', 'success');
      }
    } else {
      const ok = await addExpense(payload);
      if (ok) {
        setIsModalOpen(false);
        onShowToast('Expense added successfully.', 'success');
      }
    }
  };

  const confirmDelete = async () => {
    if (expensePendingDelete) {
      const ok = await deleteExpense(expensePendingDelete.id);
      if (ok) {
        onShowToast('Expense deleted successfully.', 'success');
      }
      setExpensePendingDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            DPR & PR Expenses Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Recorded garment department purchase requisitions for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Top 3-Row Reusable Summary Panel */}
      <SummaryPanel title="Expenses & Budget Summary" />

      {/* Search and Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Search & Filter Expenses</span>
          </div>

          {(searchQuery ||
            filterFactory !== 'ALL' ||
            filterCategory !== 'ALL' ||
            filterType !== 'ALL' ||
            startDate ||
            endDate) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search DPR/PR No, Description, WF, GRN..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            />
          </div>

          {/* Factory Dropdown */}
          <div>
            <select
              value={filterFactory}
              onChange={(e) => {
                setFilterFactory(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Factory"
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-700"
            >
              <option value="ALL">All Factories</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.factory_code}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Category"
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* DPR/PR Type Dropdown */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by DPR or PR Type"
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-700"
            >
              <option value="ALL">All Types (DPR / PR)</option>
              <option value="DPR">DPR Only</option>
              <option value="PR">PR Only</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter Start Date"
              placeholder="From Date"
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet-Style Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Recorded Expense Transactions ({filteredExpenses.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No expenses recorded for this month.</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No matching records found for {getMonthName(selectedMonth)} {selectedYear}. Click below to add an expense entry.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">No.</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Factory</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">DPR/PR No.</th>
                  <th className="py-3 px-3 min-w-[160px]">Description</th>
                  <th className="py-3 px-3 text-right">Amount (LKR)</th>
                  <th className="py-3 px-3 text-right">Amount (USD)</th>
                  <th className="py-3 px-3">Workflow No.</th>
                  <th className="py-3 px-3">GRN No.</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {paginatedExpenses.map((item, index) => {
                  const factoryObj =
                    factories.find((f) => f.id === item.factory_id) || item.factory;
                  const categoryObj =
                    categories.find((c) => c.id === item.category_id) || item.category;

                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {rowNumber}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                        {item.expense_date}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <FactoryBadge
                          code={factoryObj?.factory_code || 'FTY'}
                          name={factoryObj?.factory_name}
                          color={factoryObj?.badge_color}
                        />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <CategoryTag
                          name={categoryObj?.category_name || 'Category'}
                          color={categoryObj?.color}
                        />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            item.dpr_pr_type === 'DPR'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.dpr_pr_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {item.dpr_pr_number}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        <div className="line-clamp-1" title={item.description}>
                          {item.description}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatNumber(item.amount_lkr)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-blue-700 whitespace-nowrap">
                        ${formatNumber(item.amount_usd)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {item.workflow_number || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {item.grn_number || '—'}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(item)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="View Expense Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setExpensePendingDelete(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Expense"
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of{' '}
              {filteredExpenses.length} entries
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-md font-semibold text-xs ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit / View Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isViewOnly
                  ? 'Expense Transaction Details'
                  : editingExpense
                  ? 'Edit DPR / PR Expense'
                  : 'Add New Expense Record'}
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
              {/* Row 1: Date & Factory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expense Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      disabled={isViewOnly}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Factory *
                  </label>
                  <select
                    value={formFactoryId}
                    onChange={(e) => setFormFactoryId(e.target.value)}
                    disabled={isViewOnly}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white disabled:bg-slate-50"
                    required
                  >
                    <option value="" disabled>
                      Select Factory
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
              </div>

              {/* Row 2: Category (Supports selecting or typing a new category that saves to the database) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Category *
                  </label>
                  {!isViewOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(!isAddingNewCategory);
                        setNewCategoryName('');
                        setFormError(null);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {isAddingNewCategory ? (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          <span>Select Existing</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>+ Type New Category</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {!isAddingNewCategory ? (
                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddingNewCategory(true);
                        setNewCategoryName('');
                      } else {
                        setFormCategoryId(e.target.value);
                      }
                    }}
                    disabled={isViewOnly}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white disabled:bg-slate-50"
                    required={!isAddingNewCategory}
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories
                      .filter((c) => c.is_active || c.id === formCategoryId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    {!isViewOnly && (
                      <option value="__ADD_NEW__" className="font-semibold text-blue-700">
                        ➕ Type New Category...
                      </option>
                    )}
                  </select>
                ) : (
                  <div className="space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Type new category name (e.g. Packing Material, Lubricants)"
                        autoFocus
                        className="flex-1 px-3 py-2 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-blue-50/20 font-medium text-slate-800"
                        required
                      />
                      <button
                        type="button"
                        disabled={!newCategoryName.trim() || isCreatingCategory}
                        onClick={handleCreateCategoryNow}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        {isCreatingCategory ? 'Saving...' : 'Save & Select'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      💡 New category will be automatically saved to your database and added to master records.
                    </p>
                  </div>
                )}
              </div>

              {/* Row 3: DPR/PR Number & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    DPR / PR Number *
                  </label>
                  <input
                    type="text"
                    value={formDprPrNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormDprPrNo(val);
                      const upper = val.trim().toUpperCase();
                      if (upper.startsWith('PR') && !upper.startsWith('DPR')) {
                        setFormType('PR');
                      } else {
                        setFormType('DPR');
                      }
                    }}
                    disabled={isViewOnly}
                    placeholder="e.g. DPR-2026-081"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono disabled:bg-slate-50"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    disabled={isViewOnly}
                    placeholder="e.g. Jack MC Parts, Juki Looper"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Amount LKR and Exchange Rate */}
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
                    disabled={isViewOnly}
                    placeholder="13648"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono disabled:bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Exchange Rate Used (1 USD = X LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    disabled={isViewOnly}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono disabled:bg-slate-50"
                    required
                  />
                </div>
              </div>

              {/* Calculated USD Preview Panel */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">Automatic USD Reference Calculation:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  ${formatNumber(calculatedUSD)} USD
                </span>
              </div>

              {/* Row 5: Optional Workflow & GRN Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Workflow Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formWorkflow}
                    onChange={(e) => setFormWorkflow(e.target.value)}
                    disabled={isViewOnly}
                    placeholder="WF-9915"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    GRN Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formGrn}
                    onChange={(e) => setFormGrn(e.target.value)}
                    disabled={isViewOnly}
                    placeholder="GRN-5545"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Row 6: Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Remarks / Notes
                </label>
                <textarea
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  disabled={isViewOnly}
                  placeholder="Optional remarks (e.g. Line 4 motor replacement, Supplier info)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {isViewOnly ? 'Close' : 'Cancel'}
                </button>
                {!isViewOnly && (
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(expensePendingDelete)}
        title="Delete Expense Record"
        message={`Are you sure you want to delete ${expensePendingDelete?.dpr_pr_type} "${expensePendingDelete?.dpr_pr_number}" (${expensePendingDelete?.description}) for LKR ${formatNumber(
          expensePendingDelete?.amount_lkr
        )}? This cannot be undone.`}
        confirmText="Delete Record"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setExpensePendingDelete(null)}
      />
    </div>
  );
};
