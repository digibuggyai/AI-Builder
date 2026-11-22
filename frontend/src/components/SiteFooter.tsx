import Link from "next/link";
import { FooterWordmark } from "./FooterWordmark";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Build",
    links: [
      { label: "Beginner", href: "/beginner" },
      { label: "Pro", href: "/pro" },
      { label: "Advanced", href: "/advanced" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Import a build list", href: "/advanced" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Digibuggy.com", href: "https://digibuggy.com", external: true },
      { label: "WhatsApp us", href: "https://api.whatsapp.com/send?phone=919311447394", external: true },
    ],
  },
];

const SOCIAL_LINKS: { label: string; href: string; icon: React.ReactNode }[] = [];

const SUPPORT_EMAIL: string | null = null;

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-border">
      <div className="mx-auto max-w-6xl px-4 pt-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" aria-label="Digibuggy PC Builder home" className="inline-flex items-center gap-3">
              <img src="/brand/digibuggy-logo-white.png" alt="Digibuggy" width={1920} height={214} className="h-5 w-auto light:hidden" />
              <img src="/brand/digibuggy-logo-dark.png" alt="Digibuggy" width={1920} height={214} className="hidden h-5 w-auto light:block" />
              <span className="border-l border-border-strong pl-3 font-display text-sm font-semibold text-muted">PC Builder</span>
            </Link>
            <p className="mt-5 max-w-sm text-muted">
              Pick parts and see straight away whether they fit together.
            </p>
            {SOCIAL_LINKS.length > 0 && (
              <ul className="mt-6 flex gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid size-11 place-items-center rounded-full border border-border-strong text-muted transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="font-mono text-xs font-medium tracking-[0.14em] text-muted uppercase">{column.title}</h2>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-foreground/80 transition-colors hover:text-foreground">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-foreground/80 transition-colors hover:text-foreground">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© 2026 Digibuggy. Prices change often, check the store page before you buy.</p>
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">
              {SUPPORT_EMAIL}
            </a>
          )}
        </div>
      </div>

      <div className="mt-10">
        <FooterWordmark />
      </div>
    </footer>
  );
}
