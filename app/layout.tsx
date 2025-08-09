// app/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import "./../styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";

export const metadata: Metadata = {
  title: "PlumbSpark",
  description: "AI-powered quoting app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="PlumbSpark" className="h-8 w-8" />
              <span className="font-bold text-lg">PlumbSpark</span>
            </Link>
            <AuthButtons />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
          © {new Date().getFullYear()} PlumbSpark
        </footer>
      </body>
    </html>
  );
}
