import React, { useEffect, useRef, useState } from "react";

const ProgrammeCard = ({ programme, className = "" }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_16px_36px_rgba(185,151,80,0.12)] ${className}`}
    >
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
