import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogLoader } from "@/components/CatalogLoader";
import { ProWizard } from "@/components/pro/ProWizard";

export const metadata: Metadata = {
  title: "Guided build · Digibuggy PC Builder",
  description: "Build your PC one part at a time, with a recommended pick and the reason at every step.",
};

export default function ProPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse px-4 pt-8" />}>
      <CatalogLoader>{(catalog) => <ProWizard catalog={catalog} />}</CatalogLoader>
    </Suspense>
  );
}
