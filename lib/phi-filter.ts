export interface PhiDetection {
  detected: boolean
  patterns: string[]
}

const PHI_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: "DOB", re: /\b(DOB|Date of Birth)\s*[:\-]/i },
  { name: "MRN", re: /\b(MRN|Medical Record Number|Patient ID)\s*[:\-#]/i },
  { name: "Patient label", re: /\bPatient\s*(Name|#|Number)\s*[:\-]/i },
  { name: "Phone (labeled)", re: /\b(Phone|Tel|Mobile)\s*[:\-]\s*\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/i },
  // ICD-10 codes are A00-T98 / V01-Y98 / Z00-Z99 etc with an optional decimal
  // sub-classification. Pre-2026-05-05 the regex matched any 3-char token like
  // B12, A1B, C3A which produced false positives on vitamin / drug names in
  // marketing copy. Now require a labelling cue ("ICD-10", "diagnosis code"
  // etc) or the colon/dash form in front of the code so we don't flag normal
  // healthcare marketing text.
  {
    name: "ICD-10",
    re: /\b(?:ICD[-\s]?10|diagnosis\s+code|dx\s*code)\b\s*[:#-]?\s*[A-TV-Z][0-9][0-9AB](?:\.[0-9A-TV-Z]{1,4})?\b/i,
  },
  { name: "NPI", re: /\b(NPI|National Provider Identifier)\s*[:\-]?\s*\d{10}\b/i },
  { name: "Insurance ID", re: /\b(Policy|Member|Subscriber)\s*(ID|#|Number)\s*[:\-]/i },
]

export function detectPhi(text: string): PhiDetection {
  if (!text) return { detected: false, patterns: [] }
  const hits: string[] = []
  for (const { name, re } of PHI_PATTERNS) {
    if (re.test(text)) hits.push(name)
  }
  return { detected: hits.length > 0, patterns: hits }
}

export const PHI_ERROR_MESSAGE =
  "Your content looks like it contains patient information (PHI). For safety, we block these patterns. Please only scan marketing materials - remove patient names, DOB, MRN, SSN, or insurance identifiers before scanning."
