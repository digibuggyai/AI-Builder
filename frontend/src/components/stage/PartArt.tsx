import type { Category, Cooler, Cpu, PartByCategory, Psu, Ram } from "@pcb/shared";

const C = {
  pcb: "#151a22",
  pcbLine: "#243040",
  metal: "#a7afbd",
  metalDark: "#566070",
  black: "#0c0e12",
  shroud: "#1f242d",
  edge: "#323a47",
  gold: "#c9a227",
};

function Fan({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.black} stroke={C.edge} strokeWidth="1.5" />
      <g className="fan-spin">
        {[0, 51, 103, 154, 206, 257, 309].map((a) => (
          <path
            key={a}
            d={`M ${cx} ${cy} q ${r * 0.55} ${-r * 0.2} ${r * 0.75} ${-r * 0.8} q ${-r * 0.45} ${r * 0.1} ${-r * 0.75} ${r * 0.8} z`}
            fill="#2c3340"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r * 0.25} fill="#262c37" stroke={C.edge} />
    </g>
  );
}

export function BoardArt() {
  return (
    <svg viewBox="0 0 200 210" className="h-full w-full" aria-hidden>
      <rect x="1" y="1" width="198" height="208" rx="6" fill={C.pcb} stroke={C.edge} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${10 + i * 20} 200 L ${10 + i * 20} ${150 - (i % 3) * 18} L ${30 + i * 18} ${120 - (i % 4) * 10}`} stroke={C.pcbLine} fill="none" />
      ))}
      <rect x="8" y="8" width="22" height="70" rx="3" fill="#2a303a" stroke={C.edge} />
      <rect x="36" y="8" width="60" height="14" rx="3" fill="#2a303a" stroke={C.edge} />
      <rect x="44" y="34" width="56" height="56" rx="4" fill="none" stroke={C.metalDark} strokeDasharray="3 3" />
      {[120, 130, 140, 150].map((x) => (
        <rect key={x} x={x} y="14" width="6" height="92" rx="1.5" fill={C.black} stroke={C.edge} />
      ))}
      <rect x="14" y="122" width="170" height="8" rx="2" fill={C.black} stroke={C.metalDark} />
      <rect x="14" y="160" width="120" height="6" rx="2" fill={C.black} stroke={C.edge} />
      <rect x="146" y="150" width="40" height="40" rx="5" fill="#2a303a" stroke={C.edge} />
    </svg>
  );
}

export function CpuArt({ part }: { part?: Cpu }) {
  const brand = part?.brand === "Intel" ? "intel" : "AMD";
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <rect x="2" y="2" width="96" height="96" rx="6" fill="#1d5a3c" />
      <defs>
        <linearGradient id="ihs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7dce4" />
          <stop offset="0.5" stopColor={C.metal} />
          <stop offset="1" stopColor="#7d8695" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="76" height="76" rx="8" fill="url(#ihs)" />
      <text x="50" y="54" textAnchor="middle" fontSize="15" fontWeight="700" fill="#3a414d" fontFamily="sans-serif">
        {brand}
      </text>
    </svg>
  );
}

export function CoolerArt({ part }: { part?: Cooler }) {
  if (part?.type === "Liquid") {
    return (
      <svg viewBox="0 0 140 140" className="h-full w-full" aria-hidden>
        <circle cx="70" cy="70" r="56" fill={C.black} stroke={C.edge} strokeWidth="2" />
        <circle cx="70" cy="70" r="44" fill="none" stroke="var(--accent)" strokeWidth="4" opacity="0.9" />
        <circle cx="70" cy="70" r="30" fill="#161a21" />
        <path d="M 112 40 C 130 20, 138 10, 140 0" stroke={C.black} strokeWidth="9" fill="none" />
        <path d="M 116 52 C 134 34, 140 26, 140 14" stroke={C.black} strokeWidth="9" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" aria-hidden>
      <rect x="10" y="8" width="120" height="124" rx="6" fill="#6f7888" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1="10" x2="130" y1={12 + i * 5.5} y2={12 + i * 5.5} stroke="#525b6a" strokeWidth="1.2" />
      ))}
      <rect x="14" y="16" width="108" height="108" rx="8" fill="#14171d" stroke={C.edge} />
      <Fan cx={68} cy={70} r={46} />
    </svg>
  );
}

export function RamStickArt({ rgb }: { rgb: boolean }) {
  return (
    <svg viewBox="0 0 24 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="rgb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4d6d" />
          <stop offset="0.33" stopColor="#7c5cff" />
          <stop offset="0.66" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="2" y="0" width="20" height="14" rx="3" fill={rgb ? "url(#rgb)" : "#3b4352"} />
      <rect x="2" y="12" width="20" height="100" rx="2" fill="#1c212a" stroke={C.edge} />
      <line x1="12" x2="12" y1="20" y2="104" stroke="#2c3340" strokeWidth="6" />
      <rect x="3" y="112" width="18" height="8" fill={C.gold} />
    </svg>
  );
}

export function GpuArt() {
  return (
    <svg viewBox="0 0 400 80" className="h-full w-full" aria-hidden>
      <rect x="1" y="4" width="398" height="66" rx="9" fill={C.shroud} stroke={C.edge} strokeWidth="1.5" />
      <rect x="1" y="4" width="398" height="5" rx="2.5" fill="var(--accent)" opacity="0.85" />
      <Fan cx={78} cy={38} r={27} />
      <Fan cx={200} cy={38} r={27} />
      <Fan cx={322} cy={38} r={27} />
      <rect x="44" y="70" width="160" height="8" fill={C.gold} />
    </svg>
  );
}

export function SsdArt() {
  return (
    <svg viewBox="0 0 160 30" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <rect x="1" y="2" width="158" height="26" rx="3" fill="#123826" stroke="#1f4d36" />
      <rect x="10" y="6" width="80" height="18" rx="2" fill="#20252e" />
      <rect x="98" y="7" width="22" height="16" fill={C.black} />
      <rect x="124" y="7" width="22" height="16" fill={C.black} />
      <rect x="148" y="9" width="10" height="12" fill={C.gold} />
    </svg>
  );
}

export function PsuArt({ part }: { part?: Psu }) {
  return (
    <svg viewBox="0 0 200 90" className="h-full w-full" aria-hidden>
      <rect x="1" y="1" width="198" height="88" rx="7" fill="#101318" stroke={C.edge} strokeWidth="1.5" />
      {[34, 26, 18, 10].map((r) => (
        <circle key={r} cx="58" cy="45" r={r} fill="none" stroke="#2a313d" strokeWidth="1.5" />
      ))}
      <rect x="112" y="28" width="76" height="34" rx="4" fill="#1b2029" />
      <text x="150" y="51" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.metal} fontFamily="monospace">
        {part ? `${part.wattage}W` : "PSU"}
      </text>
    </svg>
  );
}

export function PartArt({ category, part }: { category: Category; part?: PartByCategory[Category] }) {
  if (category === "motherboard") return <BoardArt />;
  if (category === "cpu") return <CpuArt part={part as Cpu | undefined} />;
  if (category === "cooler") return <CoolerArt part={part as Cooler | undefined} />;
  if (category === "ram") return <RamStickArt rgb={(part as Ram | undefined)?.rgb ?? false} />;
  if (category === "gpu") return <GpuArt />;
  if (category === "storage") return <SsdArt />;
  if (category === "psu") return <PsuArt part={part as Psu | undefined} />;
  return null;
}
