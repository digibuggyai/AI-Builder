import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Shown in the browser tab and in Google results
export const metadata: Metadata = {
  title: "AI PC Builder — Build your perfect PC",
  description:
    "Pick parts and we check that everything fits: socket, RAM, power and case size. Prices in ₹.",
};

// The layout wraps every page: header on top, page content below.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-border">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              AI PC <span className="text-accent">Builder</span>
            </Link>
            <Link href="/advanced" className="text-sm text-muted hover:text-foreground">
              Start building →
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          Prices are in ₹ and may change. Always check stock before you buy.
        </footer>
      </body>
    </html>
  );
}
