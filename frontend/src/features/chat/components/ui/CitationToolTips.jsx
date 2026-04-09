import React from "react";

const CitationToolTips = ({ citation }) => {
  let domain = citation.url;
  try {
    domain = new URL(citation.url).hostname.replace("www.", "");
  } catch (_) {}

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none">
        {/* Arrow */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e1e22] border-r border-b border-white/10 rotate-45" />
        {/* Card */}
        <div className="bg-[#1e1e22] border border-white/10 rounded-xl p-3.5 shadow-2xl">
          {/* Domain + favicon */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={faviconUrl}
              alt={domain}
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-[11px] text-white/40 truncate">{domain}</span>
          </div>
          {/* Title */}
          <p className="text-[13px] font-medium text-white leading-snug line-clamp-2 mb-1">
            {citation.title}
          </p>
          {/* URL preview */}
          <p className="text-[11px] text-blue-400/70 truncate">
            {citation.url}
          </p>
        </div>
      </div>
    </>
  );
};

export default CitationToolTips
