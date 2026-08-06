import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:-translate-y-0.5",
    secondary:
      "border border-border bg-surface text-foreground hover:bg-surface-2 hover:border-primary/30",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-surface-2",
    ghost:
      "bg-transparent text-foreground hover:bg-surface-2",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
