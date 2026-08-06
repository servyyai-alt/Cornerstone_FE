import React from "react";

const UniversityCard = ({ university, className = "" }) => {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md ${className}`}>
      <div className="flex flex-col gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            {university.country}
          </p>
          <h3 className="font-display text-xl text-foreground mt-2 mb-1">{university.name}</h3>
          <p className="text-xs text-muted-foreground">{university.city}</p>
        </div>

        {university.description && (
          <p className="text-xs leading-5 text-muted-foreground">{university.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(Array.isArray(university.subjects) ? university.subjects : []).slice(0, 3).map((subject, i) => (
            <span key={i} className="text-[10px] uppercase font-semibold bg-surface-2 text-foreground/80 px-2 py-0.5 rounded border border-border">
              {subject}
            </span>
          ))}
        </div>

        <div className="border-t border-border pt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Pathway</span>
            <span className="font-medium text-foreground">{university.pathway}</span>
          </div>
          <div className="flex justify-between">
            <span>Transfer</span>
            <span className="font-medium text-foreground">{university.transferYear}</span>
          </div>
          <div className="flex justify-between">
            <span>Awarded by</span>
            <span className="font-medium text-foreground">{university.awardingBody}</span>
          </div>
        </div>

        {university.indicativeCost && (
          <div className="border-t border-border pt-3">
            <p className="text-sm font-semibold text-foreground">{university.indicativeCost}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Indicative total cost</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityCard;
