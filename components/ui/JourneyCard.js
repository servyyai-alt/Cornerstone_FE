import React, { useEffect, useRef, useState } from "react";

const JourneyCard = ({ story, className = "" }) => {
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
