"use client";

import {
  USE_CASES,
  checkBuild,
  resolveSelection,
  totalRupees,
  type Catalog,
  type Category,
  type PartByCategory,
  type Selection,
  type Suggestions,
  type UseCaseId,
} from "@pcb/shared";
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BudgetInput } from "@/components/BudgetInput";
import { BuildList } from "@/components/BuildList";
import { BuildStage } from "@/components/stage/BuildStage";
import { UseCasePicker } from "@/components/UseCasePicker";
import { requestSuggestions } from "@/lib/api";
import { CATEGORY_META, formatINR, specChips } from "@/lib/parts";

const PART_STEPS = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "cooler", "case"] as const;
type PartStep = (typeof PART_STEPS)[number];
type Step = "setup" | PartStep | "review";
const STEPS: Step[] = ["setup", ...PART_STEPS, "review"];

type Loaded =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; data: Suggestions };

const stepLabel = (step: Step) => (step === "setup" ? "Use and budget" : step === "review" ? "Review" : CATEGORY_META[step].label);

export function ProWizard({ catalog }: { catalog: Catalog }) {
  const [useCase, setUseCase] = useState<UseCaseId>("gaming-1080p");
  const [budget, setBudget] = useState(100_000);
  const [selection, setSelection] = useState<Selection>({});
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });

  const step = STEPS[index]!;
  const { build } = useMemo(() => resolveSelection(catalog, selection), [catalog, selection]);
  const issues = useMemo(() => checkBuild(build), [build]);
  const spent = totalRupees(build);
  const selectionKey = JSON.stringify(selection);

  useEffect(() => {
    if (step === "setup" || step === "review") return;
    let cancelled = false;
    setLoaded({ status: "loading" });
    requestSuggestions(step, useCase, budget, JSON.parse(selectionKey) as Selection)
      .then((data) => !cancelled && setLoaded({ status: "ok", data }))
      .catch((err) => !cancelled && setLoaded({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." }));
    return () => {
      cancelled = true;
    };
  }, [step, useCase, budget, selectionKey]);

  const go = (i: number) => {
    setIndex(Math.max(0, Math.min(STEPS.length - 1, i)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const choose = (category: Category, slug: string) => setSelection((s) => ({ ...s, [category]: slug }));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="text-sm">
          <span className="font-medium text-accent-text">Pro</span>
          <span className="text-muted"> · Guided build</span>
        </p>
        <p className="font-mono text-xs text-muted">
          Step {index + 1} of {STEPS.length}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)_320px]">
        <nav aria-label="Steps" className="lg:sticky lg:top-20 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {STEPS.map((s, i) => {
              const done = s === "setup" ? index > 0 : s === "review" ? false : Boolean(selection[s]);
              const current = i === index;
              return (
                <li key={s} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    disabled={i > 0 && index === 0}
                    aria-current={current ? "step" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors disabled:opacity-40 ${
                      current ? "bg-surface-2 font-medium" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px] ${
                        done ? "bg-accent text-accent-ink" : current ? "border border-accent text-accent-text" : "border border-border"
                      }`}
                    >
                      {done ? <Check className="size-3" aria-hidden /> : i + 1}
                    </span>
                    <span className="whitespace-nowrap">{stepLabel(s)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section key={step} className="step-in min-w-0">
          {step === "setup" && (
            <SetupStep useCase={useCase} budget={budget} onUseCase={setUseCase} onBudget={setBudget} onNext={() => go(1)} />
          )}
          {step !== "setup" && step !== "review" && (
            <PartStepView
              step={step}
              catalog={catalog}
              loaded={loaded}
              selected={selection[step]}
              useCase={useCase}
              budget={budget}
              onChoose={(slug) => choose(step, slug)}
              onBack={() => go(index - 1)}
              onNext={() => go(index + 1)}
            />
          )}
          {step === "review" && (
            <ReviewStep build={build} issues={issues} spent={spent} budget={budget} selection={selection} onBack={() => go(index - 1)} />
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <BuildStage build={build} issues={issues} />
          <BudgetPanel budget={budget} spent={spent} useCase={useCase} selection={selection} catalog={catalog} onJump={(c) => go(STEPS.indexOf(c))} />
        </aside>
      </div>
    </div>
  );
}

function SetupStep({
  useCase,
  budget,
  onUseCase,
  onBudget,
  onNext,
}: {
  useCase: UseCaseId;
  budget: number;
  onUseCase: (id: UseCaseId) => void;
  onBudget: (n: number) => void;
  onNext: () => void;
}) {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">What are you <em>building for?</em></h1>
      <p className="mt-2 text-muted">This sets the minimum specs and how the budget is split between parts.</p>
      <div className="mt-6">
        <UseCasePicker value={useCase} onChange={onUseCase} compact />
      </div>
      <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Budget for the PC</h2>
      <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
        <BudgetInput value={budget} onChange={onBudget} />
      </div>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium">
          Start with the processor <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </>
  );
}

function PartStepView({
  step,
  catalog,
  loaded,
  selected,
  useCase,
  budget,
  onChoose,
  onBack,
  onNext,
}: {
  step: PartStep;
  catalog: Catalog;
  loaded: Loaded;
  selected: string | undefined;
  useCase: UseCaseId;
  budget: number;
  onChoose: (slug: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const meta = CATEGORY_META[step];
  const bySlug = useMemo(
    () => new Map((catalog[step] as PartByCategory[PartStep][]).map((p) => [p.slug, p])),
    [catalog, step],
  );
  const target = USE_CASES[useCase].split[step] * budget;

  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Choose a <em>{meta.noun}.</em></h1>
      <p className="mt-2 text-muted">{meta.hint}</p>
      <p className="mt-3 font-mono text-sm text-muted">
        Suggested spend: <span className="text-foreground">about {formatINR(Math.round(target / 500) * 500)}</span>
      </p>

      <div className="mt-6">
        {loaded.status === "loading" && (
          <div className="animate-pulse space-y-3">
            <div className="h-36 rounded-2xl border border-border bg-surface" />
            <div className="h-48 rounded-2xl border border-border bg-surface" />
          </div>
        )}
        {loaded.status === "error" && (
          <div className="rounded-2xl border border-border bg-surface p-6 text-sm">
            <p className="font-medium">Couldn&apos;t load suggestions.</p>
            <p className="mt-1 text-muted">{loaded.message}</p>
          </div>
        )}
        {loaded.status === "ok" && loaded.data.category === step && (
          <Options data={loaded.data} bySlug={bySlug} step={step} selected={selected} useCase={useCase} onChoose={onChoose} />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium"
        >
          Continue <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </>
  );
}

function Options({
  data,
  bySlug,
  step,
  selected,
  useCase,
  onChoose,
}: {
  data: Suggestions;
  bySlug: Map<string, PartByCategory[PartStep]>;
  step: PartStep;
  selected: string | undefined;
  useCase: UseCaseId;
  onChoose: (slug: string) => void;
}) {
  const pick = data.recommendedSlug ? bySlug.get(data.recommendedSlug) : undefined;
  const rest = data.options.filter((o) => o.slug !== data.recommendedSlug);
  const good = rest.filter((o) => o.fits && o.meetsNeeds);
  const weak = rest.filter((o) => o.fits && !o.meetsNeeds);
  const blocked = rest.filter((o) => !o.fits);

  if (data.options.length === 0) {
    return <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No parts listed in this category yet.</p>;
  }

  return (
    <div className="space-y-6">
      {pick && (
        <div className={`rounded-2xl border-2 p-5 ${selected === pick.slug ? "border-accent bg-accent-tint" : "border-accent/60 bg-surface"}`}>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-text">
            <Star className="size-3.5 fill-current" aria-hidden /> Our pick
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-lg leading-snug font-semibold">{pick.name}</p>
              <p className="mt-1 font-mono text-xs text-muted">{specChips(step, pick).join("  ·  ")}</p>
              {data.reason && <p className="mt-3 text-sm">{data.reason}</p>}
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-medium tabular-nums">{formatINR(pick.priceRupees)}</p>
              <button
                type="button"
                onClick={() => onChoose(pick.slug)}
                className={`mt-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                  selected === pick.slug ? "bg-accent text-accent-ink" : "btn-primary"
                }`}
              >
                {selected === pick.slug ? "Selected ✓" : "Use our pick"}
              </button>
            </div>
          </div>
        </div>
      )}

      {good.length > 0 && (
        <OptionGroup title="Other parts that fit" items={good} bySlug={bySlug} step={step} selected={selected} onChoose={onChoose} />
      )}
      {weak.length > 0 && (
        <OptionGroup
          title={`Fit, but below what we suggest for ${USE_CASES[useCase].label.toLowerCase()}`}
          items={weak}
          bySlug={bySlug}
          step={step}
          selected={selected}
          onChoose={onChoose}
        />
      )}
      {blocked.length > 0 && (
        <details className="group rounded-2xl border border-border bg-surface">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm text-muted">
            {blocked.length} part{blocked.length === 1 ? "" : "s"} won&apos;t fit with what you&apos;ve picked{" "}
            <span className="text-accent-text group-open:hidden">Show</span>
          </summary>
          <ul className="divide-y divide-border border-t border-border">
            {blocked.map((o) => {
              const part = bySlug.get(o.slug);
              if (!part) return null;
              return (
                <li key={o.slug} className="px-4 py-3 text-sm">
                  <p className="text-muted">{part.name}</p>
                  <p className="mt-0.5 text-xs text-error">{o.problems[0]?.message}</p>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}

function OptionGroup({
  title,
  items,
  bySlug,
  step,
  selected,
  onChoose,
}: {
  title: string;
  items: Suggestions["options"];
  bySlug: Map<string, PartByCategory[PartStep]>;
  step: PartStep;
  selected: string | undefined;
  onChoose: (slug: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-medium text-muted">{title}</h2>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((o) => {
          const part = bySlug.get(o.slug);
          if (!part) return null;
          const isSelected = selected === o.slug;
          return (
            <li key={o.slug}>
              <button
                type="button"
                onClick={() => onChoose(o.slug)}
                aria-pressed={isSelected}
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-6 px-4 py-3 text-left transition-colors hover:bg-surface-2 ${
                  isSelected ? "bg-accent-tint" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block leading-snug font-medium">{part.name}</span>
                  <span className="mt-1 block font-mono text-xs text-muted">{specChips(step, part).join("  ·  ")}</span>
                </span>
                <span className="text-right">
                  <span className="block font-mono text-sm font-medium tabular-nums">{formatINR(part.priceRupees)}</span>
                  {isSelected && <span className="text-xs text-accent-text">Selected</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewStep({
  build,
  issues,
  spent,
  budget,
  selection,
  onBack,
}: {
  build: ReturnType<typeof resolveSelection>["build"];
  issues: ReturnType<typeof checkBuild>;
  spent: number;
  budget: number;
  selection: Selection;
  onBack: () => void;
}) {
  const errors = issues.filter((i) => i.level === "error");
  const advancedHref = `/advanced?${new URLSearchParams(selection as Record<string, string>)}`;
  const diff = budget - spent;

  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Your build: <span className="font-mono">{formatINR(spent)}</span>
      </h1>
      <p className={`mt-2 ${diff >= 0 ? "text-ok" : "text-error"}`}>
        {diff >= 0 ? `${formatINR(diff)} under budget` : `${formatINR(-diff)} over budget`}
      </p>
      <div className="mt-6">
        {Object.keys(build).length === 0 ? (
          <p className="text-muted">No parts chosen yet.</p>
        ) : (
          <BuildList build={build} issues={issues} />
        )}
      </div>
      {errors.length > 0 && (
        <ul className="mt-4 space-y-1.5 rounded-2xl border border-error/40 bg-error-tint p-4 text-sm">
          {errors.map((e) => (
            <li key={e.code} className="text-error">
              ✗ {e.message}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
        <Link href={advancedHref} className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium">
          Open in Advanced to fine-tune <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </>
  );
}

function BudgetPanel({
  budget,
  spent,
  useCase,
  selection,
  catalog,
  onJump,
}: {
  budget: number;
  spent: number;
  useCase: UseCaseId;
  selection: Selection;
  catalog: Catalog;
  onJump: (c: PartStep) => void;
}) {
  const split = USE_CASES[useCase].split;
  const ratio = Math.min(spent / budget, 1);
  const over = spent > budget;

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="border-b border-border p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Budget</span>
          <span className="font-mono text-sm text-muted">{formatINR(budget)}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className={`h-full transition-all ${over ? "bg-error" : "bg-accent"}`} style={{ width: `${ratio * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs">
          <span>{formatINR(spent)} spent</span>
          <span className={over ? "text-error" : "text-muted"}>
            {over ? `${formatINR(spent - budget)} over` : `${formatINR(budget - spent)} left`}
          </span>
        </div>
      </div>
      <ul className="divide-y divide-border text-sm">
        {PART_STEPS.map((c) => {
          const slug = selection[c];
          const part = slug ? (catalog[c] as PartByCategory[Category][]).find((p) => p.slug === slug) : undefined;
          return (
            <li key={c}>
              <button type="button" onClick={() => onJump(c)} className="flex w-full items-baseline justify-between gap-3 px-4 py-2 text-left hover:bg-surface-2">
                <span className={part ? "" : "text-muted"}>{CATEGORY_META[c].short}</span>
                <span className="font-mono text-xs tabular-nums">
                  {part ? formatINR(part.priceRupees) : <span className="text-muted">~{formatINR(Math.round((split[c] * budget) / 500) * 500)}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
