"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const getDocument = () => (typeof document === 'undefined' ? null : document);

const AdminDialog = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-3xl',
}) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = getDocument()?.activeElement || null;
    const timer = window.setTimeout(() => {
      const focusTarget = dialogRef.current?.querySelector(
        'input, textarea, select, button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      focusTarget?.focus?.();
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
      if (event.key !== 'Tab') return;

      const focusables = Array.from(
        dialogRef.current?.querySelectorAll(
          'input, textarea, select, button, a[href], [tabindex]:not([tabindex="-1"])'
        ) || []
      ).filter((node) => !node.hasAttribute('disabled'));

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && getDocument()?.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && getDocument()?.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      const previousFocus = previousFocusRef.current;
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [open, onClose]);

  if (!open || !getDocument()) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        aria-describedby={description ? 'admin-dialog-description' : undefined}
        className={`w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 id="admin-dialog-title" className="font-display text-2xl text-foreground">
              {title}
            </h2>
            {description ? (
              <p id="admin-dialog-description" className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 transition hover:bg-surface-2"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-border px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default AdminDialog;

