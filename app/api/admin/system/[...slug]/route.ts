import { proxyRequest } from '@/app/api/_shared/proxy';

function resolvePath(params: { slug?: string[] }) {
  const segments = Array.isArray(params.slug) ? params.slug : [];
  return `/admin/system/${segments.map(encodeURIComponent).join('/')}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, resolvePath(params));
}
