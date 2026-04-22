import type { BlogPostMeta } from "@/lib/blog/types"
import {
  H2,
  H3,
  P,
  Lead,
  UL,
  LI,
  Strong,
  Em,
  BQ,
  Callout,
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "acupuncture-marketing-compliance",
  title:
    "Acupuncture Marketing Compliance: Evidence-Based Claims, State Licensing Rules, and the FTC Scrutiny Practices Face",
  description:
    "Acupuncture marketing combines state licensing board rules, FTC substantiation for specific condition claims, and specific considerations around traditional Chinese medicine framing. Here's the compliance framework.",
  excerpt:
    "Acupuncture practice marketing faces specific FTC scrutiny on condition-treatment claims, plus state-by-state licensing board rules that vary significantly. Here's how to market acupuncture services compliantly.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "acupuncture marketing compliance",
    "acupuncturist advertising rules",
    "TCM marketing compliance",
    "acupuncture state licensing",
    "acupuncture FTC substantiation",
  ],
  tags: ["Acupuncture", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Acupuncture practice marketing sits at the intersection of
        several regulatory layers: state acupuncture licensing boards
        (which vary significantly by state), FTC substantiation
        rules applied to specific condition claims, FDA-regulated
        needles and devices, and specific considerations around
        traditional Chinese medicine (TCM) framing. The acupuncture
        profession has been building its evidence base, but
        marketing sometimes runs ahead of the evidence in ways
        regulators notice.
      </Lead>

      <H2 id="regulatory-overview">The regulatory overview</H2>
      <UL>
        <LI>
          <Strong>State acupuncture licensing boards.</Strong> Some
          states have dedicated acupuncture boards; others regulate
          through general healing arts boards. Rules vary widely.
        </LI>
        <LI>
          <Strong>Scope of practice.</Strong> Varies by state; some
          states allow broader practice including herbs and
          diagnosis, others are more restricted.
        </LI>
        <LI>
          <Strong>FDA device rules.</Strong> Acupuncture needles
          are FDA-regulated devices. Electroacupuncture devices
          have specific clearances.
        </LI>
        <LI>
          <Strong>FTC substantiation.</Strong> Applies to
          condition-specific treatment claims the same as other
          healthcare marketing.
        </LI>
      </UL>

      <H2 id="evidence-framing">Evidence-base framing</H2>
      <P>
        Acupuncture&rsquo;s evidence base varies substantially by
        condition. Some indications have meaningful clinical evidence
        (certain types of chronic pain, nausea, tension-type
        headache); others have limited or conflicting evidence.
        Marketing should reflect the actual evidence state for the
        specific conditions mentioned.
      </P>

      <H2 id="problem-patterns">Common problem patterns</H2>

      <H3>Pattern 1: Specific-condition cure claims</H3>
      <P>
        &ldquo;Cures chronic pain,&rdquo; &ldquo;treats anxiety and
        depression,&rdquo; &ldquo;reverses infertility&rdquo; &mdash;
        cure language on specific conditions crosses FDA
        disease-claim territory and exceeds most available evidence.
      </P>

      <H3>Pattern 2: Overbroad condition lists</H3>
      <P>
        Practice websites sometimes list 50+ conditions acupuncture
        &ldquo;treats.&rdquo; Each listed condition is effectively
        a separate treatment claim needing substantiation. Long
        condition lists multiply exposure.
      </P>

      <H3>Pattern 3: TCM diagnostic framing</H3>
      <P>
        Traditional Chinese medicine diagnostic terminology (&ldquo;qi
        deficiency,&rdquo; &ldquo;blood stagnation&rdquo;) used in
        marketing without appropriate contextualization can create
        substantiation concerns. Compliant marketing can reference
        TCM frameworks while being clear about how they relate to
        Western diagnostic categories.
      </P>

      <H3>Pattern 4: Fertility outcome claims</H3>
      <P>
        Acupuncture for fertility is a common marketed service.
        Specific outcome claims (improved pregnancy rates, IVF
        success rates) need substantiation matching the specific
        claim. Broad fertility claims without evidence backing draw
        FTC attention.
      </P>

      <H3>Pattern 5: Cancer-related claims</H3>
      <P>
        Acupuncture for cancer pain management has evidence
        support. Claims about cancer treatment itself or
        chemotherapy alternative framing are higher-risk. Marketing
        acupuncture as part of supportive oncology care requires
        specific framing.
      </P>

      <H2 id="compliant-framework">Compliant acupuncture marketing framework</H2>
      <UL>
        <LI>
          <Strong>Evidence-honest condition marketing.</Strong>
          Where evidence supports acupuncture for specific indications
          (chronic low back pain, knee osteoarthritis, chemotherapy-
          induced nausea), marketing can reference the evidence
          base.
        </LI>
        <LI>
          <Strong>Conservative condition-list marketing.</Strong>
          Avoid long lists of treated conditions; focus on the
          specific conditions where evidence supports the claim.
        </LI>
        <LI>
          <Strong>Complementary-care framing.</Strong>
          Acupuncture as part of a comprehensive approach rather
          than standalone treatment for diagnosed medical
          conditions.
        </LI>
        <LI>
          <Strong>TCM-plus-Western framing.</Strong> When discussing
          TCM frameworks, contextualize relative to Western
          medicine rather than as an alternative medical system
          for serious conditions.
        </LI>
        <LI>
          <Strong>Patient-experience framing.</Strong> Many patients
          find acupuncture beneficial for specific concerns;
          individual responses vary.
        </LI>
      </UL>

      <H2 id="specific-considerations">Specific practice considerations</H2>

      <H3>Cosmetic acupuncture</H3>
      <P>
        Cosmetic acupuncture (facial rejuvenation, anti-aging)
        marketing combines acupuncture marketing rules with the
        aesthetic marketing framework. Outcome claims need
        substantiation; before/after imagery needs typical-experience
        framing.
      </P>

      <H3>Herbal medicine dispensing</H3>
      <P>
        State rules on acupuncturist herbal dispensing vary.
        Marketing herbal products adds DSHEA rules for supplements
        plus state-specific considerations for regulated
        herbs.
      </P>

      <H3>Electroacupuncture and device marketing</H3>
      <P>
        Electroacupuncture devices are FDA-regulated. Marketing
        should accurately reflect FDA-cleared indications and
        regulatory status.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I market acupuncture for specific medical conditions?</H3>
      <P>
        With appropriate evidence backing. Some conditions have
        meaningful supporting evidence; others don&rsquo;t.
        Marketing should match the evidence state for each
        specific condition mentioned.
      </P>

      <H3>How do I handle TCM diagnostic terminology in marketing?</H3>
      <P>
        Use when clinically relevant with appropriate context.
        Using TCM terminology to make outcome claims about
        Western-diagnosable diseases can create substantiation
        concerns.
      </P>

      <H3>Are there specific state rules on acupuncture marketing?</H3>
      <P>
        Yes, varying by state. Some states have specific advertising
        rules from their acupuncture or healing arts boards. Check
        state-specific requirements.
      </P>

      <H3>Can I accept insurance and market insurance coverage?</H3>
      <P>
        Insurance coverage marketing needs accuracy. Acupuncture
        insurance coverage varies significantly by plan; marketing
        should reflect actual coverage patterns.
      </P>

      <H3>What about package program marketing?</H3>
      <P>
        Package programs should disclose what&rsquo;s included,
        typical number of sessions required, and pricing clearly.
        &ldquo;Guaranteed outcomes&rdquo; language is exposure-heavy.
      </P>

      <H3>How do I handle cosmetic acupuncture specifically?</H3>
      <P>
        Apply the aesthetic marketing framework: before/after
        framing, specific outcome claim substantiation, appropriate
        typical-experience disclosure. Cosmetic acupuncture outcomes
        vary significantly; conservative marketing framings work
        better.
      </P>

      <KeyTakeaways
        items={[
          "Acupuncture marketing combines state licensing board rules, FTC substantiation rules, and specific TCM framing considerations.",
          "Long condition lists multiply substantiation exposure; focus on evidence-supported specific indications.",
          "Evidence-base varies significantly by condition — marketing should match the specific evidence for specific claims.",
          "TCM terminology used in marketing can be appropriate when contextualized; using it to make cure claims for Western-diagnosable diseases creates issues.",
          "Cosmetic acupuncture, fertility acupuncture, and cancer-related acupuncture have particularly specific compliance considerations.",
        ]}
      />
    </>
  )
}
