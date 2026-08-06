import React from "react";

const ProgrammeCard = ({ programme, className = "" }) => {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md ${className}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-display text-xl text-foreground mb-1">{programme.title}</h3>
          <p className="text-xs text-muted-foreground">{programme.awardingBody}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Credits</p>
            <p className="mt-1 font-medium text-foreground">{programme.credits}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</p>
            <p className="mt-1 font-medium text-foreground">{programme.duration}</p>
          </div>
        </div>

        {programme.modules && programme.modules.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Modules</p>
            <div className="flex flex-wrap gap-1.5">
              {programme.modules.slice(0, 4).map((module, i) => (
                <span key={i} className="text-xs bg-surface-2 text-foreground/80 px-2.5 py-1 rounded border border-border">
                  {module}
                </span>
              ))}
            </div>
          </div>
        )}

        {programme.fees && (
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Fees:</span> {programme.fees}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammeCard;
