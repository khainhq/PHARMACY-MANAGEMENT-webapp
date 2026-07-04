import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext({
  showSuccess: () => {},
  showError: () => {},
  notify: () => {},
});

const toastStackStyle = {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  zIndex: 5000,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: 'min(380px, calc(100vw - 2rem))',
  pointerEvents: 'none',
};

const toastMessageStyle = {
  flex: 1,
  minWidth: 0,
  overflowWrap: 'anywhere',
};

const closeButtonStyle = {
  border: 0,
  background: 'rgba(255, 255, 255, 0.18)',
  color: '#ffffff',
  width: '28px',
  height: '28px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  lineHeight: 1,
  cursor: 'pointer',
};

const getToastBarStyle = (type) => ({
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.85rem',
  minHeight: '52px',
  padding: '0.85rem 1rem',
  borderRadius: '8px',
  color: '#ffffff',
  background: type === 'success' ? '#16a34a' : '#dc2626',
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.22)',
  fontWeight: 700,
  lineHeight: 1.4,
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success') => {
    if (!message) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current.slice(-3), { id, message, type }]);

    const timer = window.setTimeout(() => removeToast(id), 4200);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo(() => ({
    notify,
    showSuccess: (message) => notify(message, 'success'),
    showError: (message) => notify(message, 'error'),
  }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div style={toastStackStyle} aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={getToastBarStyle(toast.type)}
              role={toast.type === 'error' ? 'alert' : 'status'}
              data-testid="app-toast"
              data-toast-type={toast.type}
            >
              <span style={toastMessageStyle}>{toast.message}</span>
              <button
                type="button"
                style={closeButtonStyle}
                aria-label="Đóng thông báo"
                onClick={() => removeToast(toast.id)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
