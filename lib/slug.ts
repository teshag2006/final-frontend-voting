export function slugify(input: string) {
  const value = String(input || '').trim().toLowerCase();
  const ascii = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const slug = ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug || 'item';
}

export function makeUniqueSlug(
  requested: string,
  used: Set<string>,
  fallback = 'item'
) {
  const base = slugify(requested || fallback);
  let candidate = base;
  let counter = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  used.add(candidate);
  return candidate;
}

