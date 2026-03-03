import { proxyRequest } from '@/app/api/_shared/proxy';

function resolvePath(params: { campaignId: string }) {
  return `/contestant/sponsors/contracts/${encodeURIComponent(params.campaignId)}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ campaignId: string }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}
