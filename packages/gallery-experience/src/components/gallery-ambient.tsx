import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GalleryAmbient({ colors }: { colors: string[] }) {
  if (!colors || colors.length < 3) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={colors.join(",")}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 18% 42%, ${colors[0]}42 0%, transparent 42%),
            radial-gradient(ellipse at 83% 78%, ${colors[1]}35 0%, transparent 45%),
            radial-gradient(ellipse at 50% 5%, ${colors[2]}24 0%, transparent 45%),
            linear-gradient(120deg, #1f1d1b 0%, #0d0c0b 48%, #050404 100%)
          `,
        }}
      />
    </AnimatePresence>
  );
}
