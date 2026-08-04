import React from "react";
import LogoIcon from "../shared/LogoIcon";
import { SUGGESTIONS } from "../shared/global";

const EmptyState = ({ handleSuggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-500/12 border border-blue-500/20 flex items-center justify-center">
        <LogoIcon size={22} />
      </div>
      <div>
        <p className="text-lg font-medium text-white mb-1">
          What do you want to research?
        </p>
        <p className="text-[13px] text-white/30 max-w-xs leading-relaxed">
          Ask anything — I'll search the web and give you source-backed answers.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            className="px-4 py-2 rounded-full border border-white/10 bg-white/4 text-[12px] text-white/50 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/8 transition-all duration-150 cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EmptyState);
