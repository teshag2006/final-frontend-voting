import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Fraud Policy | Miss & Mr Africa",
  description:
    "Learn how we prevent, detect, and respond to suspicious voting activity.",
};

export default function FraudPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <h1 className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
            Fraud Policy
          </h1>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                1. Our Anti-Fraud Principles
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Protect fair competition for every contestant</li>
                <li>Detect suspicious patterns early</li>
                <li>Prevent abuse without blocking legitimate voters</li>
                <li>Maintain transparent audit trails for investigations</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                2. Prohibited Behavior
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Bot or script-based voting</li>
                <li>Fake account creation to bypass limits</li>
                <li>Use of stolen or unauthorized payment methods</li>
                <li>Coordinated manipulation of ranking outcomes</li>
                <li>Attempting to bypass security controls</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                3. Detection and Enforcement
              </h2>
              <p>
                We use layered controls such as device fingerprint checks, IP risk
                scoring, velocity monitoring, payment risk analysis, and behavioral
                anomaly detection.
              </p>
              <p className="mt-4">
                When abuse is detected, we may pause transactions, invalidate votes,
                suspend accounts, or permanently block access.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                4. Investigation Outcomes
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Suspicious votes may be removed from totals</li>
                <li>Related accounts may be reviewed and restricted</li>
                <li>Payment channels may be temporarily disabled</li>
                <li>Serious cases may be escalated to legal authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                5. Reporting Suspicious Activity
              </h2>
              <p>
                To report suspected fraud, contact:
                {" "}
                <a href="mailto:security@votingplatform.com">
                  security@votingplatform.com
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
