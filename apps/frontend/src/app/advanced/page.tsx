import type { Catalog } from "@pcb/compat";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Builder } from "@/components/builder/Builder";
import { BuilderSkeleton } from "@/components/builder/BuilderSkeleton";
import { getCatalog } from "@/lib/api";

export const metadata: Metadata = {
  title: "Advanced builder — AI PC Builder",
  description: "Pick every part yourself. We check socket, RAM, power and case fit as you go.",
};

export default function AdvancedPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <BuilderLoader />
    </Suspense>
  );
}

async function BuilderLoader() {
  await connection();

  let catalog: Catalog;
  try {
    catalog = await getCatalog();
  } catch (err) {
    console.error("Could not load parts:", err);
    return <LoadError />;
  }
  return <Builder catalog={catalog} />;
}

function LoadError() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">We can&apos;t load parts right now</h1>
      <p className="mt-2 text-muted">Please try again in a minute.</p>
      <Link
        href="/advanced"
        className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 font-semibold text-accent-ink"
      >
        Try again
      </Link>
    </div>
  );
}
