import React from "react";

const Alert = ({
  children,
  variant = "info",
  title,
  className = "",
  ...props
}) => {
  const variants = {
    info: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    success: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    error: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  };

  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {title && <p className="font-semibold mb-1">{title}</p>}
      {children}
    </div>
  );
};

export default Alert;
