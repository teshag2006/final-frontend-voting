"use client";

import Link from "next/link";
import { Star, User, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Categories", href: "/categories" },
  { label: "How Voting Works", href: "/how-it-works" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Star className="h-7 w-7 text-amber-500 fill-amber-500 transition-transform group-hover:rotate-12" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            MISS <span className="font-normal text-muted-foreground">{"&"}</span> MR{" "}
            <span className="text-foreground">AFRICA</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Register
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <Link
              href="/login"
              className="flex-1 rounded-lg bg-secondary px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-card transition-colors hover:bg-foreground/90"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
