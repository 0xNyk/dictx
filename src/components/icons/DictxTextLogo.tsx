/* eslint-disable i18next/no-literal-string */
import React from "react";

const DictxTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="200"
        y="70"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="72"
        fontWeight="700"
        letterSpacing="-2"
        className="logo-primary"
      >
        Dictx
      </text>
    </svg>
  );
};

export default DictxTextLogo;
