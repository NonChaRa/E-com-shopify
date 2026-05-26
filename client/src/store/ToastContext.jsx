/* @refresh reset */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ToastContext = createContext(null);

// Simple counter — avoids crypto.randomUUID() overhead in hot paths
let _id = 0;

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * showToast(message, type?, duration?)
   *   type:     'success' | 'error' | 'info'  (default: 'success')
   *   duration: ms before auto-dismiss        (default: 3500)
   */
  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // Schedule removal after duration + 300 ms exit-animation buffer
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 300);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Portal straight to <body> — immune to stacking-context issues */}
      {createPortal(
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Toast item
// ---------------------------------------------------------------------------
const ICONS = { success: '✓', error: '✕', info: 'ⓘ' };

const ToastItem = ({ toast, onDismiss }) => (
  <div
    className={`toast toast--${toast.type}`}
    onClick={onDismiss}
    role="alert"
  >
    <span className="toast-icon" aria-hidden="true">
      {ICONS[toast.type] ?? '✓'}
    </span>
    <span className="toast-message">{toast.message}</span>
    {/* Depleting progress bar — duration driven by inline style */}
    <span
      className="toast-progress"
      style={{ animationDuration: `${toast.duration}ms` }}
      aria-hidden="true"
    />
  </div>
);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
