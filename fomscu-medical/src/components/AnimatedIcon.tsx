import React from "react";
import { getSiteSettings } from "../utils/storage";

const IMAGE_MAP: Record<string, string> = {
  anatomy: "/assets/illustrations/anatomy.svg",
  genetics: "/assets/illustrations/genetics.svg",
  biochemistry: "/assets/illustrations/biochemistry.svg",
  histology: "/assets/illustrations/histology.svg",
  physiology: "/assets/illustrations/physiology.svg",
  skull: "/assets/illustrations/skull.svg",
  "medical-hub": "/assets/illustrations/medical-hub.svg",
};
const EMOJI_MAP: Record<string, string> = {
  anatomy: "🫀",
  genetics: "🧬",
  biochemistry: "🧪",
  histology: "🔬",
  physiology: "🫁",
  skull: "💀",
  "medical-hub": "🏥",
  default: "📚",
};
export default function AnimatedIcon({ name, id, size = 36 }: { name?: string; id?: string; size?: number }) {
  const settings = getSiteSettings();

  // 1) check for explicit uploaded icon by id (prefer precise overrides)
  if (id && settings.icons && (settings.icons as Record<string, string>)[id]) {
    const src = (settings.icons as Record<string, string>)[id];
    return (
      <span className="illustration-wrap icon-animated" style={{ width: size, height: size }} aria-hidden>
        <img src={src} alt={id} style={{ width: size, height: size, borderRadius: 10 }} />
      </span>
    );
  }

  const n = (name || "").toLowerCase();

  // 2) check global icons mapping by name
  if (settings.icons) {
    for (const key of Object.keys(settings.icons)) {
      if (key.toLowerCase() === n || n.includes(key.toLowerCase())) {
        const src = (settings.icons as Record<string, string>)[key];
        if (src) {
          return (
            <span className="illustration-wrap icon-animated" style={{ width: size, height: size }} aria-hidden>
              <img src={src} alt={key} style={{ width: size, height: size, borderRadius: 10 }} />
            </span>
          );
        }
      }
    }
  }

  // 3) Prefer subject illustrations when available in the bundled map
  // 3) Prefer emoji for known medical topics (friendlier visual)
  const emojiKey = Object.keys(EMOJI_MAP).find((k) => n.includes(k));
  if (emojiKey) {
    const emoji = EMOJI_MAP[emojiKey] || EMOJI_MAP.default;
    return (
      <span
        className="icon-wrap icon-emoji icon-animated"
        aria-hidden
        style={{ width: size, height: size, fontSize: Math.round(size * 0.9), display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        {emoji}
      </span>
    );
  }

  // 4) Fall back to bundled illustrations when no emoji mapping found
  for (const key of Object.keys(IMAGE_MAP)) {
    if (n.includes(key)) {
      return (
        <span className="illustration-wrap icon-animated" style={{ width: size, height: size }} aria-hidden>
          <img src={IMAGE_MAP[key]} alt={key} style={{ width: size, height: size, borderRadius: 10 }} />
        </span>
      );
    }
  }

  // 5) Final fallback: default emoji
  const defaultEmoji = EMOJI_MAP.default;
  return (
    <span
      className="icon-wrap icon-emoji icon-animated"
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.9), display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      {defaultEmoji}
    </span>
  );
}
