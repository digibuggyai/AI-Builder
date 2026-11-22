import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { FooterWordmark } from "@/components/FooterWordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Digibuggy PC Builder",
  description: "Build a PC that works the first time. Every part is checked for socket, memory, power and case fit, with prices in rupees.",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

const nav = [
  { href: "/beginner", label: "Beginner" },
  { href: "/pro", label: "Pro" },
  { href: "/advanced", label: "Advanced" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
            <Link href="/" aria-label="Digibuggy PC Builder home" className="flex items-center gap-3">
              <img src="/brand/digibuggy-logo-white.png" alt="Digibuggy" width={1920} height={214} className="h-[18px] w-auto light:hidden" />
              <img src="/brand/digibuggy-logo-dark.png" alt="Digibuggy" width={1920} height={214} className="hidden h-[18px] w-auto light:block" />
              <span className="border-l border-border-strong pl-3 font-display text-sm font-semibold tracking-tight text-muted">
                PC Builder
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hidden rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-foreground sm:block"
                >
                  {item.label}
                </Link>
              ))}
              <ThemeToggle />
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="overflow-hidden border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between">
            <p>© 2026 Digibuggy</p>
            <p>Prices change often. Check the store page before you buy.</p>
          </div>
          <FooterWordmark />
        </footer>
      </body>
    </html>
  );
}
