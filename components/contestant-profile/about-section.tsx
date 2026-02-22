import Image from "next/image";
import { CheckCircle2, Play } from "lucide-react";
import type { ContestantProfile } from "@/types/contestant";

interface AboutSectionProps {
  contestant: ContestantProfile;
}

function getYouTubeVideoMeta(rawUrl?: string | null): { embedUrl: string; watchUrl: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const value = rawUrl.trim();
  if (!value || value === "#") return null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] || "";
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2] || "";
      }
    } else if (host === "youtu.be") {
      videoId = url.pathname.replace("/", "").split("?")[0] || "";
    }

    if (!videoId) return null;
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    return null;
  }
}

export function AboutSection({ contestant }: AboutSectionProps) {
  const safeAge =
    typeof contestant.age === "number" && Number.isFinite(contestant.age)
      ? String(contestant.age)
      : "Not provided";
  const safeCountry = contestant.country || "Pan-African";
  const safeCategory = contestant.category_name || "Contestant";
  const youtubeVideoMeta = getYouTubeVideoMeta(contestant.video_url);

  const highlights = [
    contestant.is_verified ? "Profile identity verified" : "Identity verification pending",
    contestant.blockchain_hash ? `Vote hash ${contestant.blockchain_hash}` : "Vote verification enabled",
    `Category: ${safeCategory}`,
    `Country: ${safeCountry}`,
  ];

  return (
    <section className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_45px_-30px_rgba(37,53,118,0.45)] backdrop-blur">
      <h2 className="text-2xl font-bold text-foreground">About {contestant.name}</h2>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="rounded-xl border border-border bg-white/80 p-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                <dd className="text-base font-semibold text-foreground">{contestant.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Age</dt>
                <dd className="text-base font-semibold text-foreground">{safeAge}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                <dd className="text-base font-semibold text-foreground">{safeCountry}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                <dd className="text-base font-semibold text-foreground">{safeCategory}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-5">
            <h3 className="text-lg font-semibold text-foreground">About</h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {contestant.bio}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {youtubeVideoMeta ? (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
              <iframe
                src={youtubeVideoMeta.embedUrl}
                title={`${contestant.name} introduction video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <a
                href={youtubeVideoMeta.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-sm font-semibold text-white transition-colors hover:bg-black/85"
              >
                Open on YouTube
              </a>
            </div>
          ) : contestant.video_thumbnail ? (
            <a
              href={contestant.video_url || "#"}
              target={contestant.video_url ? "_blank" : undefined}
              rel={contestant.video_url ? "noopener noreferrer" : undefined}
              className="group relative block aspect-video cursor-pointer overflow-hidden rounded-xl border border-border bg-black"
            >
              <Image
                src={contestant.video_thumbnail}
                alt={`${contestant.name} introduction video`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
              <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="ml-1 h-7 w-7 text-foreground" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8">
                <div className="text-sm font-semibold text-white">
                  Watch Introduction Video
                </div>
                <div className="mt-1 text-sm text-white/75">{contestant.name}</div>
              </div>
              <div className="absolute right-2 top-2 rounded bg-black/75 px-2 py-0.5 text-sm font-semibold text-white">
                1:42
              </div>
            </a>
          ) : null}

          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <ul className="space-y-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
