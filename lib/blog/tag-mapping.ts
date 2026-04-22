// Maps blog post tags to related product pages across tools/, for/, vs/, and
// compare/. Used by BlogPostLayout to render a "Related in the platform"
// section that cross-links from blog posts to commercial-intent pages.
//
// Ordering matters - earlier entries surface first.

export interface ProductLink {
  href: string
  label: string
  kind: "tool" | "specialty" | "comparison" | "hub" | "state"
}

type TagRule = {
  tag: string
  links: ProductLink[]
}

const RULES: TagRule[] = [
  // Specialty tags
  {
    tag: "Med spa",
    links: [
      { href: "/for/med-spas", label: "Med spa compliance playbook", kind: "specialty" },
      { href: "/tools/scanner", label: "Scanner (med spa-calibrated)", kind: "tool" },
    ],
  },
  {
    tag: "Weight loss",
    links: [
      { href: "/for/weight-loss-clinics", label: "Weight loss & GLP-1 compliance", kind: "specialty" },
      { href: "/tools/scanner", label: "Scanner (GLP-1 calibrated)", kind: "tool" },
    ],
  },
  {
    tag: "Regen",
    links: [
      { href: "/for/regen-clinics", label: "Regenerative medicine compliance", kind: "specialty" },
      { href: "/tools/compliance-library", label: "361-pathway rule library", kind: "tool" },
    ],
  },
  {
    tag: "Dental",
    links: [
      { href: "/for/dental-practices", label: "Dental marketing compliance", kind: "specialty" },
    ],
  },
  {
    tag: "Aesthetic",
    links: [
      { href: "/for/aesthetic-practices", label: "Aesthetic practice compliance", kind: "specialty" },
    ],
  },
  {
    tag: "IV therapy",
    links: [
      { href: "/for/iv-therapy", label: "IV therapy compliance", kind: "specialty" },
    ],
  },
  // Adjacent specialties (covered individually at /for but map primary tag)
  { tag: "Orthodontic", links: [{ href: "/for/dental-practices", label: "Dental marketing compliance", kind: "specialty" }] },
  { tag: "Sports medicine", links: [{ href: "/for/regen-clinics", label: "Regen compliance (PRP)", kind: "specialty" }] },
  { tag: "Ophthalmology", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "ENT", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Pediatric", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Mental health", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Addiction", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Fertility", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Hormone", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Chiropractic", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Midwifery", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Acupuncture", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Peptide", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Naturopathic", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Podiatry", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "PT", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Optometry", links: [{ href: "/for", label: "All specialty playbooks", kind: "hub" }] },
  { tag: "Oral surgery", links: [{ href: "/for/dental-practices", label: "Dental compliance", kind: "specialty" }] },
  { tag: "Dermatology", links: [{ href: "/for/aesthetic-practices", label: "Aesthetic practice compliance", kind: "specialty" }] },
  { tag: "Plastic surgery", links: [{ href: "/for/aesthetic-practices", label: "Aesthetic practice compliance", kind: "specialty" }] },
  // Topic / category tags
  {
    tag: "Tactical",
    links: [
      { href: "/tools/scanner", label: "Compliance scanner", kind: "tool" },
      { href: "/tools/ai-rewriter", label: "AI compliant rewriter", kind: "tool" },
    ],
  },
  {
    tag: "Compliance audit",
    links: [
      { href: "/tools/audit-trail", label: "Audit trail + PDF export", kind: "tool" },
      { href: "/tools/scanner", label: "Compliance scanner", kind: "tool" },
    ],
  },
  {
    tag: "Audit",
    links: [
      { href: "/tools/audit-trail", label: "Audit trail + PDF export", kind: "tool" },
    ],
  },
  {
    tag: "Case study",
    links: [
      { href: "/tools/compliance-library", label: "300+ rule library (with sources)", kind: "tool" },
    ],
  },
  {
    tag: "Enforcement trend",
    links: [
      { href: "/tools/enforcement-alerts", label: "Enforcement alerts", kind: "tool" },
    ],
  },
  {
    tag: "FTC",
    links: [
      { href: "/tools/compliance-library", label: "Rule library (FTC section)", kind: "tool" },
      { href: "/compare", label: "Compare vs alternatives", kind: "hub" },
    ],
  },
  {
    tag: "FDA",
    links: [
      { href: "/tools/compliance-library", label: "Rule library (FDA section)", kind: "tool" },
    ],
  },
  {
    tag: "HCT/P",
    links: [
      { href: "/for/regen-clinics", label: "Regenerative medicine compliance", kind: "specialty" },
    ],
  },
  {
    tag: "Platform",
    links: [
      { href: "/compare", label: "Compare vs alternatives", kind: "hub" },
    ],
  },
  { tag: "Meta", links: [{ href: "/compare", label: "Platform policy comparisons", kind: "hub" }] },
  { tag: "Google", links: [{ href: "/compare", label: "Platform policy comparisons", kind: "hub" }] },
  { tag: "TikTok", links: [{ href: "/compare", label: "Platform policy comparisons", kind: "hub" }] },
  { tag: "YouTube", links: [{ href: "/compare", label: "Platform policy comparisons", kind: "hub" }] },
  { tag: "LinkedIn", links: [{ href: "/compare", label: "Platform policy comparisons", kind: "hub" }] },
  { tag: "Podcast", links: [{ href: "/compare", label: "Platform comparisons", kind: "hub" }] },
  {
    tag: "HIPAA",
    links: [
      { href: "/security", label: "Data handling & HIPAA posture", kind: "hub" },
    ],
  },
  {
    tag: "Substantiation",
    links: [
      { href: "/tools/compliance-library", label: "Substantiation rule category", kind: "tool" },
    ],
  },
  {
    tag: "State",
    links: [
      { href: "/state", label: "State-by-state rule guides", kind: "state" },
    ],
  },
  {
    tag: "Training",
    links: [
      { href: "/how-it-works", label: "How RegenCompliance works", kind: "hub" },
    ],
  },
  {
    tag: "Checklist",
    links: [
      { href: "/tools/scanner", label: "Pre-publish scanner", kind: "tool" },
    ],
  },
  {
    tag: "Style",
    links: [
      { href: "/tools/compliance-library", label: "Compliance library (rule source)", kind: "tool" },
    ],
  },
  {
    tag: "Research",
    links: [
      { href: "/tools/compliance-library", label: "Rule library (source data)", kind: "tool" },
    ],
  },
  {
    tag: "Original research",
    links: [
      { href: "/tools/compliance-library", label: "Rule library", kind: "tool" },
    ],
  },
  {
    tag: "Foundational",
    links: [
      { href: "/glossary", label: "Regulatory glossary", kind: "hub" },
    ],
  },
  {
    tag: "Reviews",
    links: [
      { href: "/tools/audit-trail", label: "Review response documentation", kind: "tool" },
    ],
  },
  {
    tag: "Agency",
    links: [
      { href: "/tools/scanner", label: "Pre-publish scanner for agencies", kind: "tool" },
    ],
  },
  {
    tag: "Email",
    links: [
      { href: "/tools/scanner", label: "Pre-publish scanner", kind: "tool" },
    ],
  },
  {
    tag: "Advertising",
    links: [
      { href: "/tools/scanner", label: "Pre-publish scanner", kind: "tool" },
      { href: "/compare", label: "Compare vs alternatives", kind: "hub" },
    ],
  },
  {
    tag: "Specialty playbook",
    links: [
      { href: "/for", label: "All specialty playbooks", kind: "hub" },
    ],
  },
  {
    tag: "Sleep medicine",
    links: [
      { href: "/for/dental-practices", label: "Dental/sleep dentistry compliance", kind: "specialty" },
    ],
  },
  {
    tag: "Devices",
    links: [
      { href: "/tools/compliance-library", label: "Device rule category", kind: "tool" },
    ],
  },
  {
    tag: "Brand advertising",
    links: [
      { href: "/for/med-spas", label: "Med spa brand advertising compliance", kind: "specialty" },
    ],
  },
  {
    tag: "Longevity",
    links: [
      { href: "/for/iv-therapy", label: "IV therapy / longevity compliance", kind: "specialty" },
    ],
  },
]

export function getProductLinksForTags(
  tags: string[] | undefined,
  limit = 4,
): ProductLink[] {
  if (!tags || tags.length === 0) return []
  const seen = new Set<string>()
  const result: ProductLink[] = []
  for (const tag of tags) {
    const rule = RULES.find((r) => r.tag === tag)
    if (!rule) continue
    for (const link of rule.links) {
      if (seen.has(link.href)) continue
      seen.add(link.href)
      result.push(link)
      if (result.length >= limit) return result
    }
  }
  // Always include at least one product link if tags matched nothing specific
  if (result.length === 0) {
    return [
      { href: "/tools/scanner", label: "Compliance scanner", kind: "tool" },
      { href: "/compare", label: "Compare vs alternatives", kind: "hub" },
    ]
  }
  return result
}
