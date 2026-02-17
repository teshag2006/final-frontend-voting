'use server';

/**
 * HTML Sanitization - Remove potentially dangerous HTML/script tags
 * This is a basic implementation. For production, use DOMPurify library.
 */

// Tags and attributes that are allowed
const ALLOWED_TAGS = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'a', 'ul', 'ol', 'li'];
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title'],
};

// Regex patterns for dangerous content
const DANGEROUS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /on\w+\s*=\s*[^\s>]*/gi,
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /<object[^>]*>[\s\S]*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<img[^>]*onerror[^>]*>/gi,
];

export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove any remaining HTML except allowed tags
  sanitized = sanitized.replace(/<[^>]+>/g, (tag) => {
    const tagName = tag.match(/<\/?\s*([^\s>/]+)/)?.[1]?.toLowerCase();
    
    if (!tagName || !ALLOWED_TAGS.includes(tagName)) {
      return '';
    }

    // For allowed tags, check attributes
    if (ALLOWED_ATTRIBUTES[tagName as keyof typeof ALLOWED_ATTRIBUTES]) {
      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName as keyof typeof ALLOWED_ATTRIBUTES];
      let cleanTag = `<${tagName}`;
      
      const attrMatches = tag.match(/\s+([a-zA-Z-]+)\s*=\s*["']([^"']*)["']/g);
      if (attrMatches) {
        attrMatches.forEach((attr) => {
          const [, attrName, attrValue] = attr.match(/\s+([a-zA-Z-]+)\s*=\s*["']([^"']*)["']/) || [];
          if (allowedAttrs.includes(attrName)) {
            cleanTag += ` ${attrName}="${escapeAttribute(attrValue)}"`;
          }
        });
      }
      
      cleanTag += tag.endsWith('/') ? '/>' : '>';
      return cleanTag;
    }

    return `<${tagName}>`;
  });

  return sanitized;
}

/**
 * Escape attribute values to prevent XSS
 */
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate URL safety
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    // Only allow http, https, and mailto
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Strip all HTML tags (returns plain text)
 */
export function stripHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize JSON before rendering
 */
export function sanitizeJSON(json: any): any {
  if (typeof json === 'string') {
    return sanitizeHTML(json);
  }
  
  if (Array.isArray(json)) {
    return json.map(sanitizeJSON);
  }
  
  if (json !== null && typeof json === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(json)) {
      sanitized[key] = sanitizeJSON(value);
    }
    return sanitized;
  }
  
  return json;
}
