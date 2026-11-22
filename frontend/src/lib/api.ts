import type { Catalog, Issue, Selection, Suggestions, UseCaseId, Category } from "@pcb/shared";

const SERVER_API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getCatalog(): Promise<Catalog> {
  const res = await fetch(`${SERVER_API_URL}/parts`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`API answered ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown, timeoutMs = 15_000): Promise<T> {
  const res = await fetch(`${BROWSER_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `The server answered ${res.status}`);
  }
  return res.json();
}

export type RecommendResponse =
  | { ok: true; useCase: UseCaseId; budgetRupees: number; totalRupees: number; parts: Selection; issues: Issue[] }
  | { ok: false; reason: string; cheapestRupees: number | null };

export function requestRecommendation(useCase: UseCaseId, budgetRupees: number) {
  return post<RecommendResponse>("/recommend", { useCase, budgetRupees });
}

export type ImportResponse = { selection: Selection; matched: number; unmatched: string[]; extras: string[] };

export function requestImport(body: { text: string } | { imageBase64: string; mediaType: "image/jpeg" }) {
  return post<ImportResponse>("/import", body, 60_000);
}

export function requestSuggestions(category: Category, useCase: UseCaseId, budgetRupees: number, build: Selection) {
  return post<Suggestions>("/suggestions", { category, useCase, budgetRupees, build });
}
