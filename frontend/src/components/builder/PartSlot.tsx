import type { Category, Issue, PartByCategory } from "@pcb/shared";
import { ArrowUpRight, X } from "lucide-react";
import { CATEGORY_META, formatINR, specChips } from "@/lib/parts";

type Props = {
  category: Category;
  part?: PartByCategory[Category];
  available: number;
  issues: Issue[];
  onChoose: () => void;
  onRemove: () => void;
};

export function PartSlot({ category, part, available, issues, onChoose, onRemove }: Props) {
  const meta = CATEGORY_META[category];
  const hasError = issues.some((i) => i.level === "error");
  const hasWarning = !hasError && issues.some((i) => i.level === "warning");
  const edge = hasError ? "before:bg-error" : hasWarning ? "before:bg-warn" : "before:bg-transparent";

  return (
    <li
      className={`relative grid gap-x-5 gap-y-2 px-4 py-3.5 before:absolute before:inset-y-0 before:left-0 before:w-[3px] sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center ${edge}`}
    >
      <div>
        <p className="text-sm font-medium">{meta.label}</p>
        {hasError && <p className="text-xs text-error">Doesn&apos;t fit</p>}
        {hasWarning && <p className="text-xs text-warn">See notes</p>}
        {!part && !meta.required && <p className="text-xs text-muted">Optional</p>}
      </div>

      {part ? (
        <div className="min-w-0">
          <p className="leading-snug font-medium">{part.name}</p>
          <p className="mt-1 font-mono text-xs text-muted">{specChips(category, part).join("  ·  ")}</p>
        </div>
      ) : (
        <p className="text-sm text-muted">{available === 0 ? "No parts listed yet." : meta.hint}</p>
      )}

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {part ? (
          <>
            <div className="text-right">
              <p className="font-mono text-sm font-medium tabular-nums">{formatINR(part.priceRupees)}</p>
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
            <div className="flex items-center">
              <button
                type="button"
                onClick={onChoose}
                className="rounded-md px-2 py-1 text-sm text-accent-text hover:bg-surface-2"
              >
                Change
              </button>
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${meta.noun}`}
                className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-error"
              >
                <X className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onChoose}
            disabled={available === 0}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add {meta.noun}
          </button>
        )}
      </div>
    </li>
  );
}
