import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  return proxyRequest(request, '/contestant/media');
}

export async function POST(request: Request) {
  return proxyRequest(request, '/contestant/media');
}

export async function DELETE(request: Request) {
  return proxyRequest(request, '/contestant/media');
}
