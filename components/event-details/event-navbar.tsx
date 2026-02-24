"use client";

import Link from "next/link";
import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "FAQ", href: "#faq" },
  { label: "Verify Vote", href: "/verify" },
];

export function EventNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-blue-900 bg-gradient-to-r from-slate-900 to-blue-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Trophy className="h-6 w-6 text-amber-400 transition-transform group-hover:rotate-12" />
          <span className="text-base font-bold text-primary-foreground">
            Talent Voting
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-100/80 transition-colors hover:text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-amber-400 px-4 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-300"
          >
            Register
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-100/80 transition-colors hover:bg-white/10 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-900/95 backdrop-blur-md px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-100/80 transition-colors hover:text-white hover:bg-white/10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
            <Link
              href="/login"
              className="flex-1 rounded-lg border border-white/30 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex-1 rounded-lg bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-300"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
