import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { slugify } from '@/lib/slug';

const AWS_REGION = process.env.AWS_REGION || '';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || '';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_S3_PUBLIC_BASE_URL = process.env.AWS_S3_PUBLIC_BASE_URL || '';

function ensureS3Config() {
  if (!AWS_REGION || !AWS_S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      'AWS S3 is not configured. Set AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.'
    );
  }
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

function extensionFromContentType(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return 'ico';
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
      return 'mov';
    case 'audio/mpeg':
      return 'mp3';
    case 'audio/wav':
      return 'wav';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}

function parseDataUrl(dataUrl: string): { contentType: string; bytes: Uint8Array } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image payload. Expected a base64 data URL.');
  }
  const contentType = match[1].trim().toLowerCase();
  if (!contentType.startsWith('image/')) {
    throw new Error('Only image uploads are supported.');
  }
  const bytes = Buffer.from(match[2], 'base64');
  return { contentType, bytes };
}

function buildPublicUrl(key: string) {
  if (AWS_S3_PUBLIC_BASE_URL) {
    return `${AWS_S3_PUBLIC_BASE_URL.replace(/\/+$/, '')}/${key}`;
  }
  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 120) || 'file';
}

function extensionFromFileName(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) return '';
  const ext = parts[parts.length - 1].toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : '';
}

export async function uploadBinaryToS3(payload: {
  bytes: Uint8Array;
  contentType: string;
  prefix?: string;
  fileName?: string;
}) {
  ensureS3Config();
  const prefix = payload.prefix || 'uploads';
  const contentType = String(payload.contentType || 'application/octet-stream').toLowerCase();
  const normalizedName = sanitizeFileName(payload.fileName || 'file');
  const nameWithoutExt = normalizedName.includes('.')
    ? normalizedName.slice(0, normalizedName.lastIndexOf('.'))
    : normalizedName;
  const fileSlug = slugify(nameWithoutExt || 'file');
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const extFromName = extensionFromFileName(normalizedName);
  const extFromType = extensionFromContentType(contentType);
  const ext = extFromName || extFromType;
  const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${fileSlug}-${uniqueSuffix}${ext ? `.${ext}` : ''}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: payload.bytes,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return buildPublicUrl(key);
}

export async function uploadImageDataUrlToS3(dataUrl: string, prefix = 'contestant-media/gallery') {
  const { contentType, bytes } = parseDataUrl(dataUrl);
  return uploadBinaryToS3({
    bytes,
    contentType,
    prefix,
    fileName: `image.${extensionFromContentType(contentType)}`,
  });
}
