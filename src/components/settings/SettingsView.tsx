import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FactoryBadge } from '../common/FactoryBadge';
import { CategoryTag } from '../common/CategoryTag';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  DollarSign,
  Building,
  Tags,
  Database,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Info,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import type { Factory, Category } from '../../types/database';

interface SettingsViewProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const {
    currentExchangeRate,
    updateExchangeRate,
    factories,
    addFactory,
    updateFactory,
    toggleFactoryActive,
    categories,
    addCategory,
    updateCategory,
    toggleCategoryActive,
    exportBackupJSON,
    importBackupJSON,
    expenses,
    budgetLines,
  } = useData();

  // Exchange Rate State
  const [rateInput, setRateInput] = useState(currentExchangeRate.toString());
  const [isRateSaving, setIsRateSaving] = useState(false);

  // Factory Modal State
  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [ftyCode, setFtyCode] = useState('');
  const [ftyName, setFtyName] = useState('');
  const [ftyColor, setFtyColor] = useState('blue');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('emerald');

  // Restore State
  const [restoreJsonContent, setRestoreJsonContent] = useState<string | null>(null);

  // Update Exchange Rate Handler
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) {
      onShowToast('Please provide a valid positive exchange rate.', 'error');
      return;
    }
    setIsRateSaving(true);
    const ok = await updateExchangeRate(parsed);
    setIsRateSaving(false);
    if (ok) {
      onShowToast(`Exchange rate updated to 1 USD = ${parsed.toFixed(2)} LKR.`, 'success');
    }
  };

  // Factory Modal Handlers
  const openAddFactory = () => {
    setEditingFactory(null);
    setFtyCode('');
    setFtyName('');
    setFtyColor('blue');
    setIsFactoryModalOpen(true);
  };

  const openEditFactory = (f: Factory) => {
    setEditingFactory(f);
    setFtyCode(f.factory_code);
    setFtyName(f.factory_name);
    setFtyColor(f.badge_color || 'blue');
    setIsFactoryModalOpen(true);
  };

  const handleSaveFactory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ftyCode.trim() || !ftyName.trim()) {
      onShowToast('Factory code and name are required.', 'error');
      return;
    }

    if (editingFactory) {
      const ok = await updateFactory(editingFactory.id, {
        factory_code: ftyCode.trim().toUpperCase(),
        factory_name: ftyName.trim(),
        badge_color: ftyColor,
      });
      if (ok) {
        setIsFactoryModalOpen(false);
        onShowToast('Factory updated successfully.', 'success');
      }
    } else {
      const ok = await addFactory({
        factory_code: ftyCode.trim().toUpperCase(),
        factory_name: ftyName.trim(),
        badge_color: ftyColor,
        is_active: true,
      });
      if (ok) {
        setIsFactoryModalOpen(false);
        onShowToast('Factory added successfully.', 'success');
      }
    }
  };

  // Category Modal Handlers
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatColor('emerald');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.category_name);
    setCatColor(c.color || 'emerald');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      onShowToast('Category name is required.', 'error');
      return;
    }

    if (editingCategory) {
      const ok = await updateCategory(editingCategory.id, {
        category_name: catName.trim(),
        color: catColor,
      });
      if (ok) {
        setIsCategoryModalOpen(false);
        onShowToast('Category updated successfully.', 'success');
      }
    } else {
      const ok = await addCategory({
        category_name: catName.trim(),
        color: catColor,
        is_active: true,
      });
      if (ok) {
        setIsCategoryModalOpen(false);
        onShowToast('Category added successfully.', 'success');
      }
    }
  };

  // Backup Download
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeptExpenseTracker_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Backup JSON file downloaded successfully.', 'success');
  };

  // Restore File Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRestoreJsonContent(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmRestore = async () => {
    if (!restoreJsonContent) return;
    const res = await importBackupJSON(restoreJsonContent);
    setRestoreJsonContent(null);
    if (res.success) {
      onShowToast(res.message, 'success');
    } else {
      onShowToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500">
          Configure baseline exchange rates, factory units, expense categories, and system backups
        </p>
      </div>

      {/* 1. EXCHANGE RATE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Currency Exchange Rate</h2>
            <p className="text-xs text-slate-500">
              Set the default baseline USD/LKR rate used when creating new budget lines and expenses
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveRate} className="max-w-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Baseline (1 USD = X LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isRateSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Rate</span>
              </button>
            </div>
          </div>

          {/* Critical Business Logic Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Historical Integrity Preservation:</span>
              <p className="text-slate-600 leading-relaxed">
                Changing the current exchange rate will affect new transactions only. Historical
                transactions retain the exchange rate used when they were created to safeguard past
                audited balance reports.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* 2. FACTORIES MASTER DATA */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Factory Production Plants</h2>
              <p className="text-xs text-slate-500">
                Master list of apparel manufacturing units (FTY 01, FTY 03, FTY 04, FTY 05)
              </p>
            </div>
          </div>

          <button
            onClick={openAddFactory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Factory</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Factory Name</th>
                <th className="py-2.5 px-4">Badge Preview</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {factories.map((f) => {
                const hasHistory =
                  expenses.some((e) => e.factory_id === f.id) ||
                  budgetLines.some((b) => b.factory_id === f.id);

                return (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{f.factory_code}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{f.factory_name}</td>
                    <td className="py-3 px-4">
                      <FactoryBadge code={f.factory_code} color={f.badge_color} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {f.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditFactory(f)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Factory"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleFactoryActive(f.id, !f.is_active)}
                          className={`text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                            f.is_active
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {f.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {hasHistory && (
                          <span
                            className="text-[10px] text-slate-400 italic"
                            title="Protected: Contains historical records"
                          >
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CATEGORIES MASTER DATA */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Expense Categories</h2>
              <p className="text-xs text-slate-500">
                Machine Spares, Needles, Folders, Jig Boards, and Hardware specifications
              </p>
            </div>
          </div>

          <button
            onClick={openAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Category Name</th>
                <th className="py-2.5 px-4">Tag Display</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.map((c) => {
                const hasExpenses = expenses.some((e) => e.category_id === c.id);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.category_name}</td>
                    <td className="py-3 px-4">
                      <CategoryTag name={c.category_name} color={c.color} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditCategory(c)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleCategoryActive(c.id, !c.is_active)}
                          className={`text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                            c.is_active
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {hasExpenses && (
                          <span
                            className="text-[10px] text-slate-400 italic"
                            title="Protected: Used in historical transactions"
                          >
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. BACKUP & RESTORE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Database Backup & Recovery</h2>
            <p className="text-xs text-slate-500">
              Export all system settings, factories, categories, monthly budgets, and expenses as JSON
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download Backup */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Download JSON Backup
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generates a complete snapshot of all historical months, budgets, and expenses without sensitive credentials.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export System Data (.json)</span>
              </button>
            </div>
          </div>

          {/* Restore Backup */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-600" />
                Restore from JSON Backup
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload a previously saved JSON backup file. Structure will be verified before applying.
              </p>
            </div>
            <div className="mt-4">
              <label className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Select Backup JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Factory Modal */}
      {isFactoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingFactory ? 'Edit Factory Plant' : 'Add New Factory Plant'}
              </h3>
              <button
                onClick={() => setIsFactoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFactory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Factory Code *
                </label>
                <input
                  type="text"
                  value={ftyCode}
                  onChange={(e) => setFtyCode(e.target.value)}
                  placeholder="e.g. FTY 06"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Factory Name *
                </label>
                <input
                  type="text"
                  value={ftyName}
                  onChange={(e) => setFtyName(e.target.value)}
                  placeholder="e.g. Factory 06 - Colombo Plant"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Badge Color Style
                </label>
                <select
                  value={ftyColor}
                  onChange={(e) => setFtyColor(e.target.value)}
                  aria-label="Select badge color"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="blue">Blue</option>
                  <option value="indigo">Indigo</option>
                  <option value="teal">Teal</option>
                  <option value="purple">Purple</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFactoryModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save Factory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Lubricants & Oils"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tag Color Style
                </label>
                <select
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  aria-label="Select tag color"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="emerald">Emerald Green</option>
                  <option value="sky">Sky Blue</option>
                  <option value="amber">Amber / Yellow</option>
                  <option value="purple">Purple / Violet</option>
                  <option value="rose">Rose Red</option>
                  <option value="slate">Slate Gray</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(restoreJsonContent)}
        title="Restore Database from Backup"
        message="Are you sure you want to restore data from this backup? Existing tables will be updated with the records in the backup file."
        confirmText="Confirm Restore"
        isDestructive={false}
        onConfirm={confirmRestore}
        onCancel={() => setRestoreJsonContent(null)}
      />
    </div>
  );
};
