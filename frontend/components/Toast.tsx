"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface Props {
  show: boolean;
  message: string;
  caption?: string;
}

export function Toast({ show, message, caption }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 border border-lime bg-ink-900/95 px-5 py-3 shadow-[0_8px_40px_rgba(212,255,58,0.18)] backdrop-blur">
            <span className="flex h-7 w-7 items-center justify-center bg-lime text-ink-950">
              <Check size={14} strokeWidth={3} />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-lime">
                {message}
              </p>
              {caption && (
                <p className="mt-0.5 italic-display text-sm text-ink-200">
                  {caption}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
