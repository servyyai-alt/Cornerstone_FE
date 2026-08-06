import React from "react";

const OutcomeCard = ({ outcome, className = "" }) => {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {outcome.title && (
            <h3 className="font-display text-lg text-foreground mb-1">{outcome.title}</h3>
          )}
          {outcome.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{outcome.description}</p>
          )}
          {outcome.metric && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{outcome.metric}</span>
              {outcome.metricLabel && (
                <span className="text-xs text-muted-foreground">{outcome.metricLabel}</span>
              )}
            </div>
          )}
          {outcome.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">{outcome.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutcomeCard;
