// src/features/calls/components/SubtitlesOverlay.jsx
import React from "react";

/**
 * Overlay de subtítulos flotante sobre el video.
 *
 * Props:
 *   interimText → string — texto parcial mientras habla (tenue)
 *   finalText   → string — último texto confirmado (dorado)
 *   isListening → boolean — si el micrófono está activo
 *   theme       → 'dark' | 'light'
 */
export default function SubtitlesOverlay({
  interimText = "",
  finalText   = "",
  isListening = false,
  theme       = "dark",
}) {
  const text = interimText || finalText;
  if (!text) return null;

  const isInterim = !!interimText;

  const bgStyle = theme === "dark"
    ? "bg-[#1a1826]/70 border border-[#c9a84c]/20"
    : "bg-[#fdf6f0]/70 border border-[#c4607a]/20";

  const textStyle = isInterim
    ? "text-white/50"
    : theme === "dark"
      ? "text-[#c9a84c]"
      : "text-[#c4607a]";

  return (
    <div
      className={`
        absolute bottom-36 left-1/2 -translate-x-1/2
        px-4 py-2 rounded-xl text-center text-sm max-w-[80%]
        backdrop-blur-sm transition-opacity duration-300
        ${bgStyle}
      `}
    >
      <p className={`${textStyle} leading-snug m-0`}>
        {text}
      </p>

      {/* Puntitos animados cuando está escuchando en interim */}
      {isListening && isInterim && (
        <div className="flex justify-center gap-1 mt-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1 h-1 rounded-full bg-white/30 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}