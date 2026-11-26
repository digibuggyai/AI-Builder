const SIZE = 1200;

const FANS = [
  { x: 812, y: 455, r: 76, squash: 1.2, speed: 0.9, tilt: 0 },
  { x: 812, y: 637, r: 76, squash: 1.17, speed: 0.95, tilt: 0 },
  { x: 806, y: 815, r: 76, squash: 1.15, speed: 0.85, tilt: 0 },
  { x: 336, y: 478, r: 62, squash: 1.28, speed: 1, tilt: 0 },
  { x: 400, y: 862, r: 60, squash: 0.3, speed: 0.8, tilt: -8 },
  { x: 492, y: 888, r: 64, squash: 0.3, speed: 0.9, tilt: -8 },
  { x: 622, y: 915, r: 66, squash: 0.3, speed: 0.85, tilt: -8 },
];

const pct = (n: number) => `${(n / SIZE) * 100}%`;

export function LivePc({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`rgb-cycle relative aspect-square ${className}`}>
      <img src="/builds/white.jpg" alt="" width={SIZE} height={SIZE} className="absolute inset-0 h-full w-full" />
      {FANS.map((f) => (
        <div
          key={`${f.x}-${f.y}`}
          className="absolute"
          style={{
            left: pct(f.x - f.r),
            top: pct(f.y - f.r),
            width: pct(f.r * 2),
            height: pct(f.r * 2),
            transform: `rotate(${f.tilt}deg) scaleY(${f.squash})`,
          }}
        >
          <div className="fan-blur h-full w-full rounded-full" style={{ animationDuration: `${f.speed}s` }} />
        </div>
      ))}
      <div className="rgb-bloom absolute inset-[18%_12%_8%_18%] rounded-full" />
    </div>
  );
}
