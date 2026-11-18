"use client";

import { CATEGORIES, type Build, type Issue } from "@pcb/compat";
import { CircleCheck, Info, Link2, RotateCcw, TriangleAlert, Zap } from "lucide-react";
import { useState } from "react";
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

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  }

  return (
    <aside id="summary" className="animate-up space-y-4 [--delay:150ms] lg:sticky lg:top-6 lg:self-start">
      <section className="glass rounded-2xl border border-border p-5">
        <h2 className="font-semibold">Your build</h2>

        {chosen > 0 ? (
          <ul className="mt-3 space-y-2 border-b border-border pb-4">
            {CATEGORIES.filter((c) => build[c]).map((c) => {
              const part = build[c]!;
              return (
                <li key={c} className="flex items-baseline gap-3 text-sm">
                  <span className="w-20 shrink-0 text-xs text-muted">{CATEGORY_META[c].noun}</span>
                  <span className="min-w-0 flex-1 truncate" title={part.name}>{part.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">{formatINR(part.priceRupees)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-1 border-b border-border pb-4 text-sm text-muted">No parts yet.</p>
        )}

        <p className="mt-4 text-sm text-muted">Estimated total</p>
        <p className="font-display text-brand mt-1 text-4xl font-bold tracking-tight tabular-nums">{formatINR(total)}</p>
        <p className="mt-1 text-sm text-muted">
          {chosen} {chosen === 1 ? "part" : "parts"} · prices may change
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={share}
            disabled={chosen === 0}
            className="flex items-center justify-center gap-1.5 rounded-full btn-primary px-3 py-2.5 text-sm font-semibold"
          >
            <Link2 className="size-4" aria-hidden /> {copied ? "Link copied!" : "Share build"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={chosen === 0}
            className="flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2.5 text-sm font-medium hover:border-error hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-4" aria-hidden /> Start over
          </button>
        </div>
      </section>

      <StatusCard issues={issues} chosen={chosen} />
      <PowerCard build={build} wattage={wattage} />
    </aside>
  );
}

function StatusCard({ issues, chosen }: { issues: Issue[]; chosen: number }) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  if (chosen === 0) {
    return (
      <Card tone="neutral" icon={<Info className="size-5" />} title="Pick your first part">
        Start with the CPU. We&apos;ll check every part against it.
      </Card>
    );
  }
  if (errors.length > 0) {
    return (
      <Card
        tone="error"
        icon={<TriangleAlert className="size-5" />}
        title={`${errors.length} ${errors.length === 1 ? "problem" : "problems"} to fix`}
      >
        <IssueList issues={errors} className="text-foreground" />
        {warnings.length > 0 && <IssueList issues={warnings} className="mt-3 text-warn" />}
      </Card>
    );
  }
  if (warnings.length > 0) {
    return (
      <Card tone="warn" icon={<TriangleAlert className="size-5" />} title="Works, with notes">
        <IssueList issues={warnings} className="text-foreground" />
      </Card>
    );
  }
  return (
    <Card tone="ok" icon={<CircleCheck className="size-5" />} title="Everything fits">
      All {chosen} parts work together.
    </Card>
  );
}

function PowerCard({ build, wattage }: { build: Build; wattage: number }) {
  const psu = build.psu;
  const percent = psu ? Math.min(100, Math.round((wattage / psu.wattage) * 100)) : 0;
  const barColour = percent >= 100 ? "bg-error" : percent > 77 ? "bg-warn" : "bg-ok";

  return (
    <section className="glass rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-accent" aria-hidden />
        <h2 className="font-semibold">Power</h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        About <span className="font-semibold text-foreground">{wattage} W</span> under load
        {psu && (
          <>
            {" "}
            of <span className="font-semibold text-foreground">{psu.wattage} W</span>
          </>
        )}
      </p>
      {psu ? (
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"
          role="meter"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Power supply load"
        >
          <div className={`h-full rounded-full transition-all ${barColour}`} style={{ width: `${percent}%` }} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">Add a power supply to see how much room is left.</p>
      )}
    </section>
  );
}

const tones = {
  neutral: "border-border text-muted",
  ok: "border-ok/40 text-ok",
  warn: "border-warn/40 text-warn",
  error: "border-error/50 text-error",
};

function Card({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof tones;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`glass rounded-2xl border p-5 ${tones[tone]}`} aria-live="polite">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-2 text-sm text-muted">{children}</div>
    </section>
  );
}

function IssueList({ issues, className }: { issues: Issue[]; className?: string }) {
  return (
    <ul className={`space-y-2 ${className ?? ""}`}>
      {issues.map((i) => (
        <li key={i.code} className="flex gap-2">
          <span aria-hidden>•</span>
          <span>{i.message}</span>
        </li>
      ))}
    </ul>
  );
}
