import React from "react";

/**
 * Single source of truth for the Voyara brand mark.
 * One visual identity used across Navbar (guest + sidebar) and AuthView.
 *
 * Variants:
 *  - size="sm" (default): nav/sidebar usage
 *  - size="lg":           hero/auth usage
 *
 *  withWordmark   shows "Voyara" wordmark next to the glyph
 *  tagline        small uppercase label under the wordmark
 */
export default function BrandMark({
  size = "sm",
  withWordmark = true,
  tagline,
  className = "",
}) {
  const isLarge = size === "lg";

  const glyphBox = isLarge
    ? "h-12 w-12 rounded-2xl"
    : "h-9 w-9 rounded-xl";
  const glyphText = isLarge ? "text-xl" : "text-lg";
  const wordmarkText = isLarge ? "text-2xl" : "text-xl";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${glyphBox} bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20`}
      >
        <span className={`font-mono font-extrabold text-white ${glyphText} tracking-tight`}>
          V
        </span>
      </div>
      {withWordmark && (
        <div className="leading-tight">
          <span
            className={`${wordmarkText} font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent font-sans block`}
          >
            Voyara
          </span>
          {tagline && (
            <span className="text-[9px] font-mono tracking-widest text-indigo-400/80 uppercase block font-bold">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
