import type { Catalog } from "@pcb/shared";
import Link from "next/link";
import { connection } from "next/server";
import { getCatalog } from "@/lib/api";

export async function CatalogLoader({ children }: { children: (catalog: Catalog) => React.ReactNode }) {
  await connection();

  let catalog: Catalog;
  try {
    catalog = await getCatalog();
  } catch (err) {
    console.error("Could not load parts:", err);
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">We can&apos;t load parts right now</h1>
        <p className="mt-2 text-muted">The parts server isn&apos;t answering. Try again in a minute.</p>
        <a href="" className="btn-primary mt-6 inline-block rounded-md px-4 py-2 font-medium">
          Try again
        </a>
        <Link href="/" className="mt-3 block text-sm text-muted hover:text-foreground">
          Back to the home page
        </Link>
      </div>
    );
  }
  return children(catalog);
}
