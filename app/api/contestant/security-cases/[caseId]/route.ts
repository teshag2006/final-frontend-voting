import { proxyRequest } from '@/app/api/_shared/proxy';

function resolvePath(params: { caseId: string }) {
  return `/contestant/security-cases/${encodeURIComponent(params.caseId)}`;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}
