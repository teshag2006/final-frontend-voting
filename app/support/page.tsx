import Link from 'next/link';

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Support</h1>
      <p className="mt-4 text-muted-foreground">
        Need help with voting, payments, or receipt verification? Use one of the
        options below.
      </p>

      <div className="mt-8 space-y-4">
        <p>
          Email: <a href="mailto:support@example.com">support@example.com</a>
        </p>
        <p>
          Visit <Link href="/voting-faq">Voting FAQ</Link> for common questions.
        </p>
        <p>
          Check vote receipt status at <Link href="/verify">/verify</Link>.
        </p>
      </div>
    </main>
  );
}
