import { redirect } from 'next/navigation';

export default async function LegacyContestantProfilePage({
  params,
}: {
  params: Promise<{ slug: string; contestantSlug: string }>;
}) {
  const { slug, contestantSlug } = await params;
  redirect(`/events/${slug}/contestant/${contestantSlug}`);
}

