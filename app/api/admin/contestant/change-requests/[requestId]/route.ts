import { proxyRequest } from '@/app/api/_shared/proxy';

function resolvePath(params: { requestId: string }) {
  return `/admin/contestant/change-requests/${encodeURIComponent(params.requestId)}`;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}
