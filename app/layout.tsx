import "./../styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";

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
            <nav className="ml-auto flex gap-3">
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
              <Link href="/new-quote" className="btn">New Quote</Link>
            </nav>
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
