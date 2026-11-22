"use client";

import { USE_CASE_IDS, USE_CASES, type UseCaseId } from "@pcb/shared";
import { USE_CASE_ICONS } from "@/lib/use-cases";

type Props = {
  value: UseCaseId | null;
  onChange: (id: UseCaseId) => void;
  compact?: boolean;
};

export function UseCasePicker({ value, onChange, compact }: Props) {
  return (
    <div role="radiogroup" aria-label="What will you use it for?" className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {USE_CASE_IDS.map((id) => {
        const useCase = USE_CASES[id];
        const Icon = USE_CASE_ICONS[id];
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
              selected ? "border-accent bg-accent-tint" : "border-border bg-surface hover:border-border-strong"
            }`}
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-lg ${
                selected ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted group-hover:text-foreground"
              }`}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block font-medium">{useCase.label}</span>
              {!compact && <span className="mt-0.5 block text-sm text-muted">{useCase.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
