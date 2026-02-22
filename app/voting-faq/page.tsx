import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProfileFAQ } from "@/components/contestant-profile/profile-faq";
import { mockProfileFAQ } from "@/lib/contestant-profile-mock";

export const metadata: Metadata = {
  title: "Voting FAQ | Miss & Mr Africa",
  description: "Answers to common voting questions, limits, pricing, and verification.",
};

export default function VotingFAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef2ff_45%,#e7ecff_100%)]">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_-30px_rgba(37,53,118,0.45)] backdrop-blur">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Voting FAQ
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Everything you need to know about free votes, paid votes, limits, and vote verification.
            </p>
          </div>

          <div className="mt-6">
            <ProfileFAQ items={mockProfileFAQ} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
