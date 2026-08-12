"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackCtaClick } from "@/lib/analytics";

export function TrackedLink({
  href,
  id,
  label,
  location,
  className,
  children,
}: {
  href: string;
  id: string;
  label: string;
  location: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackCtaClick({
          id,
          label,
          href,
          location,
        })
      }
    >
      {children}
    </Link>
  );
}
