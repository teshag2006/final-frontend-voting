import { proxyRequest } from '@/app/api/_shared/proxy';

export async function POST(request: Request) {
  return proxyRequest(request, '/voter/vote');
}
