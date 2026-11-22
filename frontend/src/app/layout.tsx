import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

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
      className={`${sora.variable} ${manrope.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
            <Link href="/" aria-label="Digibuggy PC Builder home" className="flex items-center gap-3">
              <img src="/brand/digibuggy-logo-white.png" alt="Digibuggy" width={1920} height={214} className="h-[18px] w-auto light:hidden" />
              <img src="/brand/digibuggy-logo-dark.png" alt="Digibuggy" width={1920} height={214} className="hidden h-[18px] w-auto light:block" />
              <span className="border-l border-border-strong pl-3 font-display text-sm font-light tracking-wide text-muted">PC Builder</span>
            </Link>
            <div className="flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hidden px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:block"
                >
                  {item.label}
                </Link>
              ))}
              <ThemeToggle />
              <Link href="/beginner" className="btn-primary ml-2 hidden rounded-xl px-4 py-1.5 text-sm font-semibold sm:block">
                Start building
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}
