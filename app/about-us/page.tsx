import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About Us | Miss & Mr Africa",
  description:
    "Learn about the mission, architecture, security model, and operating principles behind the Miss & Mr Africa voting platform.",
};

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            About Us
          </h1>
          <p className="text-lg text-gray-600">
            We built this platform to deliver trusted, transparent, and scalable
            digital voting for Miss &amp; Mr Africa. Our system is designed to
            protect vote integrity, provide role-based operational control, and
            give voters confidence that every valid vote is counted correctly.
          </p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="text-gray-600">
                Our mission is to make competition voting fair, auditable, and
                inclusive. We combine modern web performance with strong control
                mechanisms so organizers, contestants, sponsors, media teams,
                and voters can operate in one reliable ecosystem.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                What We Built
              </h2>
              <p className="text-gray-600">
                The platform includes complete role-based workflows:
                administration, voter wallet and vote history, contestant
                onboarding and profile control, media monitoring dashboards,
                sponsorship campaign tracking, and public-facing event and
                leaderboard pages.
              </p>
              <p className="mt-3 text-gray-600">
                We support free and paid vote journeys, transaction-style vote
                receipts, verification interfaces, and real-time ranking
                visibility with policy-backed moderation controls.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Integrity and Security Model
              </h2>
              <p className="text-gray-600">
                Integrity is enforced with layered safeguards: identity and
                session controls, role-gated operations, anomaly and abuse
                monitoring, immutable-style receipt tracing, and operational
                audit logs for sensitive actions.
              </p>
              <p className="mt-3 text-gray-600">
                Our goal is not only preventing manipulation but also making the
                platform behavior explainable and reviewable when disputes or
                audits occur.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Platform Architecture
              </h2>
              <p className="text-gray-600">
                The system uses a modular architecture with dedicated routes and
                API surfaces for each operational domain. This allows features
                to evolve independently while maintaining a consistent security
                baseline and a shared user experience across all roles.
              </p>
              <p className="mt-3 text-gray-600">
                We prioritize maintainability, observability, and predictable
                behavior under high traffic during peak voting windows.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Governance and Transparency
              </h2>
              <p className="text-gray-600">
                We publish policy pages and user-facing transparency resources
                so participants understand vote handling, restrictions, and
                dispute channels. Internal controls are aligned with those
                public commitments to keep platform governance consistent.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Our Commitment
              </h2>
              <p className="text-gray-600">
                We are committed to continuous improvement in reliability,
                fairness, and system clarity. As events grow, we continue
                strengthening fraud detection, audit depth, and operational
                tooling so the platform remains trusted at scale.
              </p>
              <p className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500">
                For platform questions, contact{" "}
                <a
                  href="mailto:support@votingplatform.com"
                  className="text-blue-600 hover:underline"
                >
                  support@votingplatform.com
                </a>
                .
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
