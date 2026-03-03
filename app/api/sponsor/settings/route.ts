import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  return proxyRequest(request, '/sponsor/settings');
}

export async function POST(request: Request) {
  return proxyRequest(request, '/sponsor/settings');
}

export async function PATCH(request: Request) {
  return proxyRequest(request, '/sponsor/settings');
}

export async function PUT(request: Request) {
  return proxyRequest(request, '/sponsor/settings');
}

export async function DELETE(request: Request) {
  return proxyRequest(request, '/sponsor/settings');
}
