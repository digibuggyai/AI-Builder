import { ArrowRight, Compass, SlidersHorizontal, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { HomeDiagram } from "@/components/HomeDiagram";

const modes: {
  href: string;
  number: string;
  name: string;
  title: string;
  text: string;
  forWho: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/beginner",
    number: "01",
    name: "Beginner",
    title: "Build it for me",
    text: "Say what you'll use it for and how much you want to spend. Get a complete PC where every part fits.",
    forWho: "First PC, or no time to research",
    icon: Sparkles,
  },
  {
    href: "/pro",
    number: "02",
    name: "Pro",
    title: "Guided build",
    text: "Go part by part. Each step shows our pick and the reason, plus every other option that fits.",
    forWho: "You know the basics and want control",
    icon: Compass,
  },
  {
    href: "/advanced",
    number: "03",
    name: "Advanced",
    title: "Full control",
    text: "Every part and spec in one list, with search and live checks as you add things.",
    forWho: "You know exactly what you want",
    icon: SlidersHorizontal,
  },
];

const checks = [
  { title: "Socket and memory", text: "The CPU, motherboard and RAM have to agree: AM4 or AM5 or LGA1700, DDR4 or DDR5." },
  { title: "Case clearance", text: "GPU length, cooler height and board size, compared in millimetres against the case." },
  { title: "Cooling", text: "The cooler has to handle the CPU's heat, with some room so it isn't loud all day." },
  { title: "Power", text: "CPU boost plus GPU load, with about 30% spare on the power supply." },
];

const faqs = [
  {
    q: "Which mode should I pick?",
    a: "Never built a PC? Beginner. Know what a GPU does and want to choose? Pro. Already have a parts list in mind? Advanced. You can move a build from Beginner or Pro into Advanced at any time.",
  },
  {
    q: "How accurate are the checks?",
    a: "They compare the numbers on each part's spec sheet: socket, memory type, millimetres and watts. Rare cases, like a BIOS update for a newer CPU, still need a quick look.",
  },
  {
    q: "Is the monitor included in the budget?",
    a: "No. Budgets in Beginner and Pro are for the PC itself. You can add a monitor in Advanced.",
  },
  {
    q: "Can I share a build?",
    a: "Yes. The link in your address bar always holds your parts. Send it and the other person sees the same build.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
        <div>
          <p className="font-mono text-sm text-accent-text">PC builder for India · prices in ₹</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Build a PC that works the first time.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            Every part is checked against the rest as you build: socket, memory, cooling, power and case size. If
            something won&apos;t fit, you see why before you buy it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/beginner" className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-3 font-medium">
              Build it for me <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/advanced"
              className="rounded-lg border border-border-strong px-5 py-3 font-medium transition-colors hover:border-foreground"
            >
              I&apos;ll pick my parts
            </Link>
          </div>
        </div>
        <HomeDiagram />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold tracking-tight">Three ways to build</h2>
          <p className="text-sm text-muted">Same parts, same checks. Pick how much you want to decide.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-tint text-accent-text">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-sm text-muted">{mode.number}</span>
                </div>
                <p className="mt-6 text-sm font-medium text-accent-text">{mode.name}</p>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight">{mode.title}</h3>
                <p className="mt-3 flex-1 text-muted">{mode.text}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted">{mode.forWho}</span>
                  <ArrowRight className="size-4 text-accent-text transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="how" className="scroll-mt-14 border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">What gets checked</h2>
            <p className="mt-3 text-muted">
              Every part has a spec sheet in our database. Each time you add one, it&apos;s compared with everything
              already in your build.
            </p>
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {checks.map((c, i) => (
              <div key={c.title} className="border-t border-border-strong pt-4">
                <dt className="flex items-baseline gap-3 font-medium">
                  <span className="font-mono text-sm text-accent-text">0{i + 1}</span>
                  {c.title}
                </dt>
                <dd className="mt-2 text-muted">{c.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="font-display text-3xl font-bold tracking-tight">Questions</h2>
        <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1.5 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
