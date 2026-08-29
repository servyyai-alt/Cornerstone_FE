import React, { useEffect, useRef, useState } from "react";

const UniversityCard = ({ university, className = "" }) => {
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
