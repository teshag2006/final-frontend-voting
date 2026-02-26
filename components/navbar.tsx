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
  { label: "About Us", href: "/about-us" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Categories", href: "/categories" },
  { label: "How Voting Works", href: "/how-it-works" },
];

export function Navbar({ variant = "default" }: { variant?: "default" | "topbar-dark" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = variant === "topbar-dark";

  return (
    <header
      className={
        isDark
          ? "sticky top-0 z-50 border-b border-white/10 bg-[#050a1c]/95 backdrop-blur-xl"
          : "sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md"
      }
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Star className={`h-7 w-7 transition-transform group-hover:rotate-12 ${isDark ? "fill-amber-400 text-amber-400" : "fill-amber-500 text-amber-500"}`} />
          <span className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-foreground"}`}>
            MISS <span className={isDark ? "font-normal text-slate-300" : "font-normal text-muted-foreground"}>{"&"}</span> MR{" "}
            <span className={isDark ? "text-white" : "text-foreground"}>AFRICA</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  isDark
                    ? "rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                }
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
            className={
              isDark
                ? "rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                : "rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={
              isDark
                ? "rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                : "rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            Register
          </Link>
          <div className={isDark ? "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5" : "flex h-9 w-9 items-center justify-center rounded-full bg-secondary"}>
            <User className={isDark ? "h-4 w-4 text-slate-100" : "h-4 w-4 text-muted-foreground"} />
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={
            isDark
              ? "flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 md:hidden"
              : "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          }
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={isDark ? "border-t border-white/10 bg-[#050a1c] px-4 pb-4 pt-2 md:hidden" : "border-t border-border bg-card px-4 pb-4 pt-2 md:hidden"}>
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    isDark
                      ? "block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                      : "block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={isDark ? "mt-3 flex items-center gap-2 border-t border-white/10 pt-3" : "mt-3 flex items-center gap-2 border-t border-border pt-3"}>
            <Link
              href="/login"
              className={isDark ? "flex-1 rounded-lg bg-white/10 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/20" : "flex-1 rounded-lg bg-secondary px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"}
            >
              Login
            </Link>
            <Link
              href="/signup"
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
