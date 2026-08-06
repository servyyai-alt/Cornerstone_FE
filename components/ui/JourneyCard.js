import React from "react";

const JourneyCard = ({ story, className = "" }) => {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary">{story.initials}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg text-foreground mb-1">{story.startPoint}</h3>
          <p className="text-xs text-muted-foreground mb-2">{story.pathway} · {story.destination}</p>
          {story.outcome && (
            <p className="text-sm text-muted-foreground">{story.outcome}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyCard;
