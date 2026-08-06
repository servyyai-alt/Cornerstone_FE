import React from "react";

const Container = ({ children, className = "", as: Tag = "div", ...props }) => {
  return (
    <Tag
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Container;
