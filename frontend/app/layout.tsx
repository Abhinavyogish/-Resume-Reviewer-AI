import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Resume Screening | Capstone Project - Abhinav Yogish',
  description: 'AI-based resume screening and candidate ranking - Capstone Project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#0c0c0e] text-[#e8e6e3] antialiased ${inter.className}`}>
        <header className="border-b border-[#2a2a2e] bg-[#121214]/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span className="text-white">Resume Screening</span>
              <span className="ml-1.5 text-[#d4af37]">— Capstone</span>
            </Link>
            <nav className="flex gap-8">
              <Link
                href="/upload"
                className="text-sm text-[#9c9892] transition hover:text-[#d4af37]"
              >
                Upload Resume
              </Link>
              <Link
                href="/jobs"
                className="text-sm text-[#9c9892] transition hover:text-[#d4af37]"
              >
                Jobs
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-[#2a2a2e] py-4 text-center text-sm text-[#6b6863]">
          Capstone Project — Abhinav Yogish
        </footer>
      </body>
    </html>
  );
}
