import { proxyRequest } from '@/app/api/_shared/proxy';

export async function DELETE(request: Request) {
  return proxyRequest(request, '/voter/account');
}
