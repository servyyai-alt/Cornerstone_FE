import React from "react";

const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    error: "bg-red-500/10 text-red-700 dark:text-red-300",
    outline: "border border-border bg-transparent text-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
