interface Props {
  slug: string;
  name: string;
  className?: string;
  /** "round" or "square" */
  shape?: "round" | "square";
}

export function CommitteeImage({ slug, name, className = "", shape = "square" }: Props) {
  return (
    <span
      className={`relative inline-block overflow-hidden bg-ink-800 ${
        shape === "round" ? "rounded-full" : ""
      } ${className}`}
    >
      <img
        src={`/committee_imgs/${slug}.jpg`}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink-100/8" />
    </span>
  );
}
