"use client";

import { formatINR } from "@/lib/parts";
import { BUDGET_MAX, BUDGET_MIN, BUDGET_PRESETS } from "@/lib/use-cases";

export function BudgetInput({ value, onChange }: { value: number; onChange: (rupees: number) => void }) {
  return (
    <div>
      <label htmlFor="budget" className="sr-only">
        Budget in rupees
      </label>
      <p className="font-display text-6xl font-light tracking-[-0.03em] tabular-nums sm:text-7xl">{formatINR(value)}</p>
      <input
        id="budget"
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={5_000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-6 w-full accent-accent"
      />
      <div className="mt-1 flex justify-between font-mono text-xs text-muted">
        <span>{formatINR(BUDGET_MIN)}</span>
        <span>{formatINR(BUDGET_MAX)}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {BUDGET_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full border px-3 py-1 font-mono text-sm transition-colors ${
              value === preset ? "border-accent bg-accent-tint text-accent-text" : "border-border hover:border-border-strong"
            }`}
          >
            {formatINR(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
