
import { getSafeExternalUrl } from "../../shared/safeExternalUrl";

const CitationToolTips = ({ citation }) => {
  const safeUrl = getSafeExternalUrl(citation.url);
  if (!safeUrl) return null;

  const domain = new URL(safeUrl).hostname.replace(/^www\./, "");
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

  return (
    <>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-auto block">
        {/* Arrow */}
        <span className="absolute -bottom-1.5 left-1/2 block h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-border-default bg-surface-elevated" />
        {/* Card */}
        <span className="block rounded-lg border border-border-default bg-surface-elevated p-3.5 shadow-2xl shadow-black/40">
          {/* Domain + favicon */}
          <span className="flex items-center gap-2 mb-2">
            <img
              src={faviconUrl}
              alt={domain}
              loading="lazy"
              decoding="async"
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="truncate text-[11px] text-text-muted">{domain}</span>
          </span>
          {/* Title */}
          <span className="mb-1 block line-clamp-2 text-[13px] font-medium leading-snug text-text-primary">
            {citation.title}
          </span>
          {/* URL preview */}
          <span className="block truncate text-[11px] text-text-secondary">
            {safeUrl}
          </span>
        </span>
      </span>
    </>
  );
};

export default CitationToolTips;
