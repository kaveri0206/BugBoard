/**
 * @file ToastContext.jsx
 * @description Global notification context for displaying feedback toasts (success, error, info).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);

  const value = {
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    showToast: addToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed z-50 flex flex-col w-full max-w-sm gap-2 px-4 pointer-events-none bottom-4 right-4">
        {toasts.map((t) => {
          let bg = 'bg-slate-800 border-slate-700 text-white';
          if (t.type === 'success') bg = 'bg-emerald-950/90 border-emerald-500 text-emerald-200';
          if (t.type === 'error') bg = 'bg-rose-950/90 border-rose-500 text-rose-200';
          if (t.type === 'warning') bg = 'bg-amber-950/90 border-amber-500 text-amber-200';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto border rounded-lg px-4 py-3 shadow-xl backdrop-blur flex items-center justify-between transition-all duration-300 ${bg}`}
            >
              <span className="text-sm font-medium">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-3 text-sm font-bold text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback so components never crash even if rendered without the provider
    return {
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      info: (msg) => console.log('[Toast Info]:', msg),
      warning: (msg) => console.warn('[Toast Warning]:', msg),
      addToast: () => {},
      removeToast: () => {},
      showToast: () => {},
    };
  }
  return context;
};

export default ToastContext;