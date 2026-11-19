export function BuilderSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 pt-8" aria-busy="true" aria-label="Loading parts">
      <div className="h-4 w-28 rounded bg-surface" />
      <div className="mt-3 h-9 w-64 rounded bg-surface" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-surface" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-44 rounded-2xl bg-surface" />
          <div className="h-28 rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
