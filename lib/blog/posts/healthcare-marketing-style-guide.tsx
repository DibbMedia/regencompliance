import type { BlogPostMeta } from "@/lib/blog/types"
import {
  H2,
  H3,
  P,
  Lead,
  UL,
  OL,
  LI,
  Strong,
  Em,
  BQ,
  Callout,
  KeyTakeaways,
  BeforeAfter,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "healthcare-marketing-style-guide",
  title:
    "Building a Healthcare Marketing Style Guide: The Document That Prevents Compliance Drift",
  description:
    "Most compliance drift happens because rules exist only in the compliance officer's head. A written marketing style guide turns scattered judgments into an enforceable standard. Here's how to build one.",
  excerpt:
    "Your compliance officer can't be in every marketing meeting. A written style guide makes compliance principles operable at scale — here's the template and how to keep it alive.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "healthcare marketing style guide",
    "compliance style guide template",
    "medical marketing standards",
    "FTC compliant language",
    "healthcare writing guide",
  ],
  tags: ["Tactical", "Style"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        A healthcare marketing style guide turns scattered compliance
        judgments into an enforceable standard. Without one, the same
        questions get asked over and over, the same mistakes get made
        across different channels, and compliance lives in one or two
        people&rsquo;s heads. With one, anyone on the team can check
        the standard before publishing. Here&rsquo;s how to build a
        style guide that actually gets used.
      </Lead>

      <H2 id="what-a-style-guide-covers">What your style guide should cover</H2>

      <H3>1. Voice and tone</H3>
      <P>
        Not directly a compliance item, but relevant: compliance-safer
        language tends to be specific, honest, and reserved. A
        style guide that sets tone expectations (e.g., &ldquo;avoid
        superlatives,&rdquo; &ldquo;prefer specific numbers with
        citations&rdquo;) helps the compliance principles stick.
      </P>

      <H3>2. Banned phrases</H3>
      <P>
        A working list of phrases not to use, organized by category.
        Typical entries:
      </P>
      <UL>
        <LI>&ldquo;FDA-approved&rdquo; &mdash; unless the product actually is, with specific labeled indication.</LI>
        <LI>&ldquo;Cures,&rdquo; &ldquo;heals,&rdquo; &ldquo;treats [disease]&rdquo; &mdash; disease-claim territory.</LI>
        <LI>&ldquo;Guaranteed,&rdquo; &ldquo;guaranteed results&rdquo; &mdash; FTC trigger.</LI>
        <LI>&ldquo;No side effects,&rdquo; &ldquo;completely safe&rdquo; &mdash; safety absolutes.</LI>
        <LI>&ldquo;Proven,&rdquo; &ldquo;clinically proven&rdquo; &mdash; without specific substantiation.</LI>
        <LI>&ldquo;Best,&rdquo; &ldquo;top,&rdquo; &ldquo;most effective&rdquo; &mdash; unsubstantiated superlatives.</LI>
      </UL>

      <H3>3. Preferred phrasings</H3>
      <P>
        For each banned phrase, a compliant alternative. This is
        the most-used section of a style guide because staff rarely
        wants to just be told &ldquo;no&rdquo; &mdash; they want to
        know what to say instead.
      </P>

      <BeforeAfter
        bad="FDA-approved stem cell therapy"
        good="Performed in an FDA-registered facility using HCT/P materials under the 361 pathway"
      />
      <BeforeAfter
        bad="Guaranteed weight loss results"
        good="Most patients on our program experience significant weight loss; individual results vary"
      />
      <BeforeAfter
        bad="Clinically proven to work"
        good="A [year] clinical study of [protocol] in [population] showed [specific outcome] — individual outcomes depend on many factors"
      />

      <H3>4. Required disclosures</H3>
      <P>
        What disclosures must appear in what contexts:
      </P>
      <UL>
        <LI>
          <Strong>Testimonials.</Strong> Typical-experience disclosure
          (not &ldquo;results may vary&rdquo;), material-connection
          disclosure if applicable.
        </LI>
        <LI>
          <Strong>Before/after imagery.</Strong> Patient identifier,
          time post-treatment, typical-experience framing.
        </LI>
        <LI>
          <Strong>Medication pages.</Strong> Fair-balance risk
          information, specific approved indications.
        </LI>
        <LI>
          <Strong>Endorsements.</Strong> Paid relationship disclosure
          in the post itself, not linked.
        </LI>
        <LI>
          <Strong>Clinical trials or research framing.</Strong> Proper
          IRB and IND framing if applicable.
        </LI>
      </UL>

      <H3>5. Claim-by-specialty rules</H3>
      <P>
        If your practice spans specialties, include specialty-specific
        sections. Stem cell claims differ from weight loss claims
        differ from aesthetic device claims. A single generic
        &ldquo;no disease claims&rdquo; rule catches less than
        specialty-specific guidance.
      </P>

      <H3>6. Platform-specific notes</H3>
      <P>
        Meta, Google Ads, and TikTok policies add restrictions
        beyond FDA/FTC. Call these out: &ldquo;On Meta, avoid
        before/after transformation imagery with text overlays; on
        Google Ads, do not use specific weight-loss numbers in
        headlines.&rdquo;
      </P>

      <H3>7. Workflow integration</H3>
      <P>
        Where the style guide fits in the publishing workflow. Who
        checks it. What happens when content violates it. How the
        guide is updated when rules change.
      </P>

      <H2 id="how-to-build-it">How to build it</H2>

      <H3>Step 1: Audit your current marketing for patterns</H3>
      <P>
        Identify the recurring compliance issues in your current
        marketing. The banned phrases section should reflect the
        specific patterns your team actually produces &mdash; generic
        lists from the internet are less useful than specific lists
        from your own recent output.
      </P>

      <H3>Step 2: Write the first draft</H3>
      <P>
        One person, three hours, first full draft. Too many cooks at
        the drafting stage produces compromise text. Draft first,
        review broadly.
      </P>

      <H3>Step 3: Review with compliance counsel</H3>
      <P>
        An experienced healthcare marketing attorney should review
        before the guide becomes operational. One-time legal review
        is both lower-cost than ongoing per-campaign review and
        establishes the authoritative version of the rules.
      </P>

      <H3>Step 4: Train the team on it</H3>
      <P>
        A style guide no one has read doesn&rsquo;t work. Build a
        training session around the guide &mdash; walk through each
        section, discuss examples from your own work, take questions.
      </P>

      <H3>Step 5: Make it accessible</H3>
      <P>
        The guide should live somewhere everyone can find it &mdash;
        a shared drive, a Notion page, an internal wiki, a PDF
        linked from the content management system. A brilliant style
        guide that&rsquo;s not accessible at the moment of need is a
        useless style guide.
      </P>

      <H3>Step 6: Update it regularly</H3>
      <P>
        Version the guide. Update when rules change, when new
        enforcement trends emerge, or when you catch new patterns.
        A dated record of updates is itself a compliance-program
        artifact.
      </P>

      <H2 id="what-makes-it-fail">What makes style guides fail</H2>

      <H3>Too abstract</H3>
      <P>
        &ldquo;Avoid deceptive claims&rdquo; is not a useful rule
        because everyone agrees with it. Specific banned phrases with
        specific compliant alternatives is what moves the needle.
      </P>

      <H3>Too long</H3>
      <P>
        A 60-page document no one reads is worse than a 10-page
        document everyone uses. Ruthlessly edit for brevity. Link to
        source material for depth; keep the operational guide short.
      </P>

      <H3>Not integrated into workflow</H3>
      <P>
        If the style guide is a PDF nobody checks, it doesn&rsquo;t
        work. Build the check into the publishing process &mdash;
        ideally as a step before content goes live.
      </P>

      <H3>Stale</H3>
      <P>
        Rules change. A 3-year-old style guide missing the 2023 FTC
        Endorsement Guides update is giving your team wrong answers.
        Schedule recurring review.
      </P>

      <BQ>
        A well-maintained style guide is the difference between
        &ldquo;compliance lives in one person&rsquo;s head&rdquo;
        and &ldquo;compliance is operable at the scale of the team.&rdquo;
        The document itself is minor; the discipline of maintaining
        it is the real asset.
      </BQ>

      <KeyTakeaways
        items={[
          "A written style guide turns compliance principles into enforceable team standards.",
          "The most-used section is banned phrases paired with compliant alternatives — concrete beats abstract.",
          "Specialty-specific and platform-specific sections catch issues a generic guide misses.",
          "Legal counsel should review the initial version; the team should be trained on it; the workflow should require checking it before publish.",
          "Version-controlled updates as rules change keep the guide from drifting into uselessness.",
        ]}
      />
    </>
  )
}
