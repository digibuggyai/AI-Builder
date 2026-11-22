"use client";

import {
  problemsIfChosen,
  type Build,
  type Catalog,
  type Category,
  type Issue,
  type PartByCategory,
} from "@pcb/shared";
import { Search, X } from "lucide-react";
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
      className="drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-2xl border-l border-border bg-surface p-0 text-foreground shadow-2xl"
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

  const total = catalog[category].length;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="picker-title" className="text-lg font-semibold">
              Choose a {meta.noun}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {total === 0 ? "None listed yet" : `${fits.length} fit your build${noFit.length > 0 ? `, ${noFit.length} don't` : ""}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {total > 0 && (
          <div className="mt-4 flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or brand"
                className="w-full btn-secondary rounded-xl bg-background py-1.5 pr-3 pl-8 text-sm outline-none placeholder:text-muted focus:border-accent"
              />
            </label>
            <label>
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-full btn-secondary rounded-xl bg-background px-2 text-sm outline-none focus:border-accent"
              >
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {total === 0 && (
          <p className="px-5 py-12 text-center text-sm text-muted">
            We haven&apos;t added any {meta.noun}s yet. Check back soon.
          </p>
        )}
        {total > 0 && fits.length === 0 && noFit.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-muted">Nothing matches “{query}”.</p>
        )}

        <ul className="divide-y divide-border">
          {fits.map(({ part }) => (
            <Option key={part.slug} category={category} part={part} problems={[]} selected={part.slug === selectedSlug} onSelect={onSelect} />
          ))}
        </ul>

        {noFit.length > 0 && (
          <>
            <p className="border-y border-border bg-surface-2 px-5 py-2 text-xs font-medium text-muted">
              Won&apos;t fit with your current parts
            </p>
            <ul className="divide-y divide-border">
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
          </>
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
        aria-current={selected ? "true" : undefined}
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-6 px-5 py-3 text-left hover:bg-surface-2 ${
          selected ? "bg-accent-tint" : ""
        }`}
      >
        <span className="min-w-0">
          <span className={`block leading-snug font-medium ${problems.length > 0 ? "text-muted" : ""}`}>{part.name}</span>
          <span className="mt-1 block tabular-nums text-xs text-muted">{specChips(category, part).join("  ·  ")}</span>
          {problems.map((p) => (
            <span key={p.code} className="mt-1 block text-xs text-error">
              {p.message}
            </span>
          ))}
        </span>
        <span className="text-right">
          <span className="block tabular-nums text-sm font-medium ">{formatINR(part.priceRupees)}</span>
          {selected ? (
            <span className="text-xs text-accent-text">Selected</span>
          ) : (
            !part.inStock && part.priceRupees != null && <span className="text-xs text-muted">Out of stock</span>
          )}
        </span>
      </button>
    </li>
  );
}
