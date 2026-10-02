import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg transition-all animate-in slide-in-from-right-5 duration-200 ${
        isSuccess
          ? 'bg-white border-emerald-200 text-emerald-950'
          : isError
          ? 'bg-white border-rose-200 text-rose-950'
          : 'bg-white border-blue-200 text-blue-950'
      }`}
    >
      <div className="flex items-center gap-3">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
        {!isSuccess && !isError && <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />}
        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
