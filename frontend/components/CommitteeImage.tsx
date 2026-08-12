interface Props {
  slug: string;
  name: string;
  className?: string;
}

export function CommitteeImage({ slug, name, className = "" }: Props) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-ink-800 ${className}`}
    >
      <img
        src={`/committee_imgs/${slug}.jpg`}
        alt={name}
        className="block h-full w-full rounded-full object-cover [transform:translateZ(0)] scale-[1.1]"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
