import React from 'react';
import { useData } from '../../context/DataContext';
import { MONTHS } from '../../lib/utils';
import { Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, currentExchangeRate } =
    useData();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const years = Array.from({ length: 9 }, (_, i) => 2022 + i);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs print:hidden">
      {/* Month & Year Navigator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-blue-50/80 border border-blue-200 rounded-lg p-1 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-blue-700 hover:bg-blue-100/70 rounded-md transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2.5">
            <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select Budget Month"
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select Budget Year"
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-blue-700 hover:bg-blue-100/70 rounded-md transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden md:inline">
          Filtering data for {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
      </div>

      {/* Exchange Rate Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
            <DollarSign className="w-3 h-3" />
          </div>
          <div>
            <span className="text-slate-500 font-normal">Active Rate: </span>
            <span className="font-mono font-bold text-slate-800">
              1 USD = {currentExchangeRate.toFixed(2)} LKR
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
