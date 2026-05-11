
const CitationToolTips = ({ citation }) => {
  const domain = citation.domain || citation.url;

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-auto block">
        {/* Arrow */}
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e1e22] border-r border-b border-white/10 rotate-45 block" />
        {/* Card */}
        <span className="bg-[#1e1e22] border border-white/10 rounded-xl p-3.5 shadow-2xl block">
          {/* Domain + favicon */}
          <span className="flex items-center gap-2 mb-2">
            <img
              src={faviconUrl}
              alt={domain}
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-[11px] text-white/40 truncate">{domain}</span>
          </span>
          {/* Title */}
          <span className="text-[13px] font-medium text-white leading-snug line-clamp-2 mb-1 block">
            {citation.title}
          </span>
          {/* URL preview */}
          <span className="text-[11px] text-blue-400/70 truncate block">
            {citation.url}
          </span>
        </span>
      </span>
    </>
  );
};

export default CitationToolTips;
