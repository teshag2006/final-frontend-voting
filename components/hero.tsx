import Link from "next/link";
import { Shield, AlertTriangle, BarChart3 } from "lucide-react";

interface HeroProps {
  eventName?: string;
  tagline?: string;
  isActive?: boolean;
}

const trustItems = [
  { icon: Shield, label: "Blockchain Secured", color: "text-emerald-500" },
  { icon: AlertTriangle, label: "Fraud Detection Enabled", color: "text-red-400" },
  { icon: BarChart3, label: "Real-Time Leaderboard", color: "text-sky-500" },
];

export function Hero({
  eventName = "Vote for Your Favorite Contestant",
  tagline = "Secure \u00B7 Blockchain Verified \u00B7 Fraud Protected",
  isActive = true,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f4e] via-[#2a2f6e] to-[#3a3f8e]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20px 30px, white, transparent), radial-gradient(1px 1px at 40px 70px, white, transparent), radial-gradient(1px 1px at 50px 160px, white, transparent), radial-gradient(1px 1px at 90px 40px, white, transparent), radial-gradient(1px 1px at 130px 80px, white, transparent), radial-gradient(1px 1px at 160px 120px, white, transparent)",
          backgroundSize: "200px 200px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />

      <div className="relative px-4 pb-10 pt-12 sm:px-8 lg:px-12 lg:pb-14 lg:pt-16">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl text-balance">
          {eventName}
        </h1>
        <p className="mt-3 text-base text-white/70 sm:text-lg">{tagline}</p>

        {isActive ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/vote"
              className="inline-flex items-center justify-center rounded-xl bg-[hsl(155,65%,42%)] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[hsl(155,65%,36%)] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              Start Voting
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center rounded-xl border border-[hsl(155,65%,42%)] px-7 py-3 text-sm font-semibold text-[hsl(155,65%,50%)] transition-all hover:bg-[hsl(155,65%,42%)]/10 active:scale-[0.98]"
            >
              View Leaderboard
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-white/80">
              Voting is not active at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="relative border-t border-white/10 bg-card/90 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-4 sm:gap-10 lg:justify-start lg:px-12">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
