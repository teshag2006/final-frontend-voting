"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { Event } from "@/types/event";
import { useEffect, useState } from "react";

interface EventHeroProps {
  event: Event;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-bold text-foreground tabular-nums md:text-2xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function HeroCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl bg-card/90 backdrop-blur-sm px-4 py-2.5 shadow-sm border border-border">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">Apr</span>
      <div className="flex items-center gap-3">
        <CountdownUnit value={timeLeft.days} label="Days" />
        <CountdownUnit value={timeLeft.hours} label="Hours" />
        <CountdownUnit value={timeLeft.minutes} label="Min" />
        <CountdownUnit value={timeLeft.seconds} label="" />
      </div>
    </div>
  );
}

export function EventHero({ event }: EventHeroProps) {
  const isActive = event.status === "active";

  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {event.banner_url && (
          <Image
            src={event.banner_url}
            alt={`${event.name} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-28 lg:px-8 lg:pb-12 lg:pt-36">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl text-balance">
            {event.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80 md:text-base lg:max-w-lg">
            {event.tagline ?? event.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isActive ? (
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-md transition-all hover:bg-accent/90 hover:shadow-lg active:scale-[0.97]"
              >
                Vote Now
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-6 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-60"
              >
                Voting Closed
              </button>
            )}
            <Link
              href={`/events/${event.slug}/leaderboard`}
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              View Leaderboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Countdown */}
          <div className="mt-8">
            <HeroCountdown targetDate={event.end_date} />
          </div>
        </div>
      </div>
    </section>
  );
}
