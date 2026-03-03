import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  return proxyRequest(request, '/admin/settings');
}

export async function PATCH(request: Request) {
  return proxyRequest(request, '/admin/settings');
}
