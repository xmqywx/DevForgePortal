import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { LuCode, LuGithub } from "react-icons/lu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevForge - Ying's Project Portal",
  description:
    "Full-stack developer building AI tools, developer utilities, and cross-border e-commerce solutions.",
};

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f0f0e8] text-[#1a1a1a]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#c6e135]">
                <LuCode className="w-5 h-5 text-[#1a1a1a]" />
              </span>
              <span className="text-xl font-bold tracking-tight">DevForge</span>
            </Link>

            <nav className="flex items-center gap-6">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-black/5 bg-white/50">
          <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-sm text-[#1a1a1a]/50">
            <span>Built by Ying</span>
            <a
              href="https://github.com/xmqywx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#1a1a1a]/80 transition-colors"
            >
              <LuGithub className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
