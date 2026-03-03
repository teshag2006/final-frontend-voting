import { proxyRequest } from '@/app/api/_shared/proxy';

export async function GET(
  request: Request,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;
  return proxyRequest(
    request,
    `/public/category-info/${encodeURIComponent(categoryId)}`
  );
}
