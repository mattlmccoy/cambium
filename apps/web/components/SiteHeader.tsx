"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CambiumLogoMark } from "./CambiumLogo";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CambiumLogoMark size={22} color="#44403c" />
          <span className="text-lg font-light tracking-[0.15em] text-stone-900">
            CAMBIUM
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/our-story"
            className={`text-sm transition-colors ${
              pathname === "/our-story"
                ? "font-medium text-stone-900"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Our Story
          </Link>
          <Link
            href="/saved-designs"
            className={`flex items-center gap-1 text-sm transition-colors ${
              pathname === "/saved-designs"
                ? "font-medium text-stone-900"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            Saved
          </Link>
          <BenchLink pathname={pathname} />
        </nav>
      </div>
    </header>
  );
}

function BenchLink({ pathname }: { pathname: string }) {
  // bench-store will be added in Phase 3 — for now just show the link
  return (
    <Link
      href="/bench"
      className={`flex items-center gap-1 text-sm transition-colors ${
        pathname === "/bench"
          ? "font-medium text-stone-900"
          : "text-stone-500 hover:text-stone-900"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      My Bench
    </Link>
  );
}
