import { NextRequest, NextResponse } from 'next/server';
import { uploadBinaryToS3 } from '@/lib/server/s3-media-storage';

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function isAllowedContentType(contentType: string) {
  const normalized = contentType.toLowerCase();
  return (
    normalized.startsWith('image/') ||
    normalized.startsWith('video/') ||
    normalized.startsWith('audio/') ||
    normalized === 'application/pdf'
  );
}

function sanitizePrefix(raw: string) {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '')
    .replace(/^\/+|\/+$/g, '');
  return cleaned || 'uploads';
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const prefixRaw = String(formData.get('prefix') || '');
  const prefix = sanitizePrefix(prefixRaw);

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'file is required' }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ message: 'Uploaded file is empty' }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ message: 'File exceeds maximum allowed size (20MB)' }, { status: 400 });
  }

  const contentType = String(file.type || '').trim().toLowerCase();
  if (!contentType || !isAllowedContentType(contentType)) {
    return NextResponse.json({ message: 'Unsupported media type' }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const url = await uploadBinaryToS3({
      bytes,
      contentType,
      prefix,
      fileName: file.name || 'upload',
    });
    return NextResponse.json({
      url,
      contentType,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

