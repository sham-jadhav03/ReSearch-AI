import { useState } from "react";

const CitationChip = ({ citation, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-4 h-4 mx-0.5 -translate-y-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold text-white/60 hover:bg-white/20 hover:text-white transition-all no-underline shrink-0 cursor-pointer"
      >
        {index}
      </a>
      {/* Tooltip */}
      {hovered && <CitationTooltip citation={citation} />}
    </span>
  );
};

export default CitationChip