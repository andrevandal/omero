/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to slug
 * @returns A slugified string
 */
export const slugify = (text: string): string => text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
