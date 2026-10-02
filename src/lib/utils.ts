/**
 * Utility functions for Department Expense Tracker
 */

// Format LKR Currency: e.g. LKR 1,500,000.00
export function formatLKR(amount: number | null | undefined): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `LKR ${val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format USD Currency: e.g. USD 45.00
export function formatUSD(amount: number | null | undefined): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `USD ${val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format raw number with comma and 2 decimals
export function formatNumber(amount: number | null | undefined): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Calculate USD from LKR and exchange rate
export function calculateUSD(amountLkr: number, exchangeRate: number): number {
  if (!amountLkr || !exchangeRate || exchangeRate <= 0) return 0;
  return Math.round((amountLkr / exchangeRate) * 100) / 100;
}

// Month names helper
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthName(monthNumber: number): string {
  return MONTHS[monthNumber - 1] || `Month ${monthNumber}`;
}

// Badge color mapping for factories
export function getFactoryBadgeStyles(color: string = 'blue') {
  switch (color.toLowerCase()) {
    case 'blue':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'indigo':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'teal':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'purple':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'emerald':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'amber':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'rose':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

// Badge color mapping for categories
export function getCategoryBadgeStyles(color: string = 'slate') {
  switch (color.toLowerCase()) {
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    case 'sky':
    case 'blue':
      return 'bg-sky-50 text-sky-700 border-sky-300';
    case 'amber':
    case 'orange':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'purple':
    case 'violet':
      return 'bg-purple-50 text-purple-700 border-purple-300';
    case 'rose':
    case 'red':
      return 'bg-rose-50 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

// Export array of objects to CSV
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            const raw = row[k];
            const cellStr =
              raw === null || raw === undefined
                ? ''
                : raw instanceof Date
                ? raw.toLocaleString()
                : String(raw);
            return `"${cellStr.replace(/"/g, '""')}"`;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
