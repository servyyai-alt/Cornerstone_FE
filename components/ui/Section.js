import React from "react";
import Container from "./Container";

const Section = ({
  children,
  className = "",
  containerClassName = "",
  spacing = "lg",
  ...props
}) => {
  const spacingMap = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
    xl: "py-20",
  };

  return (
    <section
      className={`w-full ${spacingMap[spacing]} ${className}`}
      {...props}
    >
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  );
};

export default Section;
