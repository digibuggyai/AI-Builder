import { Cpu } from "lucide-react";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI PC Builder — Build a PC that just works",
  description:
    "Pick parts and we check that everything fits: socket, RAM, power and case size. Prices in ₹.",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="atmosphere absolute inset-0" />
          <div className="beam absolute inset-0" />
        </div>

        <header className="glass-strong sticky top-0 z-40 border-b border-border">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-display flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-ink">
                <Cpu className="size-4.5" aria-hidden />
              </span>
              AI PC Builder
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/#how"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
              >
                How it works
              </Link>
              <ThemeToggle />
              <Link href="/advanced" className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">
                Start building
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
            <p className="font-display font-semibold text-foreground">AI PC Builder</p>
            <p>Prices are in ₹ and may change. Always check stock before you buy.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
