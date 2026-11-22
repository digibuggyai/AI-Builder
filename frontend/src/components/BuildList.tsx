import { CATEGORIES, type Build, type Category, type Issue } from "@pcb/shared";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_META, formatINR, specChips } from "@/lib/parts";

type Props = {
  build: Build;
  issues?: Issue[];
  notes?: Partial<Record<Category, string>>;
};

export function BuildList({ build, issues = [], notes = {} }: Props) {
  const categories = CATEGORIES.filter((c) => build[c]);

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {categories.map((category) => {
        const part = build[category]!;
        const problem = issues.find((i) => i.level === "error" && i.parts.includes(category));
        return (
          <li key={category} className="grid gap-x-5 gap-y-1 px-4 py-3.5 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-start">
            <p className="text-sm text-muted">{CATEGORY_META[category].label}</p>
            <div className="min-w-0">
              <p className="leading-snug font-medium">{part.name}</p>
              <p className="mt-1 tabular-nums text-xs text-muted">{specChips(category, part).join("  ·  ")}</p>
              {notes[category] && <p className="mt-1.5 text-sm text-accent-text">{notes[category]}</p>}
              {problem && <p className="mt-1.5 text-sm text-error">{problem.message}</p>}
            </div>
            <div className="text-left sm:text-right">
              <p className="tabular-nums text-sm font-medium ">{formatINR(part.priceRupees)}</p>
              {part.buyUrl && (
                <a
                  href={part.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-xs text-muted hover:text-accent-text"
                >
                  View at store <ArrowUpRight className="size-3" aria-hidden />
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
