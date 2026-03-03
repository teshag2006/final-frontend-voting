import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(
  request: Request,
  context: { params: Promise<{ eventSlug: string }> }
) {
  const { eventSlug } = await context.params;
  return proxyRequest(
    request,
    `/public/event/${encodeURIComponent(eventSlug)}/sponsors`
  );
}
