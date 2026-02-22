import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Transparency Statement | Miss & Mr Africa",
  description:
    "Official statement on vote integrity, verification, and platform transparency.",
};

export default function TransparencyStatementPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <h1 className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
            Transparency Statement
          </h1>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                1. Vote Integrity Commitment
              </h2>
              <p>
                We are committed to fair, auditable, and secure voting outcomes.
                Votes are monitored in real time with automated and manual checks
                to protect result integrity.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                2. Verification and Auditability
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Every vote transaction generates a traceable receipt</li>
                <li>Batch-level verification and monitoring are continuously applied</li>
                <li>Suspicious patterns are reviewed and documented</li>
                <li>Material enforcement actions are retained in audit logs</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                3. Security Controls
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Layered abuse detection and anti-manipulation rules</li>
                <li>Session and account protection controls</li>
                <li>Payment and transaction risk monitoring</li>
                <li>Continuous platform hardening and incident response</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                4. User Visibility
              </h2>
              <p>
                Public pages surface voting data, rankings, and trust indicators.
                Voters can verify receipts and review platform policies through the
                public transparency resources.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                5. Contact
              </h2>
              <p>
                For transparency concerns or verification questions, contact:
                {" "}
                <a href="mailto:support@votingplatform.com">
                  support@votingplatform.com
                </a>
              </p>
            </section>

            <p className="border-t border-gray-200 pt-8 text-sm text-gray-500">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
