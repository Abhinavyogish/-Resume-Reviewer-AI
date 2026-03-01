export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function toLower(text: string): string {
  return text.toLowerCase();
}

export function stripSpecialChars(text: string): string {
  return text.replace(/[^\w\s.,;:!?-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

export function normalizeText(text: string): string {
  return stripSpecialChars(collapseWhitespace(toLower(text)));
}

export function normalizeForDisplay(text: string): string {
  return collapseWhitespace(text);
}
