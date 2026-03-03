import { proxyRequest } from '@/app/api/_shared/proxy';

function resolvePath(params: { offerId: string }) {
  return `/contestant/sponsors/offers/${encodeURIComponent(params.offerId)}`;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ offerId: string }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}
