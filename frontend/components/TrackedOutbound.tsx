"use client";

import type { ReactNode } from "react";
import { trackOutboundClick } from "@/lib/analytics";

export function TrackedOutbound({
  href,
  committeeId,
  destination,
  className,
  children,
}: {
  href: string;
  committeeId: string;
  destination: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        trackOutboundClick({
          committeeId,
          destination,
          url: href,
        })
      }
    >
      {children}
    </a>
  );
}
