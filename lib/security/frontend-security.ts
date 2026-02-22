export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ProfileInput {
  username?: string;
  bio?: string;
  location?: string;
  phone?: string;
}

export function sanitizePlainText(input: string, maxLength?: number): string {
  const withoutTags = input.replace(/<[^>]*>/g, '');
  const collapsed = withoutTags.replace(/\s+/g, ' ').trim();
  if (!maxLength) return collapsed;
  return collapsed.slice(0, maxLength);
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Use JPEG, PNG, or WEBP.' };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'File too large. Maximum allowed size is 5MB.' };
  }

  return { valid: true };
}

export function validateProfileInput(input: ProfileInput): ValidationResult {
  if (input.username) {
    const username = input.username.trim();
    if (username.length < 3 || username.length > 30) {
      return { valid: false, error: 'Username must be between 3 and 30 characters.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only include letters, numbers, and underscores.' };
    }
  }

  if (input.bio && sanitizePlainText(input.bio).length > 500) {
    return { valid: false, error: 'Bio must be 500 characters or less.' };
  }

  if (input.location && sanitizePlainText(input.location).length > 100) {
    return { valid: false, error: 'Location must be 100 characters or less.' };
  }

  if (input.phone) {
    const phone = input.phone.trim();
    if (!/^[0-9+\-()\s]{7,20}$/.test(phone)) {
      return { valid: false, error: 'Phone format is invalid.' };
    }
  }

  return { valid: true };
}
