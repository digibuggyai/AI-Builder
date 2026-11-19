"use client";

import {
  problemsIfChosen,
  type Build,
  type Catalog,
  type Category,
  type Issue,
  type PartByCategory,
} from "@pcb/shared";
import { Check, Search, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_META, formatINR, specChips } from "@/lib/parts";

type Part = PartByCategory[Category];
type Sort = "price-asc" | "price-desc" | "name";

type Props = {
  category: Category | null;
  catalog: Catalog;
  build: Build;
  onSelect: (category: Category, slug: string) => void;
  onClose: () => void;
};

export function PartPicker({ category, catalog, build, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (category && !dialog.open) dialog.showModal();
    if (!category && dialog.open) dialog.close();
  }, [category]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="picker-title"
      className="drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-xl glass-strong p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:border-l sm:border-border"
    >
      {category && (
        <PickerBody
          key={category}
          category={category}
          catalog={catalog}
          build={build}
          onSelect={(slug) => onSelect(category, slug)}
          onClose={onClose}
        />
      )}
    </dialog>
  );
}

function PickerBody({
  category,
  catalog,
  build,
  onSelect,
  onClose,
}: {
  category: Category;
  catalog: Catalog;
  build: Build;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const meta = CATEGORY_META[category];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("price-asc");
  const selectedSlug = build[category]?.slug;

  const { fits, noFit } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const parts = catalog[category] as Part[];
    const rows = parts
      .filter((p) => !q || `${p.brand} ${p.name}`.toLowerCase().includes(q))
      .map((part) => ({ part, problems: problemsIfChosen(build, category, part) }));

    rows.sort((a, b) => {
      if (sort === "name") return a.part.name.localeCompare(b.part.name);
      const pa = a.part.priceRupees ?? Infinity;
      const pb = b.part.priceRupees ?? Infinity;
      return sort === "price-asc" ? pa - pb : pb - pa;
    });

    return {
      fits: rows.filter((r) => r.problems.length === 0),
      noFit: rows.filter((r) => r.problems.length > 0),
    };
  }, [catalog, category, build, query, sort]);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="picker-title" className="font-display text-2xl font-bold">
              Choose a {meta.noun}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {fits.length} fit your build
              {noFit.length > 0 && ` · ${noFit.length} don't`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or brand"
              className="w-full rounded-lg border border-border bg-surface-2 py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-accent"
            />
          </label>
          <label>
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-full rounded-lg border border-border bg-surface-2 px-2 text-sm outline-none focus:border-accent"
            >
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {fits.length === 0 && noFit.length === 0 && (
          <p className="py-16 text-center text-muted">No parts match “{query}”.</p>
        )}

        <ul className="space-y-3">
          {fits.map(({ part }) => (
            <Option
              key={part.slug}
              category={category}
              part={part}
              problems={[]}
              selected={part.slug === selectedSlug}
              onSelect={onSelect}
            />
          ))}
        </ul>

        {noFit.length > 0 && (
          <section className="mt-8">
            <h3 className="text-sm font-semibold text-error">Won&apos;t fit your current build</h3>
            <p className="mt-0.5 text-xs text-muted">You can still pick one, then change the other part.</p>
            <ul className="mt-3 space-y-3">
              {noFit.map(({ part, problems }) => (
                <Option
                  key={part.slug}
                  category={category}
                  part={part}
                  problems={problems}
                  selected={part.slug === selectedSlug}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function Option({
  category,
  part,
  problems,
  selected,
  onSelect,
}: {
  category: Category;
  part: Part;
  problems: Issue[];
  selected: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(part.slug)}
        className={`w-full rounded-xl border p-4 text-left transition hover:border-accent/60 hover:bg-surface-2/60 focus-visible:outline-2 focus-visible:outline-accent ${
          selected ? "border-accent bg-accent/5" : "border-border"
        } ${problems.length > 0 ? "opacity-75" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium leading-snug">{part.name}</p>
          <p className="font-display shrink-0 font-semibold tabular-nums">{formatINR(part.priceRupees)}</p>
        </div>

        <ul className="mt-2 flex flex-wrap gap-1.5">
          {specChips(category, part).map((chip) => (
            <li key={chip} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {chip}
            </li>
          ))}
        </ul>

        {problems.map((p) => (
          <p key={p.code} className="mt-2 flex gap-1.5 text-sm text-error">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {p.message}
          </p>
        ))}

        {selected && (
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-accent">
            <Check className="size-4" aria-hidden /> Selected
          </p>
        )}
      </button>
    </li>
  );
}
