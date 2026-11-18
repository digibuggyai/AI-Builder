import type { Category, Issue, PartByCategory } from "@pcb/compat";
import { Plus, X } from "lucide-react";
import { CATEGORY_META, formatINR, specChips } from "@/lib/parts";
import { CategoryIcon } from "./CategoryIcon";

type Props = {
  category: Category;
  part?: PartByCategory[Category];
  issues: Issue[];
  onChoose: () => void;
  onRemove: () => void;
  index: number;
};

export function PartSlot({ category, part, issues, onChoose, onRemove, index }: Props) {
  const entrance = { className: "animate-up", style: { ["--delay" as string]: `${index * 40}ms` } };
  const meta = CATEGORY_META[category];

  if (!part) {
    return (
      <li className={entrance.className} style={entrance.style}>
        <button
          type="button"
          onClick={onChoose}
          className="group flex w-full items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/40 p-4 text-left transition hover:border-accent/70 hover:bg-accent/5 sm:p-5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted transition group-hover:text-accent">
            <CategoryIcon category={category} className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{meta.label}</span>
              {!meta.required && <Badge className="bg-surface-2 text-muted">Optional</Badge>}
            </span>
            <span className="mt-0.5 block text-sm text-muted">{meta.hint}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-tint px-3 py-2 text-sm font-semibold text-accent-soft transition group-hover:bg-accent group-hover:text-accent-ink">
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Choose</span>
          </span>
        </button>
      </li>
    );
  }

  const hasError = issues.some((i) => i.level === "error");
  const hasWarning = !hasError && issues.some((i) => i.level === "warning");
  const border = hasError
    ? "border-error/60 shadow-[0_0_0_1px_rgb(251_113_133/0.15)]"
    : hasWarning
      ? "border-warn/50"
      : "border-border";

  return (
    <li
      className={`glass rounded-2xl border p-4 transition-colors sm:p-5 ${border} ${entrance.className}`}
      style={entrance.style}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink">
            <CategoryIcon category={category} className="size-6" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs font-medium tracking-wide text-muted uppercase">{meta.label}</h3>
              {hasError && <Badge className="bg-error/15 text-error">Doesn&apos;t fit</Badge>}
              {hasWarning && <Badge className="bg-warn/15 text-warn">Check this</Badge>}
            </div>
            <p className="mt-1 font-semibold leading-snug">{part.name}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {specChips(category, part).map((chip) => (
                <li key={chip} className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-muted">
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <p className="font-display text-lg font-semibold tabular-nums">{formatINR(part.priceRupees)}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onChoose}
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent-soft"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${meta.noun}`}
              className="rounded-lg p-2 text-muted hover:bg-error/10 hover:text-error"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}
