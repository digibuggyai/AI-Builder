"use client";

import { Check } from "lucide-react";
import { USE_CASES, type UseCaseId } from "@pcb/shared";
import { GlassBlobs } from "@/components/GlassBlobs";
import { USE_CASE_ICONS } from "@/lib/use-cases";

type Props = {
  value: UseCaseId | null;
  onChange: (id: UseCaseId) => void;
  compact?: boolean;
};

const GROUPS: { label: string; ids: UseCaseId[] }[] = [
  { label: "Gaming", ids: ["esports", "gaming-1080p", "gaming-1440p", "gaming-4k", "streaming"] },
  { label: "Work and create", ids: ["video-editing", "3d-design", "ai-ml", "coding", "office"] },
];

export function UseCasePicker({ value, onChange, compact }: Props) {
  return (
    <div role="radiogroup" aria-label="What will you use it for?" className="space-y-7">
      {GROUPS.map((group, g) => (
        <section key={group.label}>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-xs font-semibold tracking-[0.14em] text-dim uppercase">{group.label}</h3>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
            {group.ids.map((id, i) => {
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
                  className={`group relative isolate flex overflow-hidden rounded-2xl glass glow border text-left transition-[border-color,transform] duration-200 hover:-translate-y-0.5 ${
                    compact ? "flex-col items-center gap-2.5 px-3 py-4 text-center" : "items-start gap-3 p-4 lg:flex-col lg:gap-4 lg:p-5"
                  } ${selected ? "border-accent" : "hover:border-accent/50"}`}
                >
                  {selected && <GlassBlobs variant={(g * 5 + i) % 3} />}
                  {selected && (
                    <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-accent text-accent-ink">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                  )}
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${
                      selected ? "bg-accent text-accent-ink" : "bg-accent-tint text-accent-text"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className={`block leading-snug font-semibold ${compact ? "text-sm" : ""}`}>{useCase.label}</span>
                    {!compact && <span className="mt-1 block text-sm leading-snug text-muted">{useCase.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
