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
  slug: "nad-plus-marketing-compliance",
  title:
    "NAD+ Marketing Compliance: Why the FTC Has Your Clinic's Longevity Claims in Its Crosshairs",
  description:
    "NAD+ marketing is one of the current FTC enforcement priorities in 2026. Here's what the rules require for anti-aging, cognitive-enhancement, and longevity claims — and why most IV therapy and wellness clinic NAD+ marketing would not survive a regulatory review.",
  excerpt:
    "'Reverses aging,' 'extends lifespan,' 'restores cellular function' — the claims driving NAD+ marketing are the exact claims the FTC is currently pursuing. Here's the full compliance playbook for NAD+ IV, NAD+ injection, and NAD+ protocol marketing.",
  date: "2026-04-22",
  readingMinutes: 10,
  keywords: [
    "NAD+ marketing compliance",
    "NAD plus IV therapy rules",
    "FTC longevity claims",
    "NAD+ anti-aging FDA",
    "NAD+ IV therapy compliance",
    "NAD+ clinic advertising rules",
  ],
  tags: ["IV therapy", "FTC", "Longevity"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        NAD+ marketing has become one of the FTC&rsquo;s 2024-2026
        enforcement focus areas. The agency has publicly flagged
        anti-aging, cognitive-enhancement, and longevity claims in the
        supplement and wellness space as a priority, and NAD+ marketing
        combines all three claim categories in ways that make it an
        obvious enforcement target. If you run an IV therapy clinic,
        wellness practice, or concierge medicine clinic offering NAD+
        services, your current marketing almost certainly contains
        phrases the FTC is actively pursuing.
      </Lead>

      <P>
        This post walks through what NAD+ actually is (for regulatory
        purposes), why it&rsquo;s specifically in FTC focus, the
        claim categories currently under enforcement, and compliant
        framings that preserve marketing effectiveness without
        triggering the specific patterns regulators target.
      </P>

      <Callout variant="warn" title="Why NAD+ specifically">
        NAD+ marketing combines three claim categories that are each
        independently difficult: anti-aging, cognitive enhancement, and
        longevity. Combining them multiplies the substantiation burden.
        Meanwhile, the underlying clinical evidence for many of the
        specific marketed outcomes is genuinely thin &mdash; which
        makes the gap between claim and evidence particularly
        visible.
      </Callout>

      <H2 id="what-is-nad">What NAD+ is, in regulatory terms</H2>
      <P>
        NAD+ (nicotinamide adenine dinucleotide) is a coenzyme present
        in every cell, involved in cellular energy metabolism and DNA
        repair processes. The underlying biology is genuine. The
        regulatory question is not about NAD+&rsquo;s existence or its
        biological role &mdash; it&rsquo;s about what specific claims
        about outcomes in humans are supported by adequate and
        reliable evidence.
      </P>

      <P>
        NAD+ products in the clinical context take several forms:
      </P>

      <UL>
        <LI>
          <Strong>NAD+ IV infusions.</Strong> Typically prepared as
          compounded formulations by licensed compounding pharmacies
          and administered by healthcare practices.
        </LI>
        <LI>
          <Strong>NAD+ subcutaneous injections.</Strong> Lower-dose
          alternatives to IV administration.
        </LI>
        <LI>
          <Strong>NAD+ precursor supplements (NR, NMN).</Strong>
          Dietary supplements marketed with structure-function claims
          under DSHEA.
        </LI>
        <LI>
          <Strong>NAD+ precursor combined protocols.</Strong> IV
          combined with supplement maintenance.
        </LI>
      </UL>

      <P>
        The marketing issues are most acute for the injectable forms
        (IV and SQ) because they are legally prescription preparations
        and the advertising falls under the prescription-drug advertising
        framework rather than the supplement framework.
      </P>

      <H2 id="why-ftc-focus">Why the FTC is focused on this specifically</H2>
      <P>
        Three factors make NAD+ an enforcement priority:
      </P>

      <H3>Factor 1: Aggressive consumer claims</H3>
      <P>
        NAD+ marketing routinely makes sweeping claims &mdash;
        &ldquo;reverses aging,&rdquo; &ldquo;extends lifespan,&rdquo;
        &ldquo;boosts cognition by X%,&rdquo; &ldquo;restores cellular
        function.&rdquo; The claims are both specific enough to
        trigger substantiation requirements and ambitious enough to
        make the evidentiary gap obvious.
      </P>

      <H3>Factor 2: Weak clinical evidence on outcomes</H3>
      <P>
        The human clinical evidence for many specific marketed outcomes
        is thin &mdash; small studies, short durations, mixed results,
        limited blinding. Whatever one&rsquo;s view of the underlying
        biology, the clinical evidence does not meet the FTC&rsquo;s
        competent-and-reliable standard for many common claims.
      </P>

      <H3>Factor 3: Vulnerable consumer target</H3>
      <P>
        NAD+ marketing frequently targets older consumers concerned
        about cognitive decline, cancer patients, and patients with
        chronic illness. The FTC applies heightened scrutiny to
        marketing targeting populations that are particularly
        vulnerable to misleading health claims.
      </P>

      <H2 id="problem-patterns">The specific claim patterns under enforcement</H2>

      <H3>Pattern 1: Anti-aging reversal claims</H3>
      <BeforeAfter
        bad="Our NAD+ IV therapy reverses the aging process at the cellular level."
        good="NAD+ is a coenzyme involved in cellular energy metabolism. Some patients report subjective improvements in energy and well-being after treatment; individual experiences vary, and research into NAD+ biology continues."
        reason="'Reverses aging' is a top-priority FTC enforcement target. Compliant framing describes what NAD+ is and what patients report without claiming biological reversal of aging."
      />

      <H3>Pattern 2: Cognitive enhancement specifics</H3>
      <BeforeAfter
        bad="Improves memory, focus, and cognitive function — many patients report mental clarity within a single session."
        good="Some patients describe subjective feelings of mental clarity and energy following treatment; these responses vary widely by individual and do not represent clinical evidence of cognitive enhancement."
        reason="Cognitive-enhancement claims trigger both FTC substantiation rules and FDA disease-claim rules (cognitive decline is a medical diagnosis). Subjective-report framing avoids the claim while preserving the marketing message."
      />

      <H3>Pattern 3: Longevity / lifespan extension</H3>
      <BeforeAfter
        bad="NAD+ supports longevity — studies show it may extend lifespan by up to 30%."
        good="Research on NAD+ biology, including cellular and animal studies, continues to evolve. We do not make specific claims about lifespan extension in humans, as that level of evidence does not currently exist."
        reason="Lifespan-extension claims require human clinical evidence over years or decades — which does not exist for any current NAD+ protocol. Citing cellular or animal studies to support human lifespan claims is a specific enforcement pattern."
      />

      <H3>Pattern 4: Chronic fatigue and disease-adjacent claims</H3>
      <BeforeAfter
        bad="NAD+ therapy cures chronic fatigue syndrome and brain fog."
        good="Some patients with fatigue or post-viral symptoms report subjective improvement with NAD+ treatment as part of a broader care plan; our medical team discusses whether this is clinically appropriate for each patient."
        reason="'Cures chronic fatigue syndrome' is a disease-treatment claim for a diagnosable medical condition. Subjective-improvement framing with provider-gated language avoids the disease claim."
      />

      <H3>Pattern 5: Cancer-recovery or chemotherapy support</H3>
      <BeforeAfter
        bad="Our NAD+ protocol supports cancer patients through chemotherapy recovery."
        good="[Remove entirely. Do not include this indication in public marketing without specific clinical evidence and attorney review. Cancer-related claims face the highest FTC scrutiny and the highest FDA enforcement risk.]"
        reason="Cancer-related marketing is the highest-risk healthcare marketing category. Even framings like 'supports' can cross into treatment claim territory. This is one of a small number of indications where the safest approach is to simply not market it."
      />

      <H3>Pattern 6: Celebrity/testimonial-driven marketing</H3>
      <BeforeAfter
        bad="[Celebrity] swears by our NAD+ protocol — you can too!"
        good="[Remove unless documented paid endorsement with FTC-compliant material-connection disclosure in the post itself.]"
        reason="Celebrity implied endorsement without proper disclosure is a top-5 FTC enforcement pattern. NAD+ is a space where celebrity mentions appear frequently in clinic marketing, often without the required disclosures."
      />

      <H2 id="compliant-marketing">What compliant NAD+ marketing looks like</H2>

      <H3>Lead with biology, not outcomes</H3>
      <P>
        &ldquo;NAD+ is a coenzyme present in every cell, involved in
        cellular energy metabolism and DNA repair processes. Research
        into its biology and clinical applications continues to
        evolve.&rdquo; This is factually accurate, informative, and
        sets expectations without making specific outcome claims.
      </P>

      <H3>Describe the service honestly</H3>
      <P>
        &ldquo;Our NAD+ infusion sessions are administered by licensed
        medical staff using compounded preparations from a licensed
        compounding pharmacy. Sessions typically take 2-4 hours
        depending on dose and individual tolerance.&rdquo; Specific,
        factual, does not overclaim.
      </P>

      <H3>Frame patient reports as subjective</H3>
      <P>
        &ldquo;Some patients describe subjective improvements in energy,
        mental clarity, or overall well-being following treatment.
        Individual experiences vary significantly, and these reports
        do not constitute clinical evidence of specific
        outcomes.&rdquo; This captures the actual marketing message
        (patients often feel good) without claiming clinical effects.
      </P>

      <H3>Acknowledge the evidence state</H3>
      <P>
        &ldquo;The clinical evidence for specific outcomes of NAD+
        therapy in humans is still developing. We offer this service
        to patients interested in exploring NAD+ as part of a broader
        wellness approach, with a clear understanding that it is not
        an established treatment for any specific medical
        condition.&rdquo; This is genuinely honest and defensibly
        compliant.
      </P>

      <H3>Keep disease-specific indications out of public marketing</H3>
      <P>
        Cancer, Parkinson&rsquo;s, Alzheimer&rsquo;s, ALS, post-viral
        illness, chronic fatigue syndrome, fibromyalgia &mdash; keep
        these out of public marketing even when clinical discussion
        may appropriately include them. The in-consultation
        conversation and the public marketing operate under different
        rules.
      </P>

      <Callout variant="success" title="The reframe that works">
        NAD+ marketing that leads with curiosity and wellness framing
        (&ldquo;many patients exploring cellular health,&rdquo; &ldquo;a
        wellness offering for patients interested in cellular support,
        metabolism, and energy&rdquo;) tends to convert as well as
        aggressive outcome marketing &mdash; and faces none of the
        enforcement risk. The outcome-focused marketing signals
        desperation; the wellness-framed marketing signals
        confidence.
      </Callout>

      <H2 id="supplement-layer">The supplement layer (NR, NMN)</H2>
      <P>
        If your practice also sells NAD+ precursor supplements (NR,
        NMN), those operate under DSHEA &mdash; dietary supplement
        rules. Structure-function claims (&ldquo;supports cellular
        energy&rdquo;) are permitted with the required DSHEA
        disclaimer and adequate substantiation. Disease claims (same
        list: cures, treats, prevents) are not permitted in either
        framework. The supplement layer does not cure compliance
        issues in the IV or injection layer &mdash; they&rsquo;re
        independent.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I cite studies on NAD+ biology in my marketing?</H3>
      <P>
        Citing studies accurately is generally fine. The issue is how
        the citations are used. A study on NAD+ in cells or in
        animals cited to support a claim about human outcomes is a
        substantiation mismatch &mdash; the evidence doesn&rsquo;t
        reach the claim. Citing studies to support what you&rsquo;re
        actually doing (&ldquo;research on NAD+ biology
        continues&rdquo;) is fine.
      </P>

      <H3>What about IV drips combining NAD+ with other ingredients?</H3>
      <P>
        Combination infusions face the same rules plus complexity from
        the additional ingredients. Each claim needs substantiation
        tied to what&rsquo;s actually in the infusion. Generic
        &ldquo;wellness boost&rdquo; framing is easier to defend than
        specific outcome claims.
      </P>

      <H3>Is NAD+ FDA-approved for anything?</H3>
      <P>
        Nicotinamide (vitamin B3) is an approved drug for certain
        medical indications. NAD+ as administered in most wellness and
        IV therapy contexts is not FDA-approved for the marketed
        indications. The distinction matters for marketing language.
      </P>

      <H3>What about research/clinical trial framing?</H3>
      <P>
        Genuine clinical trials operating under an IND can discuss
        research purposes within the scope of the IND. A wellness
        clinic offering NAD+ as a service is not conducting an IND
        clinical trial, and framing services as research when they
        aren&rsquo;t creates an additional misrepresentation.
      </P>

      <H3>Can I show patient &ldquo;before/after&rdquo; energy-level testimonials?</H3>
      <P>
        Yes, with proper FTC endorsement framing &mdash; typical-
        experience disclosure, material-connection disclosure if
        applicable, and avoidance of disease-related outcome framing.
        Energy and well-being testimonials are lower-risk than
        disease-specific testimonials because they don&rsquo;t
        directly imply disease treatment.
      </P>

      <H3>What about longevity physicians with NAD+ in their protocols?</H3>
      <P>
        Longevity-medicine practices face the same rules, often more
        stringently because the entire practice is marketed around
        longevity outcomes. The practice-level marketing needs the
        same compliance treatment as the individual service-level
        marketing. &ldquo;Longevity medicine&rdquo; framing itself is
        increasingly drawing FTC attention when paired with specific
        outcome claims.
      </P>

      <KeyTakeaways
        items={[
          "NAD+ marketing is a current FTC enforcement priority — expect continued scrutiny of anti-aging, cognitive, and longevity claims.",
          "The underlying biology is real; the specific human outcome claims typically lack the clinical evidence required for FTC substantiation.",
          "Biology-first framing and subjective-report framing preserve marketing effectiveness while avoiding enforcement patterns.",
          "Disease-specific indications (cancer, Alzheimer's, chronic fatigue, etc.) should stay out of public NAD+ marketing regardless of clinical appropriateness in consultation.",
          "Compliant NAD+ marketing often converts as well as aggressive marketing — outcome-focused framing signals desperation; wellness-focused framing signals confidence.",
        ]}
      />
    </>
  )
}
