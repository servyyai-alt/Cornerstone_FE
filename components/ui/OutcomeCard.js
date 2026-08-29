import React, { useEffect, useRef, useState } from "react";

const OutcomeCard = ({ outcome, className = "" }) => {
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
