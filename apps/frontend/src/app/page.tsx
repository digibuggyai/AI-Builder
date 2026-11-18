import {
  ArrowRight,
  CircleCheck,
  Compass,
  Cpu,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { HeroSpotlight } from "@/components/HeroSpotlight";

const modes: { icon: LucideIcon; tag: string; title: string; text: string; href: string; ready: boolean }[] = [
  { icon: Sparkles, tag: "First time", title: "Beginner", text: "Answer 5 simple questions. We pick every part for your budget.", href: "/beginner", ready: false },
  { icon: Compass, tag: "Know the basics", title: "Pro", text: "Go step by step, with a smart pick at every step.", href: "/pro", ready: false },
  { icon: SlidersHorizontal, tag: "Enthusiast", title: "Advanced", text: "Pick every part yourself. We check that it all fits as you go.", href: "/advanced", ready: true },
];

const stats = [
  { value: "19", title: "Fit checks", text: "Socket, memory, power, cooling and case size, on every pick." },
  { value: "9", title: "Part types", text: "From CPU to monitor. Every spec stored, not guessed." },
  { value: "₹0", title: "To use", text: "Build, compare and share as many PCs as you like." },
];

const checks: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Cpu, title: "Socket and memory", text: "CPU, motherboard and RAM must match. We check AM4, AM5, LGA1700, DDR4 and DDR5." },
  { icon: Zap, title: "Power", text: "We add up what the CPU and GPU draw, and make sure the power supply has room to spare." },
  { icon: Ruler, title: "Case fit", text: "GPU length, cooler height and board size, checked in millimetres." },
];

const faqs = [
  { q: "Which mode should I pick?", a: "New to PCs? Beginner. Know what a GPU is? Pro. Know exactly what you want? Advanced." },
  { q: "How do you check compatibility?", a: "Every part has real specs in our database, like socket, length and wattage. We compare them every time you pick a part." },
  { q: "Are the prices live?", a: "Prices come from Indian stores and are updated regularly. Always confirm the price before you buy." },
  { q: "Can I share my build?", a: "Yes. Click Share build and send the link. It opens the exact same parts." },
];

const previewParts = [
  { label: "CPU", name: "Ryzen 7 7800X3D", price: "₹36,000" },
  { label: "GPU", name: "RTX 5070 Ti 16 GB", price: "₹85,000" },
  { label: "Board", name: "TUF Gaming B850-Plus", price: "₹23,000" },
  { label: "RAM", name: "32 GB DDR5 6000", price: "₹10,500" },
];

export default function HomePage() {
  return (
    <>
      <HeroSpotlight className="overflow-hidden">
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-24 text-center sm:pt-24">
          <p className="animate-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="live-dot text-ok" /> Every part checked for fit
          </p>
          <h1 className="font-display animate-up mx-auto mt-6 max-w-4xl text-5xl leading-[1.05] font-bold tracking-tight text-balance [--delay:100ms] sm:text-7xl">
            Build a PC that <span className="text-brand">just works</span>
          </h1>
          <p className="animate-up mx-auto mt-6 max-w-xl text-lg text-pretty text-muted [--delay:220ms]">
            Pick your parts and we check socket, memory, power and case size as you go. No guesswork, no returns.
          </p>
          <div className="animate-up mt-9 flex flex-wrap justify-center gap-3 [--delay:320ms]">
            <Link href="/advanced" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold">
              Start building <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="#how"
              className="rounded-full border border-border-strong bg-surface px-6 py-3 font-semibold transition-colors hover:border-accent hover:text-accent-text"
            >
              How it works
            </Link>
          </div>

          <div className="animate-rise relative mx-auto mt-16 max-w-md text-left">
            <FloatTag className="-top-5 -left-6 sm:-left-28" delay="0s">
              <CircleCheck className="size-3.5 text-ok" aria-hidden /> Socket AM5 matches
            </FloatTag>
            <FloatTag className="top-1/3 -right-4 sm:-right-32" delay="-2.4s">
              <Zap className="size-3.5 text-warn" aria-hidden /> 431 W of 850 W
            </FloatTag>
            <FloatTag className="-bottom-5 left-4 sm:-left-24" delay="-4.6s">
              <Ruler className="size-3.5 text-accent-text" aria-hidden /> GPU 304 / 360 mm
            </FloatTag>

            <div className="glass rounded-3xl border border-border p-6">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">Your build</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 px-2.5 py-1 text-xs font-semibold text-ok">
                  <CircleCheck className="size-3.5" aria-hidden /> Everything fits
                </span>
              </div>
              <ul className="mt-5 space-y-2">
                {previewParts.map((p) => (
                  <li key={p.label} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
                    <span className="w-12 text-xs font-medium text-muted">{p.label}</span>
                    <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className="font-display text-sm text-muted tabular-nums">{p.price}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
                <div>
                  <p className="text-xs text-muted">Estimated total</p>
                  <p className="font-display text-3xl font-bold tracking-tight tabular-nums">₹1,54,500</p>
                </div>
                <span className="text-xs text-muted">4 of 8 parts</span>
              </div>
            </div>
          </div>
        </section>
      </HeroSpotlight>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="font-display reveal text-center text-3xl font-bold tracking-tight sm:text-5xl">
          Zero guesswork. <span className="text-brand">Zero returns.</span>
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.title} className="glass reveal rounded-2xl border border-border p-7">
              <p className="font-display text-brand text-6xl font-bold tracking-tight sm:text-7xl">{s.value}</p>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <p className="reveal text-center text-xs font-semibold tracking-[0.16em] text-accent-text uppercase">◆ Three ways to build</p>
        <h2 className="font-display reveal mt-3 text-center text-3xl font-bold tracking-tight sm:text-5xl">
          Choose how you want to build
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-11 place-items-center rounded-xl ${
                      mode.ready ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {mode.ready ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 px-2.5 py-1 text-xs font-semibold text-ok">
                      <span className="live-dot" /> Live
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">Coming soon</span>
                  )}
                </div>
                <p className="mt-6 text-xs font-semibold tracking-wider text-muted uppercase">{mode.tag}</p>
                <h3 className="font-display mt-1 text-2xl font-bold">{mode.title}</h3>
                <p className="mt-2 flex-1 text-muted">{mode.text}</p>
                {mode.ready && (
                  <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-accent-text">
                    Open builder <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                )}
              </>
            );

            return mode.ready ? (
              <Link
                key={mode.title}
                href={mode.href}
                className="glass reveal group flex flex-col rounded-2xl border border-accent/50 p-6 transition-[transform,border-color] duration-300 ease-(--ease) hover:-translate-y-1 hover:border-accent"
              >
                {body}
              </Link>
            ) : (
              <div key={mode.title} className="glass reveal flex flex-col rounded-2xl border border-border p-6">
                {body}
              </div>
            );
          })}
        </div>
      </section>

      <section id="how" className="border-y border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="font-display reveal max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            What we check, <span className="text-brand">every time you pick</span>
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {checks.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="reveal">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-tint text-accent-text">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1.5 text-muted">{c.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24">
        <h2 className="font-display reveal text-center text-3xl font-bold tracking-tight sm:text-5xl">Questions</h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                {f.q}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted transition-transform duration-300 ease-(--ease) group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pt-12 pb-32 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-1/2 left-1/2 aspect-[1.6] w-[min(1400px,160vw)] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--accent-tint),transparent_70%)] blur-3xl"
        />
        <h2 className="font-display reveal relative text-4xl font-bold tracking-tight sm:text-6xl">
          Your next PC, <span className="text-brand">checked</span>
        </h2>
        <p className="reveal relative mt-4 text-lg text-muted">Free to use · Prices in ₹ · Share with one link</p>
        <Link
          href="/advanced"
          className="btn-primary reveal relative mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
        >
          Start building <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </>
  );
}

function FloatTag({ children, className, delay }: { children: React.ReactNode; className: string; delay: string }) {
  return (
    <span
      className={`glass-strong animate-float absolute z-10 hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold whitespace-nowrap sm:inline-flex ${className}`}
      style={{ ["--delay" as string]: delay }}
    >
      {children}
    </span>
  );
}
