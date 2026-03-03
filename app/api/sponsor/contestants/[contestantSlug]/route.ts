import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(
  request: Request,
  context: { params: Promise<{ contestantSlug: string }> }
) {
  const { contestantSlug } = await context.params;
  return proxyRequest(
    request,
    `/sponsor/contestants/${encodeURIComponent(contestantSlug)}`
  );
}
