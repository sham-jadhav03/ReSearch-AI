import React from "react";

const LogoIcon = ({ size = 18, color = "white" }) => (
  <>
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
    </svg>
  </>
);
export default LogoIcon;
