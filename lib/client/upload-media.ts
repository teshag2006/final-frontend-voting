export async function uploadMediaFile(file: File, prefix: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prefix', prefix);

  const response = await fetch('/api/upload/media', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.message || 'Media upload failed');
  }

  return payload.url;
}

