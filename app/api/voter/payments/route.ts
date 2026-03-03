import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  return proxyRequest(request, '/voter/payments');
}

export async function POST(request: Request) {
  return proxyRequest(request, '/voter/payments');
}
