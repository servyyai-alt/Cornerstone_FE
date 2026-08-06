import React from "react";

const Timeline = ({ items, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
      <div className="space-y-8">
        {items.map((item, index) => (
          <div key={index} className="relative flex gap-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
              <span className="text-xs font-bold text-primary">{index + 1}</span>
            </div>
            <div className="flex-1 pt-1">
              {item.title && (
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.content && (
                <div className="text-sm text-foreground leading-relaxed">
                  {item.content}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
