import { useState } from "react";
import CitationToolTips from "./CitationToolTips";

const CitationChip = ({ citation, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-0.5 inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface-secondary text-[10px] font-semibold text-text-secondary no-underline transition-colors hover:border-border-strong hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-app"
      >
        {index}
      </a>
      {/* Tooltip */}
      {hovered && <CitationToolTips citation={citation} />}
    </span>
  );
};

export default CitationChip;
