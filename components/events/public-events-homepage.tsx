'use client';

import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { mockArchivedEvents, mockEvents } from '@/lib/events-mock';
import { Button } from '@/components/ui/button';

type CounterMetric = {
  label: string;
  value: number;
  suffix?: string;
};

const metrics: CounterMetric[] = [
  { label: 'Total Votes Cast', value: 18732400 },
  { label: 'Active Events', value: 4 },
  { label: 'Total Sponsors', value: 320 },
  { label: 'Integrity Score', value: 99.8, suffix: '%' },
];

const trendingContestants = [
  {
    id: 'c-1',
    name: 'Amina Tesfaye',
    rank: 1,
    votes: 926412,
    tier: 'A',
    trending: true,
    integrity: 'Verified Integrity',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=700&h=900&fit=crop',
  },
  {
    id: 'c-2',
    name: 'Dawit Kimani',
    rank: 2,
    votes: 884191,
    tier: 'A',
    trending: true,
    integrity: 'Verified Integrity',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&h=900&fit=crop',
  },
  {
    id: 'c-3',
    name: 'Lulit\ Bekele',
    rank: 3,
    votes: 813335,
    tier: 'B',
    trending: false,
    integrity: 'Verified Integrity',
    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=700&h=900&fit=crop',
  },
  {
    id: 'c-4',
    name: 'Samuel Odhiambo',
    rank: 4,
    votes: 792040,
    tier: 'B',
    trending: true,
    integrity: 'Under Review',
    image:
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=700&h=900&fit=crop',
  },
];

const sponsorBanners = [
  {
    id: 'sp-1',
    title: 'Castaway Collective',
    subtitle: 'Verified Sponsor Network',
    detail: '43 active campaigns across live events',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&h=500&fit=crop',
  },
  {
    id: 'sp-2',
    title: 'Swift Scale Media',
    subtitle: 'Enterprise Sponsorship',
    detail: 'Premium brand placements with full campaign tracking',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&h=500&fit=crop',
  },
];

const featuredSponsors = [
  { name: 'FTLD', industry: 'Technology', campaigns: 43 },
  { name: 'Swift', industry: 'Telecom', campaigns: 33 },
  { name: 'Zenith', industry: 'Finance', campaigns: 21 },
];

const howItWorks = [
  {
    title: 'For Voters',
    body: 'Browse live events, cast secure votes, and monitor leaderboard movement in real time.',
    cta: 'Start Voting',
    href: '/events',
    icon: Trophy,
  },
  {
    title: 'For Contestants',
    body: 'Join verified events, grow your influence footprint, and unlock sponsorship opportunities.',
    cta: 'Explore Contestant Portal',
    href: '/events/contestant/dashboard',
    icon: TrendingUp,
  },
  {
    title: 'For Sponsors',
    body: 'Discover high-integrity contestants, launch campaigns, and measure performance transparently.',
    cta: 'Start Sponsoring',
    href: '/sponsors',
    icon: Sparkles,
  },
];

function useAnimatedCounter(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const started = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / durationMs);
      setValue(target * progress);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function formatCount(value: number, suffix?: string) {
  if (suffix === '%') return `${value.toFixed(1)}${suffix}`;
  return Math.round(value).toLocaleString();
}

function getCountdownLabel(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return 'Live now';
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `${days} day${days > 1 ? 's' : ''} left`;
}

function EventMetric({ label, value, suffix }: CounterMetric) {
  const animated = useAnimatedCounter(value);
  return (
    <div className="flex items-center gap-2 border-r border-white/15 px-4 last:border-r-0">
      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
      <div>
        <p className="text-2xl font-semibold text-white">{formatCount(animated, suffix)}</p>
        <p className="text-xs uppercase tracking-[0.08em] text-slate-300">{label}</p>
      </div>
    </div>
  );
}

export function PublicEventsHomepage() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setNavCollapsed(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % sponsorBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const liveEvents = useMemo(
    () => mockEvents.filter((event) => event.status === 'LIVE' || event.status === 'active'),
    []
  );
  const upcomingEvents = useMemo(
    () => mockEvents.filter((event) => event.status === 'UPCOMING' || event.status === 'coming_soon'),
    []
  );
  const archivedEvents = useMemo(
    () => [...mockEvents, ...mockArchivedEvents].filter(
      (event) => event.status === 'ARCHIVED' || event.status === 'cancelled'
    ),
    []
  );
  const primaryEventSlug = liveEvents[0]?.slug || upcomingEvents[0]?.slug || mockEvents[0]?.slug;
  const primaryEventHref = primaryEventSlug ? `/events/${primaryEventSlug}` : '/events';
  const primaryLeaderboardHref = primaryEventSlug
    ? `/events/${primaryEventSlug}/leaderboard`
    : '/events';
  const navMenuItems: Array<[string, string]> = [
    ['Events', '#live-events'],
    ['Live Leaderboard', primaryLeaderboardHref],
    ['Sponsors', '#sponsors'],
    ['How It Works', '#how-it-works'],
    ['Archive', '/events/archive'],
    ['About', '/how-it-works'],
  ];

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Live and Upcoming Voting Events',
    itemListElement: [...liveEvents, ...upcomingEvents].map((event, index) => ({
      '@type': 'Event',
      position: index + 1,
      name: event.name,
      startDate: event.start_date,
      endDate: event.end_date,
      eventStatus: event.status,
      image: event.banner_url,
      description: event.description,
      location: {
        '@type': 'Place',
        name: event.location || 'Pan-African',
      },
      url: `/events/${event.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#050a1c] text-white">
      <Script id="events-schema" type="application/ld+json">
        {JSON.stringify(eventSchema)}
      </Script>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          navCollapsed
            ? 'border-white/10 bg-[#050a1c]/95 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl'
            : 'border-transparent bg-[#050a1c]/70 py-4 backdrop-blur-md'
        }`}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/events" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-900">
              <Star className="h-4 w-4" />
            </span>
            <span className="font-serif text-xl tracking-tight text-white">Campus Star</span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navMenuItems.map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-slate-100 hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link href="/login" className="hidden text-sm text-slate-200 hover:text-white sm:inline-block">
              Login
            </Link>
            <Link href="/register" className="hidden text-sm text-slate-200 hover:text-white sm:inline-block">
              Register
            </Link>
            <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
              <Link href="/sponsors">Start Sponsoring</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=2000&h=1200&fit=crop"
              alt="Crowd at a live event"
              fill
              priority
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.38),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(217,119,6,0.28),transparent_38%),linear-gradient(to_bottom,rgba(5,10,28,0.35),rgba(5,10,28,0.95))]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pt-24">
            <div className="max-w-3xl animate-[fade-in_600ms_ease-out]">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-200">
                Trusted Public Voting Platform
              </p>
              <h1 className="font-serif text-5xl leading-tight text-white md:text-6xl">
                Where Influence Meets Integrity.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-200">
                Africa’s most trusted voting & sponsorship platform built for transparent scale,
                enterprise compliance, and real-time engagement.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className="h-11 bg-amber-400 px-6 text-slate-950 hover:bg-amber-300">
                  <Link href={primaryEventHref}>Vote Now</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/30 bg-white/5 px-6 text-white hover:bg-white/10">
                  <Link href="#live-events">Discover Events</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 border-emerald-300/40 bg-emerald-400/10 px-6 text-emerald-100 hover:bg-emerald-400/20">
                  <Link href="/sponsors">Become a Sponsor</Link>
                </Button>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_45px_rgba(2,8,23,0.42)] backdrop-blur-xl">
              <div className="grid gap-4 md:grid-cols-5">
                {metrics.map((metric) => (
                  <EventMetric key={metric.label} {...metric} />
                ))}
                <div className="flex items-center justify-end px-2">
                  <Button asChild variant="outline" className="border-emerald-300/50 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20">
                    <Link href="#pwa-strip">Install App</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="live-events" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-4xl text-white">
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              Live Voting Events
            </h2>
            <Link href="#live-events" className="text-sm text-slate-200 hover:text-white">
              View All Events <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {liveEvents.map((event, index) => (
              <article
                key={event.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d1738] shadow-[0_10px_35px_rgba(2,8,23,0.45)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(15,23,42,0.6)]"
              >
                <div className="relative h-56">
                  <Image src={event.banner_url} alt={event.name} fill className="object-cover transition group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030617] via-[#03061766] to-transparent" />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    LIVE
                  </div>
                  {index % 2 === 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-400/90 px-2 py-1 text-xs font-semibold text-slate-900">
                      Sponsored
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs text-slate-100">
                    <Clock3 className="h-3.5 w-3.5" />
                    {getCountdownLabel(event.end_date)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-2xl text-white">{event.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">{event.description}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {(19200 + index * 7800).toLocaleString()} votes cast
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button asChild className="flex-1 bg-amber-400 text-slate-950 hover:bg-amber-300">
                      <Link href={`/events/${event.slug}`}>Vote Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-white/25 bg-white/5 text-white hover:bg-white/10">
                      <Link href={`/events/${event.slug}/leaderboard`}>View Leaderboard</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl text-white">Trending Contestants</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trendingContestants.map((contestant) => (
              <article key={contestant.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1738]">
                <div className="relative h-52">
                  <Image src={contestant.image} alt={contestant.name} fill className="object-cover" />
                  <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs text-slate-100">
                    Rank #{contestant.rank}
                  </div>
                  {contestant.trending && (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-1 text-xs font-semibold text-white">
                      <Flame className="h-3.5 w-3.5" />
                      Trending
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <p className="font-semibold text-white">{contestant.name}</p>
                  <p className="text-sm text-slate-300">{contestant.votes.toLocaleString()} votes</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-400/25 px-2 py-1 text-amber-200">Tier {contestant.tier}</span>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-emerald-200">{contestant.integrity}</span>
                  </div>
                  <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20">
                    <Link href={primaryEventHref}>Quick Vote</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="sponsors" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/15">
            <Image src={sponsorBanners[bannerIndex].image} alt={sponsorBanners[bannerIndex].title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a122f]/95 via-[#0a122f]/75 to-[#0a122f]/45" />
            <div className="relative flex flex-wrap items-center justify-between gap-4 p-7">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Sponsor Showcase</p>
                <h3 className="mt-2 font-serif text-3xl text-white">{sponsorBanners[bannerIndex].title}</h3>
                <p className="mt-1 text-slate-200">{sponsorBanners[bannerIndex].subtitle}</p>
                <p className="text-sm text-slate-300">{sponsorBanners[bannerIndex].detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-white/10 hover:bg-white/20"
                  onClick={() => setBannerIndex((prev) => (prev - 1 + sponsorBanners.length) % sponsorBanners.length)}
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-white/10 hover:bg-white/20"
                  onClick={() => setBannerIndex((prev) => (prev + 1) % sponsorBanners.length)}
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {featuredSponsors.map((sponsor) => (
              <article key={sponsor.name} className="rounded-2xl border border-white/10 bg-[#0d1738] p-4">
                <p className="font-serif text-2xl text-white">{sponsor.name}</p>
                <p className="mt-1 text-sm text-slate-300">{sponsor.industry}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Sponsor
                </div>
                <p className="mt-3 text-sm text-slate-200">{sponsor.campaigns} active campaigns</p>
              </article>
            ))}
          </div>

          <div className="mt-6">
            <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
              <Link href="/sponsors">Explore Sponsorship Opportunities</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-[#0d1738] p-6">
            <h2 className="font-serif text-4xl text-white">Platform Trust</h2>
            <p className="mt-2 max-w-3xl text-slate-300">
              AI integrity monitoring, anti-fraud detection, real-time auditing, and transparent vote
              tracking are embedded across every event.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['AI Integrity Monitoring', '99.8% confidence score'],
                ['Fraud Detection', 'Instant anomaly flagging'],
                ['Real-Time Auditing', 'Every vote traceable'],
                ['Transparent Tracking', 'Public results visibility'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-[#0a1129] p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-2 font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-4xl text-white">Upcoming Events</h2>
            <Link href="#live-events" className="text-sm text-slate-200 hover:text-white">
              Discover Events
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingEvents.map((event) => (
              <article key={event.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1738]">
                <div className="relative h-48">
                  <Image src={event.banner_url} alt={event.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">
                    <Calendar className="h-3.5 w-3.5" />
                    {getCountdownLabel(event.start_date)}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl text-white">{event.name}</h3>
                  <div className="mt-4 flex items-center gap-2">
                    <Button asChild className="flex-1 bg-white/10 text-white hover:bg-white/20">
                      <Link href={`/events/${event.slug}`}>Notify Me</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                      <Link href={`/events/${event.slug}`}>Share</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl text-white">How It Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-[#0d1738] p-5">
                  <Icon className="h-5 w-5 text-amber-300" />
                  <h3 className="mt-3 font-serif text-2xl text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.body}</p>
                  <Link href={item.href} className="mt-4 inline-block text-sm text-emerald-200 hover:text-emerald-100">
                    {item.cta} <ArrowRight className="ml-1 inline h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section id="archive" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-4xl text-white">Past Events Archive</h2>
            <Link href="/events/archive" className="text-sm text-slate-200 hover:text-white">
              View Full Archive
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {archivedEvents.slice(0, 3).map((event) => (
              <article key={event.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1738]">
                <div className="relative h-44">
                  <Image src={event.banner_url} alt={event.name} fill className="object-cover opacity-90" />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-2xl text-white">{event.name}</h3>
                  <p className="mt-2 text-sm text-amber-200">
                    Winner Highlight: {event.name.split(' ')[0]} Champion
                  </p>
                  <Button asChild variant="outline" className="mt-4 border-white/25 bg-white/5 text-white hover:bg-white/10">
                    <Link href={`/events/${event.slug}/results`}>View Results</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="pwa-strip" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-300/30 bg-gradient-to-r from-emerald-400/15 via-emerald-300/10 to-cyan-300/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-emerald-100">Install App for Faster Voting & Live Notifications</p>
                <p className="text-sm text-slate-200">Optimized mobile voting with real-time leaderboard updates.</p>
              </div>
              <div className="flex gap-2">
                <Button asChild className="bg-emerald-300 text-slate-900 hover:bg-emerald-200">
                  <Link href={primaryEventHref}>Install</Link>
                </Button>
                <Button asChild variant="outline" className="border-emerald-200/40 bg-transparent text-emerald-100 hover:bg-emerald-200/10">
                  <Link href="/how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t border-white/10 bg-[#020616]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div>
            <h4 className="font-semibold text-white">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/events">Events</Link></li>
              <li><Link href={primaryLeaderboardHref}>Leaderboard</Link></li>
              <li><Link href="/sponsors">Sponsors</Link></li>
              <li><Link href="/events/archive">Archive</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/how-it-works">About</Link></li>
              <li><Link href="/events">Careers</Link></li>
              <li><Link href="/events">Press</Link></li>
              <li><Link href="/notifications">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/events">Anti-Fraud Policy</Link></li>
              <li><Link href="/events">Sponsorship Guidelines</Link></li>
              <li><Link href="/events">Compliance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Social</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              <li><a href="https://x.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Newsletter</h4>
            <p className="mt-3 text-sm text-slate-300">Receive event launches and sponsor opportunities.</p>
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400"
              />
              <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                <Link href="/register">Join</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8">
            <p>© 2026 Campus Star. All rights reserved.</p>
            <p>Version 1.0 · Enterprise Public Homepage</p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Button asChild className="bg-amber-400 text-slate-950 shadow-lg hover:bg-amber-300">
          <Link href={primaryEventHref}>Vote Now</Link>
        </Button>
      </div>
    </div>
  );
}

