import React from "react";
import LogoIcon from "../shared/LogoIcon";
import { SUGGESTIONS } from "../shared/global";

const EmptyState = ({ handleSuggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-strong bg-surface-primary">
        <LogoIcon size={22} color="var(--color-text-primary)" />
      </div>
      <div>
        <p className="mb-1 text-lg font-medium text-text-primary">
          What do you want to research?
        </p>
        <p className="max-w-xs text-[13px] leading-relaxed text-text-secondary">
          Ask anything — I'll search the web and give you source-backed answers.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            className="cursor-pointer rounded-full border border-border-default bg-surface-primary px-4 py-2 text-[12px] text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EmptyState);
