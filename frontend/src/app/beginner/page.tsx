import type { Metadata } from "next";
import { Suspense } from "react";
import { BeginnerFlow } from "@/components/beginner/BeginnerFlow";
import { CatalogLoader } from "@/components/CatalogLoader";

export const metadata: Metadata = {
  title: "Build it for me · Digibuggy PC Builder",
  description: "Tell us what you'll use your PC for and your budget. Get a complete build where every part fits.",
};

export default function BeginnerPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse px-4 pt-8" />}>
      <CatalogLoader>{(catalog) => <BeginnerFlow catalog={catalog} />}</CatalogLoader>
    </Suspense>
  );
}
