import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/* ─── individual toast ─── */
function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 350);
    }, toast.duration || 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast, onRemove]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 350);
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`toast-item toast-${toast.type} ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon-box">
        <span className="toast-icon">{icons[toast.type] || icons.info}</span>
      </div>
      <div className="toast-body">
        {toast.title && <strong className="toast-title">{toast.title}</strong>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>×</button>
      <div className="toast-progress" style={{ animationDuration: `${toast.duration || 4000}ms` }} />
    </div>
  );
}

/* ─── confirm dialog ─── */
function ConfirmDialog({ data, onResolve }) {
  if (!data) return null;

  const variantColors = {
    danger: { icon: '🗑️', accent: '#ef4444' },
    warning: { icon: '⚠️', accent: '#f59e0b' },
    info: { icon: 'ℹ️', accent: '#3b82f6' },
  };
  const v = variantColors[data.variant] || variantColors.info;

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-icon">{v.icon}</div>
        <h3 className="confirm-title">{data.title}</h3>
        <p className="confirm-message">{data.message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-cancel" onClick={() => onResolve(false)}>
            {data.cancelText || 'Cancel'}
          </button>
          <button
            className="confirm-btn confirm-ok"
            style={{ background: v.accent }}
            onClick={() => onResolve(true)}
          >
            {data.okText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── provider ─── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  const resolveRef = useRef(null);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = '', duration = 4000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, title, duration }]);
  }, []);

  const showConfirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmData({ title, message, ...options });
    });
  }, []);

  const handleConfirmResolve = useCallback((value) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setConfirmData(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* toast stack */}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>

      {/* confirm dialog */}
      <ConfirmDialog data={confirmData} onResolve={handleConfirmResolve} />
    </ToastContext.Provider>
  );
}
