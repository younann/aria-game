import React from "react";

const SIZES = {
  sm: 14,
  md: 20,
  lg: 28,
};

export default function StarRating({ stars = 0, maxStars = 3, size = "md" }) {
  const px = SIZES[size] || SIZES.md;

  return (
    <span style={{ display: "inline-flex", gap: `${Math.round(px * 0.15)}px` }}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < stars;
        return (
          <span
            key={i}
            style={{
              fontSize: `${px}px`,
              lineHeight: 1,
              color: filled ? "#fbbf24" : "#334155",
              textShadow: filled
                ? "0 0 6px rgba(251,191,36,0.6), 0 0 12px rgba(251,191,36,0.3)"
                : "none",
            }}
          >
            {filled ? "\u2605" : "\u2606"}
          </span>
        );
      })}
    </span>
  );
}
