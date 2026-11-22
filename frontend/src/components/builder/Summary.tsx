"use client";

import { CATEGORIES, type Build, type Issue } from "@pcb/shared";
import { useState } from "react";
import { BuildStage } from "@/components/stage/BuildStage";
import { CATEGORY_META, formatINR } from "@/lib/parts";

type Props = {
  build: Build;
  issues: Issue[];
  total: number;
  wattage: number;
  chosen: number;
  onReset: () => void;
};

export function Summary({ build, issues, total, wattage, chosen, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const psu = build.psu;
  const load = psu ? Math.round((wattage / psu.wattage) * 100) : null;
  const barColour = load == null ? "" : load >= 100 ? "bg-error" : load > 77 ? "bg-warn" : "bg-ok";

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <aside id="summary" className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <BuildStage build={build} issues={issues} />
      <div className="rounded-lg border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Summary</h2>

        <div className="px-4 py-3">
          {chosen === 0 ? (
            <p className="text-sm text-muted">Nothing added yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {CATEGORIES.filter((c) => build[c]).map((c) => (
                <li key={c} className="flex items-baseline justify-between gap-3">
                  <span className="text-muted">{CATEGORY_META[c].short}</span>
                  <span className="font-mono tabular-nums">{formatINR(build[c]!.priceRupees)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm font-medium">Total</span>
            <span className="font-mono text-xl font-medium tabular-nums">{formatINR(total)}</span>
          </div>
        </div>

        <section className="border-t border-border px-4 py-3" aria-live="polite">
          <h3 className="text-sm font-semibold">Compatibility</h3>
          {chosen < 2 && issues.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">Add two or more parts to check them against each other.</p>
          ) : issues.length === 0 ? (
            <p className="mt-1.5 text-sm text-ok">✓ No problems found.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {errors.map((i) => (
                <li key={i.code} className="flex gap-2">
                  <span className="font-mono text-error">✗</span>
                  <span>{i.message}</span>
                </li>
              ))}
              {warnings.map((i) => (
                <li key={i.code} className="flex gap-2 text-muted">
                  <span className="font-mono text-warn">!</span>
                  <span>{i.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-border px-4 py-3">
          <div className="flex items-baseline justify-between text-sm">
            <h3 className="font-semibold">Power</h3>
            <span className="font-mono text-muted tabular-nums">
              {wattage} W{psu ? ` / ${psu.wattage} W` : ""}
            </span>
          </div>
          {load != null ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className={`h-full ${barColour}`} style={{ width: `${Math.min(load, 100)}%` }} />
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted">Add a power supply to compare.</p>
          )}
          {wattage > 0 && <p className="mt-1.5 text-xs text-muted">Estimated draw with the CPU boosting and the GPU at full load.</p>}
        </section>

        <div className="flex gap-2 border-t border-border p-3">
          <button
            type="button"
            onClick={share}
            disabled={chosen === 0}
            className="btn-primary flex-1 rounded-xl px-3 py-2 text-sm font-medium"
          >
            {copied ? "Link copied" : "Copy share link"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={chosen === 0}
            className="btn-secondary rounded-xl px-3 py-2 text-sm font-medium hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
      <p className="mt-2 px-1 text-xs text-muted">Prices change often. Check the store page before you pay.</p>
    </aside>
  );
}
