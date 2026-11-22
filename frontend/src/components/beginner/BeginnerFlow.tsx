"use client";

import {
  USE_CASE_IDS,
  USE_CASES,
  estimateWattage,
  resolveSelection,
  toSelection,
  type Build,
  type Catalog,
  type Category,
  type Issue,
  type UseCaseId,
} from "@pcb/shared";
import { ArrowLeft, ArrowRight, Check, Link2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BudgetInput } from "@/components/BudgetInput";
import { BuildList } from "@/components/BuildList";
import { BuildStage } from "@/components/stage/BuildStage";
import { UseCasePicker } from "@/components/UseCasePicker";
import { requestRecommendation } from "@/lib/api";
import { formatINR } from "@/lib/parts";
import { BUDGET_MAX, BUDGET_MIN, DEFAULT_BUDGET } from "@/lib/use-cases";

type Step = "use" | "budget" | "result";

type Result =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "none"; reason: string; cheapest: number | null }
  | { status: "ok"; build: Build; issues: Issue[]; total: number };

const clamp = (n: number) => Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(n / 5_000) * 5_000));

function notesFor(build: Build, useCase: UseCaseId): Partial<Record<Category, string>> {
  const label = USE_CASES[useCase].label.toLowerCase();
  const notes: Partial<Record<Category, string>> = {};
  if (build.gpu) notes.gpu = `The fastest graphics card that fit your budget for ${label}.`;
  if (build.cpu) notes.cpu = build.gpu ? "Strong enough to keep up with the graphics card." : "Has graphics built in, so you don't need a graphics card.";
  if (build.ram) notes.ram = `${build.ram.capacityGb} GB is right for ${label}.`;
  if (build.psu) notes.psu = "Leaves room to spare, so it runs cool and quiet.";
  return notes;
}

export function BeginnerFlow({ catalog }: { catalog: Catalog }) {
  const params = useSearchParams();
  const fromUrl = USE_CASE_IDS.find((id) => id === params.get("use")) ?? null;
  const budgetFromUrl = Number(params.get("budget"));

  const [useCase, setUseCase] = useState<UseCaseId | null>(fromUrl);
  const [budget, setBudget] = useState(clamp(budgetFromUrl || (fromUrl ? DEFAULT_BUDGET[fromUrl] : 100_000)));
  const [step, setStep] = useState<Step>(fromUrl && budgetFromUrl ? "result" : "use");
  const [result, setResult] = useState<Result>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  async function run(use: UseCaseId, rupees: number) {
    setStep("result");
    setResult({ status: "loading" });
    window.history.replaceState(null, "", `?use=${use}&budget=${rupees}`);
    try {
      const res = await requestRecommendation(use, rupees);
      if (!res.ok) {
        setResult({ status: "none", reason: res.reason, cheapest: res.cheapestRupees });
        return;
      }
      const { build } = resolveSelection(catalog, res.parts);
      setResult({ status: "ok", build, issues: res.issues, total: res.totalRupees });
    } catch (err) {
      setResult({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  useEffect(() => {
    if (started.current || step !== "result" || !useCase) return;
    started.current = true;
    void run(useCase, budget);
  });

  function restart() {
    setStep("use");
    setResult({ status: "idle" });
    window.history.replaceState(null, "", window.location.pathname);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const stepNumber = step === "use" ? 1 : step === "budget" ? 2 : 3;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="text-sm">
          <span className="font-medium text-accent-text">Beginner</span>
          <span className="text-muted"> · Build it for me</span>
        </p>
        <ol className="flex items-center gap-2 tabular-nums text-xs text-muted" aria-label="Progress">
          {["Use", "Budget", "Your PC"].map((name, i) => (
            <li key={name} className="flex items-center gap-2">
              <span
                className={`grid size-5 place-items-center rounded-full ${
                  i + 1 < stepNumber ? "bg-accent text-accent-ink" : i + 1 === stepNumber ? "border border-accent text-accent-text" : "border border-border"
                }`}
              >
                {i + 1 < stepNumber ? <Check className="size-3" aria-hidden /> : i + 1}
              </span>
              <span className={i + 1 === stepNumber ? "text-foreground" : ""}>{name}</span>
              {i < 2 && <span className="h-px w-5 bg-border" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>

      {step === "use" && (
        <section key="use" className="step-in mx-auto mt-10 max-w-4xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight">What will you mostly <em>use it for?</em></h1>
          <p className="mt-2 text-muted">Pick the closest one. It decides which parts matter most.</p>
          <div className="mt-8">
            <UseCasePicker
              value={useCase}
              onChange={(id) => {
                setUseCase(id);
                setBudget(DEFAULT_BUDGET[id]);
                setStep("budget");
              }}
            />
          </div>
        </section>
      )}

      {step === "budget" && useCase && (
        <section key="budget" className="step-in mx-auto mt-10 max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight">How much do you <em>want to spend?</em></h1>
          <p className="mt-2 text-muted">
            For a {USE_CASES[useCase].label.toLowerCase()} PC. Just the PC: monitor, keyboard and mouse aren&apos;t included.
          </p>
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <BudgetInput value={budget} onChange={setBudget} />
          </div>
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={() => setStep("use")} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden /> Change use
            </button>
            <button type="button" onClick={() => run(useCase, budget)} className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium">
              Build my PC <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </section>
      )}

      {step === "result" && useCase && (
        <section key="result" className="step-in mt-8">
          {result.status === "loading" || result.status === "idle" ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]" aria-busy="true">
              <div>
                <p className="text-muted">
                  Picking parts for a {formatINR(budget)} {USE_CASES[useCase].label.toLowerCase()} PC…
                </p>
                <div className="mt-6 animate-pulse divide-y divide-border rounded-xl border border-border bg-surface">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex gap-5 px-4 py-4">
                      <div className="h-4 w-24 rounded bg-surface-2" />
                      <div className="h-4 flex-1 rounded bg-surface-2" />
                      <div className="h-4 w-20 rounded bg-surface-2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />
            </div>
          ) : result.status === "error" ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
              <h1 className="font-display text-2xl font-semibold">We couldn&apos;t reach the parts server</h1>
              <p className="mt-2 text-muted">{result.message}</p>
              <button type="button" onClick={() => run(useCase, budget)} className="btn-primary mt-6 rounded-xl px-4 py-2 font-medium">
                Try again
              </button>
            </div>
          ) : result.status === "none" ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8">
              <h1 className="font-display text-2xl font-semibold">{formatINR(budget)} isn&apos;t quite enough</h1>
              <p className="mt-2 text-muted">{result.reason}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {result.cheapest != null && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = clamp(Math.ceil(result.cheapest! / 5_000) * 5_000);
                      setBudget(next);
                      void run(useCase, next);
                    }}
                    className="btn-primary rounded-xl px-4 py-2 font-medium"
                  >
                    Try {formatINR(Math.ceil(result.cheapest / 5_000) * 5_000)}
                  </button>
                )}
                <button type="button" onClick={() => setStep("budget")} className="btn-secondary rounded-xl px-4 py-2 font-medium">
                  Change budget
                </button>
              </div>
            </div>
          ) : (
            <BeginnerResult
              build={result.build}
              issues={result.issues}
              total={result.total}
              budget={budget}
              useCase={useCase}
              copied={copied}
              onCopy={copyLink}
              onRestart={restart}
              onChangeBudget={() => setStep("budget")}
            />
          )}
        </section>
      )}
    </div>
  );
}

function BeginnerResult({
  build,
  issues,
  total,
  budget,
  useCase,
  copied,
  onCopy,
  onRestart,
  onChangeBudget,
}: {
  build: Build;
  issues: Issue[];
  total: number;
  budget: number;
  useCase: UseCaseId;
  copied: boolean;
  onCopy: () => void;
  onRestart: () => void;
  onChangeBudget: () => void;
}) {
  const advancedHref = `/advanced?${new URLSearchParams(toSelection(build) as Record<string, string>)}`;
  const wattage = estimateWattage(build);
  const errors = issues.filter((i) => i.level === "error");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="tabular-nums text-sm text-muted">
            {USE_CASES[useCase].label} · budget {formatINR(budget)}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Your PC comes to <span className="tabular-nums">{formatINR(total)}</span>
          </h1>
          <p className="mt-2 text-ok">{formatINR(budget - total)} under budget</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={advancedHref} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium">
            Customize in Advanced <ArrowRight className="size-4" aria-hidden />
          </Link>
          <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 btn-secondary rounded-xl px-4 py-2.5 font-medium">
            <Link2 className="size-4" aria-hidden /> {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <BuildList build={build} issues={issues} notes={notesFor(build, useCase)} />
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <BuildStage build={build} issues={issues} />
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <p className={errors.length > 0 ? "text-error" : "text-ok"}>
              {errors.length > 0 ? `${errors.length} part${errors.length === 1 ? "" : "s"} need attention` : "✓ Every part fits together"}
            </p>
            <p className="mt-2 text-muted">
              Power: about <span className="tabular-nums text-foreground">{wattage} W</span> of{" "}
              <span className="tabular-nums text-foreground">{build.psu?.wattage ?? "?"} W</span>
            </p>
          </div>
          <div className="flex gap-4 px-1 text-sm">
            <button type="button" onClick={onChangeBudget} className="text-muted hover:text-foreground">
              Change budget
            </button>
            <button type="button" onClick={onRestart} className="inline-flex items-center gap-1 text-muted hover:text-foreground">
              <RotateCcw className="size-3.5" aria-hidden /> Start over
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
