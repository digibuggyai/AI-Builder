const SETS = [
  [
    { color: "var(--blob-1)", left: "8%", bottom: "-30%", size: 180, move: "group-hover:translate-x-6" },
    { color: "var(--blob-3)", left: "48%", bottom: "-38%", size: 150, move: "group-hover:-translate-y-4" },
  ],
  [
    { color: "var(--blob-2)", left: "18%", bottom: "-34%", size: 170, move: "group-hover:-translate-x-5" },
    { color: "var(--blob-1)", left: "52%", bottom: "-30%", size: 160, move: "group-hover:-translate-y-5" },
    { color: "var(--blob-3)", left: "72%", bottom: "-42%", size: 130, move: "group-hover:translate-x-4" },
  ],
  [
    { color: "var(--blob-1)", left: "30%", bottom: "-36%", size: 200, move: "group-hover:translate-x-5" },
    { color: "var(--blob-3)", left: "70%", bottom: "-34%", size: 140, move: "group-hover:-translate-x-6" },
  ],
];

export function GlassBlobs({ variant = 0, className = "h-1/2" }: { variant?: number; className?: string }) {
  const set = SETS[variant % SETS.length];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden ${className}`}>
      {set.map((b) => (
        <span
          key={b.left}
          className={`blob ${b.move}`}
          style={{ left: b.left, bottom: b.bottom, width: b.size, height: b.size * 0.7, background: b.color }}
        />
      ))}
    </div>
  );
}
