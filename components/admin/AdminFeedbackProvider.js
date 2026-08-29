"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X, CircleAlert } from 'lucide-react';

const AdminFeedbackContext = createContext(null);

const toneConfig = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    accent: 'bg-emerald-500',
  },
  error: {
    icon: CircleAlert,
    className: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
    accent: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    accent: 'bg-amber-500',
  },
  info: {
    icon: Info,
    className: 'border-primary/20 bg-primary/10 text-foreground',
    accent: 'bg-primary',
  },
};

const getDocument = () => (typeof document === 'undefined' ? null : document);

export const AdminFeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [mounted, setMounted] = useState(false);
  const toastTimers = useRef(new Map());
  const confirmResolveRef = useRef(null);
  const confirmCancelRef = useRef(null);
  const lastFocusRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const notify = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = {
      id,
      title: options.title || '',
      message: String(message || ''),
      tone: options.tone || 'info',
      duration: typeof options.duration === 'number' ? options.duration : 4200,
    };

    setToasts((current) => [...current, toast]);

    const timer = window.setTimeout(() => {
      dismissToast(id);
    }, toast.duration);

    toastTimers.current.set(id, timer);
    return id;
  }, [dismissToast]);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      if (confirmResolveRef.current) {
        confirmResolveRef.current(false);
      }

      lastFocusRef.current = getDocument()?.activeElement || null;
      confirmResolveRef.current = resolve;
      setConfirmState({
        title: options.title || 'Confirm action',
        description: options.description || 'Please confirm this action before continuing.',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        tone: options.tone || 'warning',
      });
    });
  }, []);

  const closeConfirm = useCallback((result) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
    setConfirmState(null);
    const previousFocus = lastFocusRef.current;
    if (previousFocus && typeof previousFocus.focus === 'function') {
      window.setTimeout(() => previousFocus.focus(), 0);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!confirmState) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeConfirm(false);
      }

      if (event.key === 'Tab' && confirmCancelRef.current) {
        const confirmButton = getDocument()?.getElementById('admin-confirm-button');
        if (event.shiftKey && getDocument()?.activeElement === confirmCancelRef.current) {
          event.preventDefault();
          confirmButton?.focus();
        } else if (!event.shiftKey && getDocument()?.activeElement === confirmButton) {
          event.preventDefault();
          confirmCancelRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => confirmCancelRef.current?.focus(), 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [confirmState, closeConfirm]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      if (confirmResolveRef.current) {
        confirmResolveRef.current(false);
        confirmResolveRef.current = null;
      }
    };
  }, []);

  const contextValue = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <AdminFeedbackContext.Provider value={contextValue}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-end gap-3 px-4 sm:top-6 sm:px-6">
              {toasts.map((toast) => {
                const config = toneConfig[toast.tone] || toneConfig.info;
                const Icon = config.icon;

                return (
                  <div
                    key={toast.id}
                    role={toast.tone === 'error' ? 'alert' : 'status'}
                    aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
                    className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur ${config.className}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.accent} text-white`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {toast.title ? (
                          <p className="text-sm font-semibold leading-5">{toast.title}</p>
                        ) : null}
                        <p className={`text-sm leading-5 ${toast.title ? 'mt-1' : ''}`}>{toast.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissToast(toast.id)}
                        className="rounded-md p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="Dismiss notification"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>,
            document.body
          )
        : null}

      {confirmState && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeConfirm(false);
                }
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-confirm-title"
                aria-describedby="admin-confirm-description"
                className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id="admin-confirm-title" className="font-display text-2xl text-foreground">
                      {confirmState.title}
                    </h2>
                    <p id="admin-confirm-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {confirmState.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    ref={confirmCancelRef}
                    onClick={() => closeConfirm(false)}
                    className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary"
                  >
                    {confirmState.cancelLabel}
                  </button>
                  <button
                    id="admin-confirm-button"
                    type="button"
                    onClick={() => closeConfirm(true)}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                  >
                    {confirmState.confirmLabel}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </AdminFeedbackContext.Provider>
  );
};

export const useAdminFeedback = () => {
  const context = useContext(AdminFeedbackContext);
  if (!context) {
    throw new Error('useAdminFeedback must be used within AdminFeedbackProvider');
  }
  return context;
};

