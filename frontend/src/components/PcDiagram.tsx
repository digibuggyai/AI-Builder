import type { Build, Category, Issue } from "@pcb/shared";

export type PartState = "empty" | "ok" | "warn" | "error";
export type DiagramStates = Partial<Record<Category, PartState>>;

export function diagramStates(build: Build, issues: Issue[]): DiagramStates {
  const states: DiagramStates = {};
  for (const category of Object.keys(build) as Category[]) {
    if (!build[category]) continue;
    const mine = issues.filter((i) => i.parts.includes(category));
    states[category] = mine.some((i) => i.level === "error")
      ? "error"
      : mine.some((i) => i.level === "warning")
        ? "warn"
        : "ok";
  }
  return states;
}

type Props = {
  states: DiagramStates;
  ramSticks?: number;
  className?: string;
  label?: string;
};

export function PcDiagram({ states, ramSticks = 2, className, label }: Props) {
  const s = (c: Category): PartState => states[c] ?? "empty";
  const pop = (c: Category) => (s(c) === "empty" ? "" : "pop");
  const lit = Math.min(Math.max(ramSticks, 1), 4);

  return (
    <svg
      viewBox="0 0 300 340"
      role="img"
      aria-label={label ?? "Diagram of the parts inside the PC"}
      className={`pc h-auto w-full ${className ?? ""}`}
    >
      <rect className="outline" data-state={s("case")} x="6" y="6" width="288" height="328" rx="16" />
      {[78, 142, 206].map((cy) => (
        <g key={`fan-${cy}-${s("case")}`} className={pop("case")}>
          <circle className="line" data-state={s("case")} cx="254" cy={cy} r="24" />
          <circle className="line" data-state={s("case")} cx="254" cy={cy} r="6" />
        </g>
      ))}
      <text data-state={s("case")} x="284" y="324" textAnchor="end">CASE</text>

      <rect key={`mb-${s("motherboard")}`} className={pop("motherboard")} data-state={s("motherboard")} x="24" y="24" width="186" height="214" rx="6" />
      <text data-state={s("motherboard")} x="32" y="38">BOARD</text>

      <rect key={`cpu-${s("cpu")}`} className={pop("cpu")} data-state={s("cpu")} x="74" y="56" width="48" height="48" rx="4" />
      <g key={`cooler-${s("cooler")}`} className={pop("cooler")}>
        <circle className="cooler" data-state={s("cooler")} cx="98" cy="80" r="34" />
        <line className="line" data-state={s("cooler")} x1="98" y1="80" x2="98" y2="52" />
        <line className="line" data-state={s("cooler")} x1="98" y1="80" x2="122" y2="94" />
        <line className="line" data-state={s("cooler")} x1="98" y1="80" x2="74" y2="94" />
      </g>
      <text data-state={s("cpu")} x="98" y="128" textAnchor="middle">CPU</text>

      {[142, 153, 164, 175].map((x, i) => {
        const state = s("ram") !== "empty" && i < lit ? s("ram") : "empty";
        return <rect key={`ram-${x}-${state}`} className={state === "empty" ? "" : "pop"} data-state={state} x={x} y="46" width="7" height="84" rx="2" />;
      })}
      <text data-state={s("ram")} x="162" y="142" textAnchor="middle">RAM</text>

      <g key={`gpu-${s("gpu")}`} className={pop("gpu")}>
        <rect data-state={s("gpu")} x="30" y="150" width="236" height="36" rx="5" />
        {[110, 168, 226].map((cx) => (
          <circle key={cx} className="line" data-state={s("gpu")} cx={cx} cy="168" r="12" />
        ))}
      </g>
      <text data-state={s("gpu")} x="40" y="172">GPU</text>

      <rect key={`ssd-${s("storage")}`} className={pop("storage")} data-state={s("storage")} x="58" y="204" width="76" height="11" rx="2" />
      <text data-state={s("storage")} x="142" y="213">SSD</text>

      <g key={`psu-${s("psu")}`} className={pop("psu")}>
        <rect data-state={s("psu")} x="24" y="256" width="124" height="60" rx="6" />
        <circle className="line" data-state={s("psu")} cx="100" cy="286" r="18" />
      </g>
      <text data-state={s("psu")} x="34" y="272">PSU</text>
    </svg>
  );
}
