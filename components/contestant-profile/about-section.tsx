import Image from "next/image";
import { Play } from "lucide-react";
import type { ContestantProfile } from "@/types/contestant";

interface AboutSectionProps {
  contestant: ContestantProfile;
}

export function AboutSection({ contestant }: AboutSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-foreground md:text-2xl">
        About {contestant.name}
      </h2>

      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        {/* Left: Details + Bio */}
        <div className="flex-1 min-w-0">
          {/* Info table */}
          <div className="rounded-xl border border-border bg-card p-5">
            <dl className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <dt className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
                  Full Name:
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {contestant.name}
                </dd>
              </div>
              <div className="flex items-center gap-4">
                <dt className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
                  Age:
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {contestant.age}
                </dd>
              </div>
              <div className="flex items-center gap-4">
                <dt className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
                  Country:
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {contestant.country}
                </dd>
              </div>
            </dl>
          </div>

          {/* Biography */}
          <div className="mt-5">
            <h3 className="text-base font-bold text-foreground">About</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {contestant.bio}
            </p>
          </div>
        </div>

        {/* Right: Video thumbnail */}
        {contestant.video_thumbnail && (
          <div className="w-full md:w-64 lg:w-72 shrink-0">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border cursor-pointer">
              <Image
                src={contestant.video_thumbnail}
                alt={`${contestant.name} introduction video`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 288px"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90 shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 text-foreground ml-0.5" />
                </div>
              </div>
              {/* Label */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90">
                  <Play className="h-3 w-3 text-foreground ml-0.5" />
                </div>
                <span className="text-xs font-medium text-card">
                  Watch Introduction Video
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
