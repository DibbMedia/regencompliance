/**
 * FAQPage builder. Pass an ordered list of {q, a} pairs - text only, no
 * markup. Google strips HTML from acceptedAnswer.text in many cases anyway.
 */
export interface FaqItem {
  q: string
  a: string
}

export interface FaqPageSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "FAQPage"
  mainEntity: Array<{
    "@type": "Question"
    name: string
    acceptedAnswer: {
      "@type": "Answer"
      text: string
    }
  }>
}

export function buildFaqSchema(items: FaqItem[]): FaqPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }
}
