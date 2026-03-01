export interface BiasFlag {
  code: string;
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'assertive', 'competitive', 'dominant', 'driven',
  'independent', 'lead', 'analytical', 'determined', 'headstrong', 'decisive',
];

const FEMININE_CODED = [
  'collaborative', 'compassionate', 'nurturing', 'supportive', 'understand',
  'cooperative', 'loyal', 'sensitive', 'interpersonal', 'caring',
];

const AGE_PATTERNS = [
  /\b(19\d{2}|20[0-2]\d)\b/g,
  /\b(generation\s+X|gen\s*Z|millennial|boomer)\b/i,
];

const PRESTIGE_PATTERNS = [
  /\b(harvard|stanford|mit|yale|princeton|oxford|cambridge|ivy\s*league)\b/i,
];

const LOCATION_PATTERNS = [
  /\b(local\s+only|must\s+relocate|in-office\s+only|no\s+remote)\b/i,
  /\b(us\s+citizen|green\s+card|authorized\s+to\s+work)\b/i,
];

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

export function analyzeBias(text: string): BiasFlag[] {
  const flags: BiasFlag[] = [];
  const normalized = normalizeForMatch(text);

  const masculineCount = MASCULINE_CODED.filter((w) =>
    normalized.includes(w)
  ).length;
  const feminineCount = FEMININE_CODED.filter((w) =>
    normalized.includes(w)
  ).length;
  const totalCoded = masculineCount + feminineCount;
  if (totalCoded >= 5 && Math.abs(masculineCount - feminineCount) >= 3) {
    flags.push({
      code: 'GENDER_CODED',
      category: 'language',
      message: 'Job description may use gender-coded language; consider neutral alternatives.',
      severity: 'medium',
    });
  }

  for (const pattern of AGE_PATTERNS) {
    if (pattern.test(text)) {
      flags.push({
        code: 'AGE_INDICATOR',
        category: 'demographic',
        message: 'Resume contains year or generation references that may imply age.',
        severity: 'low',
      });
      break;
    }
  }

  for (const pattern of PRESTIGE_PATTERNS) {
    if (pattern.test(text)) {
      flags.push({
        code: 'PRESTIGE_BIAS',
        category: 'education',
        message: 'Resume emphasizes elite institution; ensure other candidates evaluated fairly.',
        severity: 'low',
      });
      break;
    }
  }

  for (const pattern of LOCATION_PATTERNS) {
    if (pattern.test(text)) {
      flags.push({
        code: 'LOCATION_BIAS',
        category: 'location',
        message: 'Job may restrict candidates by location or work authorization.',
        severity: 'low',
      });
      break;
    }
  }

  return flags;
}
