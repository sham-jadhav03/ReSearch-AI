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
        className="inline-flex items-center justify-center w-5 h-5 mx-0.5 rounded-full bg-white/8 border border-white/10 text-[10px] font-semibold text-white/70 hover:bg-white/15 hover:text-white transition-all no-underline shrink-0 cursor-pointer"
      >
        {index}
      </a>
      {/* Tooltip */}
      {hovered && <CitationToolTips citation={citation} />}
    </span>
  );
};

export default CitationChip;
