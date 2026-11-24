import { ArrowRight, ArrowUpRight, Check, ChevronDown, Gamepad2, MessageCircle } from "lucide-react";
import Link from "next/link";

const WHATSAPP = "https://api.whatsapp.com/send?phone=919311447394";

const exampleChecks = [
  { label: "CPU socket", value: "AM5 = AM5" },
  { label: "Memory", value: "DDR5 on DDR5 board" },
  { label: "GPU length", value: "336 of 400 mm" },
  { label: "Power", value: "620 W of 850 W" },
];

const checks = [
  { title: "Socket and memory", text: "CPU, motherboard and RAM have to agree: AM4, AM5 or LGA1700, DDR4 or DDR5." },
  { title: "Case clearance", text: "GPU length, cooler height, radiator and board size, in millimetres." },
  { title: "Cooling", text: "The cooler has to handle the CPU's heat, with room to spare." },
  { title: "Power", text: "CPU boost plus GPU load, with about 30% spare on the supply." },
];

const modes = [
  {
    href: "/beginner",
    step: "Beginner",
    title: "Build it for me",
    text: "Say what you'll use it for and how much you want to spend.",
    points: ["Pick a use case", "Set your budget", "Get a full build"],
    dark: false,
  },
  {
    href: "/pro",
    step: "Pro",
    title: "Guided build",
    text: "Go part by part, with our pick and the reason at every step.",
    points: ["Our pick and why", "Every option that fits"],
    dark: true,
  },
  {
    href: "/advanced",
    step: "Advanced",
    title: "Full control",
    text: "Every part and spec in one list. Change anything.",
    points: ["Import a quote or photo", "Edit every part"],
    dark: false,
  },
];

const faqs = [
  {
    q: "Which mode should I pick?",
    a: "Beginner if it's your first PC or you just want a build that works. Pro if you know the basics and want help choosing each part. Advanced if you already know what you want.",
  },
  {
    q: "What exactly is checked?",
    a: "CPU and motherboard socket, memory type and slots, cooler fit and heat, GPU, cooler and radiator clearance in the case, board size, and power supply headroom.",
  },
  {
    q: "Can I import a quote I already have?",
    a: "Yes, in Advanced mode. Paste the parts list or upload a photo of it, and each line is matched to a part.",
  },
  { q: "Are prices in rupees?", a: "Yes. Every price is shown in Indian rupees." },
  { q: "Do I need an account?", a: "No. You can build and check a PC without signing up." },
];

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${light ? "text-white/60" : "text-muted"}`}>{children}</p>
  );
}

function ExampleCheck() {
  return (
    <div className="w-full max-w-[340px] justify-self-end rounded-[24px] bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur-md">
      <div className="rounded-[18px] bg-white p-4 text-[#15140f] shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Build check</span>
          <span className="rounded-full bg-[#f2f1ec] px-2 py-0.5 text-[11px] text-[#66635b]">Example</span>
        </div>
        <p className="mt-5 font-display text-xl leading-tight font-semibold">All 8 parts fit.</p>
        <p className="mt-1 text-xs text-[#66635b]">Checked again every time a part changes.</p>
        <ul className="mt-4 space-y-1.5">
          {exampleChecks.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-3 rounded-xl bg-[#f6f5f1] px-3 py-2 text-xs">
              <span className="flex items-center gap-2 font-medium">
                <span className="grid size-4 place-items-center rounded-full bg-[#1f7a46] text-white">
                  <Check className="size-2.5" strokeWidth={3.5} aria-hidden />
                </span>
                {c.label}
              </span>
              <span className="tabular-nums text-[#66635b]">{c.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="flex items-center justify-between px-3 pt-2.5 pb-1 text-xs text-white/60">
        Next step <span className="font-medium text-white">Pick a case</span>
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="px-3 pt-3">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#0a0a0c] text-white">
          <img
            src="/builds/white.jpg"
            alt=""
            aria-hidden
            className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[65%_45%] opacity-70 lg:w-[70%] lg:opacity-100"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0a0a0c_25%,rgb(10_10_12/0.8)_50%,rgb(10_10_12/0.15)_80%)]"
          />
          <div
            aria-hidden
            className="absolute -bottom-56 -left-32 -z-10 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(245_160_40/0.42),transparent)]"
          />
          <div className="mx-auto grid min-h-[680px] max-w-6xl gap-12 px-6 pt-32 pb-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div className="flex flex-col justify-between gap-16 self-stretch">
              <div>
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-white/80 uppercase ring-1 ring-white/15">
                  PC builder · every part checked
                </span>
                <h1 className="mt-6 max-w-xl font-display text-[clamp(38px,5.2vw,68px)] leading-[1.02] font-semibold tracking-[-0.04em]">
                  Build a PC that
                  <br />
                  <span className="text-white/50">works the first time.</span>
                </h1>
                <p className="mt-5 max-w-md text-white/70">
                  Pick your parts, or tell us what you need. Every part is checked against the rest as you go.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/10 p-1 pl-5 ring-1 ring-white/15 backdrop-blur">
                  <span className="text-sm text-white/75">3 ways to build</span>
                  <Link
                    href="/beginner"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111] transition-colors hover:bg-white/90"
                  >
                    Start building <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
              <dl className="flex flex-wrap gap-x-10 gap-y-4">
                {[
                  ["18", "compatibility checks"],
                  ["10", "use cases"],
                  ["₹", "prices in rupees"],
                ].map(([n, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-semibold">{n}</dt>
                    <dd className="text-sm text-white/60">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ExampleCheck />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="ml-auto max-w-2xl text-right">
          <Eyebrow>What gets checked</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(30px,3.6vw,46px)] leading-[1.05] font-semibold tracking-[-0.035em]">
            Most builders check the socket.
            <br />
            <span className="text-dim">We check eighteen things.</span>
          </h2>
          <p className="mt-4 text-muted">Size, power, heat and memory, every time you add a part.</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_0.75fr_1fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-[#0a0a0c]">
            <img
              src="/builds/white.jpg"
              alt="A white PC with a glass side panel, built by Digibuggy"
              width={1200}
              height={1200}
              className="absolute inset-0 h-full w-full scale-[1.35] object-cover object-[62%_55%]"
            />
            <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-[#15140f] shadow-lg">
              <span className="grid size-6 place-items-center rounded-full bg-[#15140f] text-white">
                <Check className="size-3" strokeWidth={3} aria-hidden />
              </span>
              Built at Digibuggy
            </span>
          </div>

          <div className="grid gap-4">
            <div className="flex min-h-[190px] flex-col justify-between rounded-3xl bg-[linear-gradient(150deg,#ffc95c,#f59a2a_55%,#ec6e1f)] p-6 text-[#1f1203]">
              <span className="font-display text-6xl leading-none font-semibold tracking-tight">18</span>
              <span className="text-sm font-medium">compatibility checks on every build</span>
            </div>
            <div className="flex min-h-[210px] flex-col justify-between rounded-3xl bg-surface-2 p-6">
              <span className="grid size-11 place-items-center self-end rounded-full bg-foreground text-background">
                <Gamepad2 className="size-5" aria-hidden />
              </span>
              <div>
                <span className="font-display text-6xl leading-none font-semibold tracking-tight">10</span>
                <span className="mt-2 block text-sm text-muted">use cases, from esports to AI work</span>
              </div>
            </div>
          </div>

          <ol className="flex flex-col">
            {checks.map((c, i) => (
              <li key={c.title} className="border-b border-border py-5 first:pt-1">
                <p className="flex items-baseline gap-3 font-semibold">
                  <span className="font-display text-xs tabular-nums text-dim">{String(i + 1).padStart(2, "0")}</span>
                  {c.title}
                </p>
                <p className="mt-1.5 pl-7 text-sm text-muted">{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow>Three ways to build</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(30px,3.6vw,46px)] leading-[1.05] font-semibold tracking-[-0.035em]">
              One builder,
              <br />
              <span className="text-dim">three ways in.</span>
            </h2>
          </div>
          <p className="max-w-xs text-muted lg:text-right">Same parts and the same checks in every mode. Pick how much you want to decide.</p>
        </div>

        <div className="mt-10 grid gap-3 rounded-[28px] bg-surface-2 p-3 lg:grid-cols-3">
          {modes.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`group flex min-h-[340px] flex-col rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1 ${
                m.dark ? "bg-[#111113] text-white ring-1 ring-white/10" : "bg-surface"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${m.dark ? "text-white/55" : "text-dim"}`}>{m.step}</span>
                <span
                  className={`grid size-9 place-items-center rounded-full transition-colors ${
                    m.dark ? "bg-white text-[#111] group-hover:bg-accent" : "bg-foreground text-background group-hover:bg-accent group-hover:text-accent-ink"
                  }`}
                >
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl leading-tight font-semibold tracking-[-0.02em]">{m.title}</h3>
              <p className={`mt-2 text-sm ${m.dark ? "text-white/65" : "text-muted"}`}>{m.text}</p>
              {m.dark && (
                <div className="mt-5 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Step 3 of 9</span>
                    <span>Example</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">Graphics card</p>
                  <div className="mt-3 h-1 rounded-full bg-white/10">
                    <div className="h-full w-1/3 rounded-full bg-accent" />
                  </div>
                </div>
              )}
              <ul className="mt-auto space-y-2 pt-6">
                {m.points.map((p) => (
                  <li
                    key={p}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${
                      m.dark ? "bg-white/[0.06] ring-1 ring-white/10" : "bg-surface-2"
                    }`}
                  >
                    <span className={`grid size-4 place-items-center rounded-full ${m.dark ? "bg-white text-[#111]" : "bg-foreground text-background"}`}>
                      <Check className="size-2.5" strokeWidth={3.5} aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(30px,3.6vw,46px)] leading-[1.05] font-semibold tracking-[-0.035em]">
            Questions,
            <br />
            <span className="text-dim">answered.</span>
          </h2>
          <p className="mt-4 max-w-xs text-sm text-muted">Still unsure about a part or a build? Message us.</p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 max-w-xs rounded-3xl bg-[linear-gradient(150deg,#ffc95c,#f59a2a_55%,#ec6e1f)] p-5 text-[#1f1203] transition-transform hover:-translate-y-1 lg:mt-auto"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[#1f1203] text-white">
              <MessageCircle className="size-4" aria-hidden />
            </span>
            <span className="mt-4 block font-display text-lg font-semibold">Talk to Digibuggy</span>
            <span className="mt-1 block text-sm">Ask about a build, a part or a quote.</span>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold">
              Message on WhatsApp <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </a>
        </div>
        <div className="border-t border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-dim transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="-mt-1 pb-5 pr-10 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-3 pb-3">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#0a0a0c] px-6 py-24 text-center text-white sm:py-28">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[-0.18em] -z-10 font-display text-[19vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-white/[0.04] select-none"
          >
            PC BUILDER
          </span>
          <div
            aria-hidden
            className="absolute -top-40 left-1/2 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_160_40/0.22),transparent)]"
          />
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/75 ring-1 ring-white/15">No sign-up needed</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[clamp(34px,4.6vw,60px)] leading-[1.03] font-semibold tracking-[-0.04em]">
            Your next PC,
            <br />
            <span className="text-white/45">checked properly.</span>
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/beginner" className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              Build it for me <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/advanced"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              Pick my own parts
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
