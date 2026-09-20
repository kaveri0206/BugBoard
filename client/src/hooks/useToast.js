/**
 * @file useToast.js
 * @description Safe consumer hook for ToastContext with defensive fallback.
 */

import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
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

export default useToast;