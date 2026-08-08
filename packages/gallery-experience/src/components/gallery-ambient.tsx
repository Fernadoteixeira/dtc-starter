import React from "react";

export interface GalleryAmbientProps {
  colors?: readonly [string, string, string] | string[];
}

export function GalleryAmbient({ colors }: GalleryAmbientProps) {
  const c1 = colors?.[0] || "rgba(184, 115, 51, 0.25)";
  const c2 = colors?.[1] || "rgba(99, 81, 71, 0.3)";
  const c3 = colors?.[2] || "rgba(212, 175, 55, 0.15)";

  return (
    <div
      className="dtc-gallery__ambient"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse at 20% 40%, ${c1} 0%, transparent 55%),
          radial-gradient(ellipse at 80% 70%, ${c2} 0%, transparent 60%),
          radial-gradient(ellipse at 50% 10%, ${c3} 0%, transparent 50%),
          linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #0d0d0d 100%)
        `,
        transition: "background 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="dtc-gallery__ambient-layer" />
    </div>
  );
}
