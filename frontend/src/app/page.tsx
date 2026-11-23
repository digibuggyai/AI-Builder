import { ArrowRight, Compass, SlidersHorizontal, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { HomeDiagram } from "@/components/HomeDiagram";

const modes: {
  href: string;
  tag: string;
  title: string;
  accent: string;
  text: string;
  forWho: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/beginner",
    tag: "Beginner",
    title: "Build it",
    accent: "for me",
    text: "Say what you'll use it for and how much you want to spend. Get a complete PC where every part fits.",
    forWho: "First PC, or no time to research",
    icon: Sparkles,
  },
  {
    href: "/pro",
    tag: "Pro",
    title: "Guided",
    accent: "build",
    text: "Go part by part. Each step shows our pick and the reason, plus every other option that fits.",
    forWho: "You know the basics",
    icon: Compass,
  },
  {
    href: "/advanced",
    tag: "Advanced",
    title: "Full",
    accent: "control",
    text: "Every part and spec in one list. Import a quote or a photo of one, then change anything.",
    forWho: "You know exactly what you want",
    icon: SlidersHorizontal,
  },
];

const checks = [
  { title: "Socket and memory", text: "The CPU, motherboard and RAM have to agree: AM4, AM5 or LGA1700, DDR4 or DDR5." },
  { title: "Case clearance", text: "GPU length, cooler height and board size, compared in millimetres against the case." },
  { title: "Cooling", text: "The cooler has to handle the CPU's heat, with room to spare so it isn't loud all day." },
  { title: "Power", text: "CPU boost plus GPU load, with about 30% spare on the power supply." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 lg:grid-cols-[1.2fr_0.8fr] lg:pt-12">
          <div>
            <h1 className="font-display text-[clamp(30px,3.6vw,48px)] leading-[1.08] font-semibold tracking-[-0.03em]">
              Build a PC that <em>works the first time.</em>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted">
              Every part is checked against the rest as you build: socket, memory, cooling, power and case size.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/beginner" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
                Build it for me <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/advanced" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
                Pick my own parts
              </Link>
            </div>
          </div>
          <HomeDiagram />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl">
            Three ways <em>to build</em>
          </h2>
          <p className="max-w-sm text-muted">Same parts, same checks. Pick how much you want to decide.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl glass glow border p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-tint text-accent-text">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="tabular-nums text-xs text-dim uppercase">{mode.tag}</span>
                </div>
                <h3 className="mt-8 font-display text-3xl leading-none font-semibold tracking-[-0.03em]">
                  {mode.title} <em>{mode.accent}</em>
                </h3>
                <p className="mt-4 flex-1 text-muted">{mode.text}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-dim">{mode.forWho}</span>
                  <ArrowRight className="size-4 text-accent-text transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="how" className="glass scroll-mt-14 border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[0.85fr_1.15fr]">
          <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl">
            What gets <em>checked</em>
          </h2>
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {checks.map((c, i) => (
              <div key={c.title}>
                <dt className="flex items-center gap-3 font-semibold">
                  <span className="grid size-7 place-items-center rounded-lg bg-accent-tint tabular-nums text-xs text-accent-text">
                    {i + 1}
                  </span>
                  {c.title}
                </dt>
                <dd className="mt-2 text-muted">{c.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>


      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl glass glow border px-6 py-14 text-center sm:py-16">
            <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl">
              Your next PC is <em>a few clicks away</em>
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/beginner" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
                Build it for me <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/pro" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
                Start a guided build
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
