export function createSlug(text: string): string {
  if (!text) {
    return "";
  }

  const noDiacritics = text.normalize("NFD").replace(/\p{Diacritic}+/gu, "");

  const lower = noDiacritics.toLowerCase();

  const hyphenated = lower.replace(/[^a-z0-9]+/g, "-");

  const compact = hyphenated.replace(/-+/g, "-").replace(/^-|-$/g, "");

  return compact;
}
