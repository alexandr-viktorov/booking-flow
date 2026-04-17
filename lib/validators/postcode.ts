// Strips spaces and uppercases — canonical storage format
export function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

// UK postcode regex — covers standard formats
const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

export function isValidUKPostcode(raw: string): boolean {
  return UK_POSTCODE_RE.test(raw.trim());
}