"use client";

import React, { useState, useRef } from "react";

const Tabs = ({ items, className = "", label }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);

  const activateTab = (index) => {
    setActiveTab(index);
    tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeTab + direction + items.length) % items.length;
    activateTab(nextIndex);
  };

  return (
    <div className={className}>
      <div
        className="flex flex-wrap gap-2 border-b border-border"
        role="tablist"
        aria-label={label}
      >
        {items.map((item, index) => {
          const isActive = activeTab === index;
          return (
            <button
              key={index}
              id={`tab-${index}`}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${index}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(index)}
              onKeyDown={onKeyDown}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {items.map((item, index) => (
          <div
            key={index}
            id={`tab-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`tab-${index}`}
            className={activeTab === index ? "block" : "hidden"}
          >
            <div className="text-sm text-foreground leading-relaxed">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
