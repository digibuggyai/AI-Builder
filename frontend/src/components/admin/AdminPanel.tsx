"use client";

import { AlertTriangle, ExternalLink, LogOut, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "dgb-admin";

const CATEGORIES = [
  { id: "cpu", label: "Processors" },
  { id: "gpu", label: "Graphics cards" },
  { id: "motherboard", label: "Motherboards" },
  { id: "ram", label: "RAM" },
  { id: "storage", label: "Storage" },
  { id: "psu", label: "Power supplies" },
  { id: "cooler", label: "CPU coolers" },
  { id: "case", label: "Cabinets" },
  { id: "monitor", label: "Monitors" },
  { id: "peripheral", label: "Peripherals" },
] as const;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "missing", label: "No price" },
  { id: "prebook", label: "Pre-book" },
  { id: "override", label: "Set by admin" },
] as const;

type CategoryStat = { category: string; total: number; inStock: number; missingPrice: number; overridden: number };
type Run = { startedAt: string; finishedAt: string | null; ok: boolean | null; rows: number | null; priceChanges: number | null; error: string | null };
type Summary = { categories: CategoryStat[]; lastRun: Run | null; lastSuccess: Run | null };
type Product = {
  id: number;
  name: string;
  group: string | null;
  skuId: string | null;
  url: string | null;
  sheetPricePaise: number | null;
  overridePricePaise: number | null;
  inStock: boolean;
  sheetUpdatedAt: string | null;
  sheetNotes: string | null;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const rupees = (paise: number | null) => (paise == null ? "—" : inr.format(paise / 100));
const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "never";

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminPanel() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(readToken());
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken("");
  }, []);

  if (!ready) return null;
  if (!token) return <Login onLogin={setToken} />;
  return <Dashboard token={token} onLogout={logout} />;
}

async function call<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
    signal: AbortSignal.timeout(120_000),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) throw Object.assign(new Error("Wrong admin password"), { status: 401 });
  if (!res.ok) throw new Error(data?.error ?? `Server answered ${res.status}`);
  return data as T;
}

function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await call(value, "/admin/summary");
      try {
        sessionStorage.setItem(TOKEN_KEY, value);
      } catch {}
      onLogin(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted">Prices and stock from the parts sheet.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Admin password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <button disabled={busy || !value} className="btn-primary w-full rounded-lg px-4 py-2.5 text-sm font-semibold">
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [category, setCategory] = useState<string>("cpu");
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const handle = useCallback(
    (err: unknown) => {
      if ((err as { status?: number })?.status === 401) return onLogout();
      setError(err instanceof Error ? err.message : "Something went wrong");
    },
    [onLogout],
  );

  const loadSummary = useCallback(() => call<Summary>(token, "/admin/summary").then(setSummary).catch(handle), [token, handle]);

  const loadProducts = useCallback(() => {
    setProducts(null);
    const params = new URLSearchParams({ category, filter });
    if (q.trim()) params.set("q", q.trim());
    return call<{ products: Product[] }>(token, `/admin/products?${params}`)
      .then((d) => setProducts(d.products))
      .catch(handle);
  }, [token, category, filter, q, handle]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const t = setTimeout(() => void loadProducts(), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadProducts, q]);

  async function syncNow() {
    setSyncing(true);
    setError("");
    try {
      await call(token, "/admin/sync", { method: "POST" });
    } catch (err) {
      handle(err);
    }
    await Promise.all([loadSummary(), loadProducts()]);
    setSyncing(false);
  }

  async function savePrice(id: number, priceRupees: number | null) {
    await call(token, `/admin/products/${id}`, { method: "PATCH", body: JSON.stringify({ priceRupees }) });
    setProducts((list) => list?.map((p) => (p.id === id ? { ...p, overridePricePaise: priceRupees == null ? null : priceRupees * 100 } : p)) ?? null);
    void loadSummary();
  }

  const stats = new Map(summary?.categories.map((c) => [c.category, c]));
  const missingTotal = summary?.categories.reduce((n, c) => n + c.missingPrice, 0) ?? 0;
  const run = summary?.lastRun;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Prices and stock</h1>
          <p className="mt-1 text-sm text-muted">
            Synced from the parts sheet every 30 minutes. Last sync {when(run?.finishedAt ?? run?.startedAt ?? null)}
            {run?.ok === false && <span className="text-error"> · failed: {run.error}</span>}
            {run?.ok && run.priceChanges != null && <span> · {run.priceChanges} price changes</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={syncNow} disabled={syncing} className="btn-secondary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium">
            <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} aria-hidden />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
          <button onClick={onLogout} className="btn-secondary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium">
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </div>
      </div>

      {missingTotal > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-warn/40 bg-warn-tint p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
          <p>
            <strong>{missingTotal} SKUs have no price.</strong> They show as “Ask for price” on the site until a price is set here or in the sheet.{" "}
            <button onClick={() => setFilter("missing")} className="font-semibold underline underline-offset-2">
              Show them
            </button>
          </p>
        </div>
      )}
      {error && <p className="mt-4 rounded-lg bg-error-tint px-4 py-3 text-sm text-error">{error}</p>}

      <nav aria-label="Categories" className="mt-6 flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => {
          const s = stats.get(c.id);
          const active = c.id === category;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-foreground text-background" : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {c.label}
              <span className="tabular-nums opacity-60">{s?.total ?? 0}</span>
              {!!s?.missingPrice && (
                <span className="rounded-full bg-error px-1.5 text-[11px] leading-5 font-semibold text-white tabular-nums">{s.missingPrice}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-sm ${filter === f.id ? "bg-surface font-semibold shadow-sm" : "text-muted hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative min-w-60 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dim" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or SKU"
            className="w-full rounded-lg border border-border bg-surface py-2 pr-3 pl-9 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs text-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Sheet price</th>
              <th className="px-4 py-3 font-medium">Admin price</th>
              <th className="px-4 py-3 text-right font-medium">On site</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products === null &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
                  </td>
                </tr>
              ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Nothing here.
                </td>
              </tr>
            )}
            {products?.map((p) => <Row key={p.id} product={p} onSave={savePrice} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ product: p, onSave }: { product: Product; onSave: (id: number, price: number | null) => Promise<void> }) {
  const [value, setValue] = useState(p.overridePricePaise == null ? "" : String(p.overridePricePaise / 100));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const live = p.overridePricePaise ?? p.sheetPricePaise;

  async function save() {
    const trimmed = value.replace(/[,\s₹]/g, "");
    const next = trimmed === "" ? null : Number(trimmed);
    if (next !== null && (!Number.isInteger(next) || next <= 0)) return setState("error");
    if (next === (p.overridePricePaise == null ? null : p.overridePricePaise / 100)) return;
    setState("saving");
    try {
      await onSave(p.id, next);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <tr className={live == null ? "bg-error-tint/40" : undefined}>
      <td className="max-w-[360px] px-4 py-3">
        <div className="flex items-start gap-1.5">
          <span className="font-medium">{p.name}</span>
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label="Open product link" className="mt-0.5 text-dim hover:text-foreground">
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
        <div className="mt-0.5 text-xs text-dim">{[p.group, p.skuId].filter(Boolean).join(" · ")}</div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.inStock ? "bg-ok-tint text-ok" : "bg-surface-2 text-muted"}`}
        >
          {p.inStock ? "In stock" : "Pre-book"}
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-muted">{rupees(p.sheetPricePaise)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-dim">₹</span>
          <input
            value={value}
            inputMode="numeric"
            onChange={(e) => {
              setValue(e.target.value);
              setState("idle");
            }}
            onBlur={save}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            placeholder={p.sheetPricePaise == null ? "Set price" : "Use sheet"}
            aria-label={`Admin price for ${p.name}`}
            className={`w-28 rounded-md border bg-background px-2 py-1 tabular-nums outline-none focus:border-accent ${
              state === "error" ? "border-error" : "border-border"
            }`}
          />
          <span className="w-12 text-xs text-dim">{state === "saving" ? "Saving" : state === "saved" ? "Saved" : state === "error" ? "Invalid" : ""}</span>
        </div>
      </td>
      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${live == null ? "text-error" : ""}`}>
        {live == null ? "No price" : rupees(live)}
      </td>
    </tr>
  );
}
