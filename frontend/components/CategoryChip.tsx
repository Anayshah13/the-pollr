import type { Category } from "@/lib/types";

const map: Record<Category, string> = {
  "Student Chapters": "SC",
  "Tech Committees": "TC",
  Clubs: "CL",
  "SAE Teams": "SAE",
  "IETE Teams": "IETE",
};

export function CategoryChip({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center border border-ink-600 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink-200">
      <span className="mr-1.5 inline-block h-1 w-1 bg-lime" />
      {map[category]}
    </span>
  );
}
