import Link from "next/link";

// The data for the 3 cards. Changing text here changes the page — no HTML edits needed.
const modes = [
  {
    tag: "First time",
    title: "Beginner",
    subtitle: "Build my PC for me",
    text: "Answer 5 simple questions. We pick every part for your budget.",
    href: "/beginner",
    ready: false,
  },
  {
    tag: "Know the basics",
    title: "Pro",
    subtitle: "Guided builder",
    text: "Go step by step, with a smart pick at every step.",
    href: "/pro",
    ready: false,
  },
  {
    tag: "Enthusiast",
    title: "Advanced",
    subtitle: "Full control",
    text: "Pick every part yourself. We check that it all fits.",
    href: "/advanced",
    ready: true,
  },
];

const checks = [
  { title: "Socket and RAM", text: "CPU, motherboard and memory must match." },
  { title: "Power", text: "Your PSU must handle the CPU and GPU, with room to spare." },
  { title: "Case fit", text: "GPU length, cooler height and board size, in millimetres." },
];

const faqs = [
  {
    q: "Which mode should I pick?",
    a: "New to PCs? Beginner. Know what a GPU is? Pro. Know exactly what you want? Advanced.",
  },
  {
    q: "How do you check compatibility?",
    a: "Every part has real specs in our database, like socket, length and wattage. We compare them as you pick.",
  },
  {
    q: "Are the prices live?",
    a: "Prices come from Indian stores and are updated regularly. Always confirm before buying.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ---------- Hero ---------- */}
      <section className="py-16 text-center sm:py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">AI PC Builder</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">Build your perfect PC</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Pick a mode. We check every part fits, so you never buy something that doesn&apos;t work.
        </p>
      </section>

      {/* ---------- 3 mode cards ---------- */}
      <section className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <div
            key={mode.title}
            className={`flex flex-col rounded-2xl border bg-surface p-6 ${
              mode.ready ? "border-accent/60" : "border-border"
            }`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-muted">{mode.tag}</span>
            <h2 className="mt-2 text-2xl font-semibold">{mode.title}</h2>
            <p className="font-medium text-accent">{mode.subtitle}</p>
            <p className="mt-3 flex-1 text-muted">{mode.text}</p>

            {mode.ready ? (
              <Link
                href={mode.href}
                className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-center font-semibold text-accent-ink hover:opacity-90"
              >
                Open {mode.title} builder
              </Link>
            ) : (
              <span className="mt-6 rounded-lg border border-border px-4 py-2.5 text-center text-muted">
                Coming soon
              </span>
            )}
          </div>
        ))}
      </section>

      {/* ---------- What we check ---------- */}
      <section className="py-16">
        <h2 className="text-center text-2xl font-semibold">What we check for you</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {checks.map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FAQ (answers are in the HTML, so Google can read them) ---------- */}
      <section className="mx-auto max-w-2xl pb-20">
        <h2 className="text-center text-2xl font-semibold">Questions</h2>
        <div className="mt-6 divide-y divide-border rounded-xl border border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium">
                {f.q}
                <span className="float-right text-muted group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
