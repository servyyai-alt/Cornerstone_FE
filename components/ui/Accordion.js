"use client";

import React, { useState } from "react";

const Accordion = ({ items, className = "" }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`rounded-xl border border-border bg-surface divide-y divide-border ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const headerId = `accordion-header-${index}`;
        const panelId = `accordion-panel-${index}`;
        return (
          <div key={index} className="px-6">
            <button
              id={headerId}
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between py-4 text-left font-medium text-foreground transition-colors hover:text-primary"
            >
              <span>{item.title}</span>
              <span
                aria-hidden="true"
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              aria-hidden={!isOpen}
              className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-4" : "max-h-0"}`}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
