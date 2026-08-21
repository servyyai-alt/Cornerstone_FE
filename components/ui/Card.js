import React from "react";

const Card = ({
  children,
  className = "",
  hoverable = false,
  ...props
}) => {
  const base =
    "rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300";
  const hover = hoverable
    ? "hover:border-primary/30 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)] hover:-translate-y-1"
    : "";

  return (
    <div
      className={`${base} ${hover} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
