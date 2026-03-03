import { proxyRequest } from '@/app/api/_shared/proxy';

export async function POST(
  request: Request,
  context: { params: Promise<{ contestantId: string }> }
) {
  const { contestantId } = await context.params;
  return proxyRequest(
    request,
    `/admin/contestants/${encodeURIComponent(contestantId)}/profile-video`
  );
}
