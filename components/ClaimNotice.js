"use client";

import React from 'react';
import { Info } from 'lucide-react';

const ClaimNotice = ({ 
  children, 
  tone = 'info',
  className = '',
  icon = true 
}) => {
  const toneStyles = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    neutral: 'bg-surface-2 border-border text-foreground/80',
    educational: 'bg-primary/5 border-primary/20 text-foreground/80',
  };

  const styles = toneStyles[tone] || toneStyles.info;

  return (
    <div 
      className={`inline-flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles} ${className}`}
      role="note"
      aria-label="Important information"
    >
      {icon && (
        <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
          <Info className="h-4 w-4" />
        </span>
      )}
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
};

export default ClaimNotice;