# RegenCompliance blog — editorial calendar

Shipped in session 2026-04-21: blog infrastructure + 3 foundational posts.

- Index: `/blog`
- Dynamic routes: `/blog/[slug]`
- Post source: `lib/blog/posts/*.tsx` (registered in `lib/blog/registry.ts`)
- Prose primitives: `components/blog/prose.tsx`
- Shared layout: `components/blog/post-layout.tsx`

Each post ships with:
- OpenGraph + Twitter meta
- Article JSON-LD
- Sitemap entry
- Related-posts carousel
- CTA strip to `/demo` and `/waitlist` (or `/pricing` once `IS_LAUNCHED`)

## Posts live (3)

| Slug | Primary keyword | Angle | Reading |
| --- | --- | --- | --- |
| `fda-warning-letters-25-year-high` | FDA warning letters 2024 | Enforcement trend piece, top of funnel | 9 min |
| `ftc-stem-cell-settlement-social-media` | FTC stem cell settlement | Case-study-driven social-post risk breakdown | 8 min |
| `structure-function-vs-disease-claims` | structure function claims FDA | Evergreen foundational | 11 min |

## Next 9 posts — queued outlines

Follow the same file pattern: `lib/blog/posts/<slug>.tsx` exporting `meta`
and `default Body()`. Register by appending the import to
`lib/blog/registry.ts`. Sitemap picks it up automatically.

### 4. `banned-words-healthcare-marketing-2026`
- **Title:** The 7 Banned Words That Trigger FDA Warning Letters in Healthcare Marketing (Updated 2026)
- **Primary keyword:** banned words FDA healthcare marketing
- **Angle:** listicle, highly shareable, linkable reference
- **Outline:**
  1. How FDA &ldquo;trigger words&rdquo; work (intended-use mechanics, briefly)
  2. Word 1: cure / cures / curing
  3. Word 2: heal / heals / healing
  4. Word 3: treat / treats (for named conditions)
  5. Word 4: reverse / reverses (especially aging, disease)
  6. Word 5: guaranteed / guarantee
  7. Word 6: FDA-approved (when actually FDA-registered)
  8. Word 7: proven (without substantiation)
  9. Bonus: 5 adjacent phrases that drag you into the same violation
  10. What to do: rewrite-at-source style guide + pre-publish scan
- **Target length:** 1600–1800 words
- **Internal links:** → `structure-function-vs-disease-claims`, `/demo`

### 5. `healthcare-website-compliance-audit-framework`
- **Title:** How to Audit Your Healthcare Website for FDA/FTC Compliance: The 5-Step Framework
- **Primary keyword:** healthcare website compliance audit
- **Angle:** tactical how-to, gets bookmarked by operations leads
- **Outline:**
  1. Why an annual audit is the wrong frequency in 2026
  2. Step 1 — Inventory (site pages, posts, ads, emails, captions, scripts)
  3. Step 2 — Triage by pageviews (audit the top 10 before the tail)
  4. Step 3 — Claim-category scan (disease, implied-approval, guarantee, testimonial)
  5. Step 4 — Rewrite-at-source updates to style guide
  6. Step 5 — Archive retirement + 301 redirects for removed pages
  7. Timeline: a 2-week clinic sprint with named roles
- **Target length:** 2000–2200 words
- **Internal links:** → `fda-warning-letters-25-year-high`, `banned-words-healthcare-marketing-2026`, `/features`

### 6. `med-spa-marketing-compliance-risk`
- **Title:** Med Spa Marketing: 12 Phrases That Put Your Clinic at Risk (and the Compliant Alternatives)
- **Primary keyword:** med spa marketing compliance
- **Angle:** specialty-specific, high commercial intent
- **Outline:**
  1. Why med spas face a different risk profile than traditional practices
  2. Cosmetic-vs-medical conditions (rosacea, acne, alopecia, hyperhidrosis)
  3. 12 phrases with BeforeAfter rewrites
  4. Before/after photos: the separate FTC rule (preview post 10)
  5. Neurotoxin and filler brand-name rules
  6. What to fix this week
- **Target length:** 1800–2000 words
- **Internal links:** → `structure-function-vs-disease-claims`, `/features`

### 7. `stem-cell-marketing-costly-phrases`
- **Title:** Stem Cell Marketing: The 5 Phrases That Have Cost Clinics Millions
- **Primary keyword:** stem cell marketing FDA FTC
- **Angle:** regen-specific, high-intent, settlement-driven
- **Outline:**
  1. The current enforcement environment for stem cell, exosome, PRP
  2. Phrase 1: &ldquo;FDA-approved stem cells&rdquo;
  3. Phrase 2: &ldquo;heals/cures [condition]&rdquo;
  4. Phrase 3: &ldquo;reverses aging&rdquo;
  5. Phrase 4: &ldquo;guaranteed results&rdquo;
  6. Phrase 5: unbounded efficacy testimonials
  7. What a compliant regen-med site looks like in 2026
- **Target length:** 1800 words
- **Internal links:** → `ftc-stem-cell-settlement-social-media`, `structure-function-vs-disease-claims`, `/demo`

### 8. `glp-1-semaglutide-marketing-compliance`
- **Title:** GLP-1 and Semaglutide Marketing: The New Regulatory Minefield for Weight Loss Clinics
- **Primary keyword:** GLP-1 marketing compliance
- **Angle:** trending specialty, fast-growing enforcement surface
- **Outline:**
  1. Why GLP-1s are the fastest-growing FDA enforcement category
  2. Compounded vs. brand-name drug identity rules
  3. Before/after weight-loss photo rules (FTC)
  4. Testimonial rules specific to weight loss (FTC Jenny Craig precedent)
  5. Social media/TikTok specifics for this category
  6. What a compliant weight-loss clinic page looks like
- **Target length:** 2000 words
- **Internal links:** → `structure-function-vs-disease-claims`, `before-after-photos-compliance`, `/demo`

### 9. `before-after-photos-compliance`
- **Title:** Before-and-After Photos: The FDA & FTC Rules Nobody Talks About
- **Primary keyword:** before after photos FTC FDA compliance
- **Angle:** evergreen, highly referenced
- **Outline:**
  1. The three concurrent legal regimes (FDA, FTC, state medical board)
  2. Typical-experience disclosure requirements
  3. Consent and HIPAA overlap (photo is PHI)
  4. The &ldquo;unretouched&rdquo; question
  5. Lighting, pose, and framing as implicit claims
  6. Platform-specific rules (Meta, Google, TikTok advertising policies)
  7. A compliant caption template
- **Target length:** 1800–2000 words
- **Internal links:** → `healthcare-testimonial-compliance`, `med-spa-marketing-compliance-risk`

### 10. `healthcare-testimonial-compliance`
- **Title:** Healthcare Testimonials Compliance: What You Can and Can't Publish
- **Primary keyword:** healthcare testimonial FTC compliance
- **Angle:** evergreen, highly searched by marketing leads
- **Outline:**
  1. Why the FTC Endorsement Guides apply to every healthcare practice
  2. Typical-experience disclosure — what &ldquo;clear and conspicuous&rdquo; actually means
  3. Paid testimonials (cash, discount, free treatment) — material connection disclosure
  4. Employee testimonials
  5. Influencer partnerships
  6. Repost rules (when a patient posts about you)
  7. Substantiation files — what you must retain
  8. Enforcement examples
- **Target length:** 2000 words
- **Internal links:** → `before-after-photos-compliance`, `ftc-stem-cell-settlement-social-media`

### 11. `instagram-tiktok-healthcare-ads-compliance`
- **Title:** Running Instagram &amp; TikTok Ads for a Healthcare Practice Without Triggering the FDA
- **Primary keyword:** healthcare Instagram TikTok ads compliance
- **Angle:** modern-channel specific, high intent
- **Outline:**
  1. How ad-platform policies interact with FDA/FTC
  2. What an ad auditor actually pulls
  3. Meta / Instagram healthcare rules + specific phrase triggers
  4. TikTok healthcare rules + specific phrase triggers
  5. Landing page coherence (the ad + the page read as one claim)
  6. Ad-variant risk (platform-autogenerated copy is your copy)
  7. The 15-minute pre-launch checklist
- **Target length:** 1800 words
- **Internal links:** → `healthcare-testimonial-compliance`, `before-after-photos-compliance`, `/demo`

### 12. `dental-longevity-claims-compliance`
- **Title:** Dental Implant Longevity Claims: Why &ldquo;Lifetime&rdquo; Guarantees Can End Your Practice
- **Primary keyword:** dental implant lifetime guarantee FTC
- **Angle:** specialty-specific, nuance around FTC vs. FDA
- **Outline:**
  1. Why dental has a different primary regulator than regen/med spa (FTC-heavy, state board)
  2. The problem with &ldquo;lifetime,&rdquo; &ldquo;permanent,&rdquo; &ldquo;forever&rdquo;
  3. Implant success-rate claims and their substantiation requirements
  4. Cosmetic outcome guarantees (crowns, veneers, whitening)
  5. Pain-free procedure language
  6. State dental board advertising rules (variance map)
  7. A compliant services-page template
- **Target length:** 1800 words
- **Internal links:** → `healthcare-testimonial-compliance`, `banned-words-healthcare-marketing-2026`

## Cadence recommendation

- **Ship 1 post per week** for the first 12 weeks to build topical authority
  and give Google time to index + rank.
- **Week 1:** FDA warning letters trend (live)
- **Week 2:** FTC settlement case study (live)
- **Week 3:** Structure/function vs disease claims (live)
- **Weeks 4–12:** posts 4 through 12 from the queue above.
- After week 12, drop to 1 post every 2 weeks, focused on fresh enforcement
  events + deep specialty guides.

## Authoring checklist (for each new post)

Before shipping a new post:

- [ ] Create `lib/blog/posts/<slug>.tsx` with `meta` + `default Body()`
- [ ] Keep `meta.description` 150–160 chars (SEO meta limit)
- [ ] `meta.excerpt` punchy enough to stand alone on the index card
- [ ] Add 5–7 focused `meta.keywords`
- [ ] At least one `BeforeAfter` block (it is the most shareable unit)
- [ ] At least one `Callout` variant=&ldquo;success&rdquo; with a
      `/demo` or `/features` link
- [ ] Ending `KeyTakeaways` with 4–5 bullet points
- [ ] Register the post in `lib/blog/registry.ts`
- [ ] Verify the post renders on the Vercel preview before merging

## SEO priorities

1. **Internal linking** — every new post should link back to at least 2
   existing posts and forward-link to 1 CTA (`/demo`, `/pricing`,
   `/features`).
2. **Canonical tag** — already set by `generateMetadata` in
   `app/blog/[slug]/page.tsx`. Do not override.
3. **Article JSON-LD** — already injected. Do not duplicate.
4. **Open Graph image** — currently using `/og-image.png` site-wide. For
   post-specific OG images, add `meta.ogImage` to the `BlogPostMeta` type
   and wire into `generateMetadata`. Not blocking; do it when there's a
   designer pass.
5. **Word count floor** — 1600 words. Below that, Google Helpful Content
   tends to rank it lower than the same topic at 2000 words.
