import type { Metadata } from "next";
import { Suspense } from "react";
import { Builder } from "@/components/builder/Builder";
import { BuilderSkeleton } from "@/components/builder/BuilderSkeleton";
import { CatalogLoader } from "@/components/CatalogLoader";

export const metadata: Metadata = {
  title: "Advanced builder · Digibuggy PC Builder",
  description: "Pick every part yourself. Socket, memory, power and case fit are checked as you go.",
};

export default function AdvancedPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <CatalogLoader>{(catalog) => <Builder catalog={catalog} />}</CatalogLoader>
    </Suspense>
  );
}
