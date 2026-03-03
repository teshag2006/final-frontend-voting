import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  return proxyRequest(request, '/contestant/ranking');
}

export async function POST(request: Request) {
  return proxyRequest(request, '/contestant/ranking');
}

export async function PATCH(request: Request) {
  return proxyRequest(request, '/contestant/ranking');
}

export async function PUT(request: Request) {
  return proxyRequest(request, '/contestant/ranking');
}

export async function DELETE(request: Request) {
  return proxyRequest(request, '/contestant/ranking');
}
