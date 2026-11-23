export function BuilderSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 pt-8" aria-busy="true" aria-label="Loading parts">
      <div className="border-b border-border pb-5">
        <div className="h-8 w-40 rounded bg-surface-2" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-surface-2" />
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border rounded-lg glass glow border">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex items-center gap-5 px-4 py-4">
              <div className="h-4 w-28 rounded bg-surface-2" />
              <div className="h-4 flex-1 rounded bg-surface-2" />
              <div className="h-7 w-24 rounded bg-surface-2" />
            </div>
          ))}
        </div>
        <div className="h-72 rounded-lg glass glow border" />
      </div>
    </div>
  );
}
