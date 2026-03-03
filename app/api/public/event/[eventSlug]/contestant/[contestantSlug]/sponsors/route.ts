import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(
  request: Request,
  context: { params: Promise<{ eventSlug: string; contestantSlug: string }> }
) {
  const { eventSlug, contestantSlug } = await context.params;
  return proxyRequest(
    request,
    `/public/event/${encodeURIComponent(eventSlug)}/contestant/${encodeURIComponent(contestantSlug)}/sponsors`
  );
}
