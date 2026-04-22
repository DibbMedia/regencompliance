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
  slug: "peptide-therapy-marketing-compliance",
  title:
    "Peptide Therapy Marketing Compliance: BPC-157, Ipamorelin, and the FDA Schedule Changes That Shifted Everything",
  description:
    "Peptide therapy marketing - BPC-157, Ipamorelin, TB-500, and adjacent compounds - faces a specifically shifting regulatory landscape. Here's what the FDA schedule changes mean for clinic marketing and how to stay compliant.",
  excerpt:
    "The FDA scheduled several commonly-marketed peptides as prohibited for compounding in recent years. Peptide clinic marketing that hasn't updated is operating in a different regulatory world than it started in. Here's the current framework.",
  date: "2026-04-22",
  readingMinutes: 10,
  keywords: [
    "peptide therapy marketing compliance",
    "BPC-157 marketing rules",
    "Ipamorelin advertising compliance",
    "peptide clinic FDA",
    "503A 503B peptide",
  ],
  tags: ["Peptide", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Peptide therapy marketing exploded in wellness and longevity
        clinics in the late 2010s and early 2020s. BPC-157,
        Ipamorelin, TB-500, Sermorelin, CJC-1295, PT-141, and others
        became fixtures in wellness clinic service menus. In 2023,
        the FDA restricted compounding of several commonly-marketed
        peptides. The regulatory landscape has shifted substantially,
        and peptide clinic marketing that hasn&rsquo;t updated to
        reflect the current status is operating in a different
        regulatory environment than it started in.
      </Lead>

      <H2 id="what-changed">What changed at the FDA</H2>
      <P>
        The FDA&rsquo;s 503A compounding framework evaluates specific
        substances for compounding eligibility. Several peptides
        commonly used in wellness practice - including BPC-157
        - were placed on the Category 2 list (significant
        safety risks), effectively restricting 503A compounding.
        Other peptides remain available through various pathways but
        with specific restrictions.
      </P>

      <P>
        For clinics: marketing peptides that are no longer
        appropriately compoundable, or marketing peptide therapy in
        ways that don&rsquo;t reflect the current regulatory status,
        creates both substantiation issues (claims the practice
        can&rsquo;t substantiate) and potential misbranding issues
        (marketing products that can&rsquo;t legally be provided in
        the way described).
      </P>

      <Callout variant="warn" title="This changes quickly">
        Peptide regulatory status has been in flux. FDA Category 1/2/3
        assignments, 503A vs 503B pathway questions, and specific
        compounding-pharmacy availability change. Marketing should
        reflect the current regulatory status, not the status that
        existed when the marketing was written 18 months ago.
      </Callout>

      <H2 id="problem-patterns">The specific problem patterns</H2>

      <H3>Pattern 1: Marketing restricted peptides as broadly available</H3>
      <BeforeAfter
        bad="BPC-157 - healing and recovery peptide now available at our clinic."
        good="(If a peptide is no longer appropriately compoundable for your state/pharmacy situation, remove it from marketing. Marketing products that cannot legally be provided is a misrepresentation issue beyond the standard compliance concerns.)"
        reason="Marketing peptides whose compounding status has been restricted creates a false impression that the product is readily available through standard channels."
      />

      <H3>Pattern 2: Disease-specific outcome claims</H3>
      <BeforeAfter
        bad="BPC-157 heals leaky gut, tendonitis, and accelerates injury recovery."
        good="Our practice offers a range of peptide therapy options for appropriate candidates with specific clinical concerns; the specific peptides, their current regulatory status, and candidacy are discussed at consultation."
        reason="Disease and condition-specific treatment claims on peptides trigger FDA drug-claim rules regardless of the compounding-pharmacy status."
      />

      <H3>Pattern 3: Performance and body composition claims</H3>
      <BeforeAfter
        bad="Ipamorelin and CJC-1295 - build lean muscle, lose fat, improve recovery."
        good="Growth hormone-releasing peptides are one option in our comprehensive approach to specific clinical goals; we discuss candidacy and current options at consultation."
        reason="Performance claims need substantiation; peptide-specific performance claims typically cannot meet the FTC evidence standard."
      />

      <H3>Pattern 4: Anti-aging and longevity claims</H3>
      <BeforeAfter
        bad="Peptide therapy - turn back the clock and extend your lifespan."
        good="Peptides are a broad category of signaling molecules involved in various biological processes. Research on specific peptides continues; our practice offers peptide options for clinically appropriate candidates."
        reason="Anti-aging and longevity claims are FTC enforcement priorities. Biology-first framing is compliant; longevity outcome claims are not."
      />

      <H3>Pattern 5: Research chemical sourcing</H3>
      <BeforeAfter
        bad="High-purity research-grade BPC-157 available for your wellness goals."
        good="(Remove research-chemical sourcing from clinic marketing. Research-chemical framing is specifically concerning from both FDA and state controlled substance perspectives.)"
        reason="Research-chemical sourcing has specifically been cited in FDA action. Clinic marketing of research-chemical-sourced peptides is a high-risk pattern that involves more than just claim-level issues."
      />

      <H3>Pattern 6: Injectable peptide marketing to at-home use</H3>
      <BeforeAfter
        bad="Weekly at-home peptide injections - convenient, effective, affordable."
        good="Our in-clinic peptide protocol includes scheduled injections administered under clinical supervision; appropriate monitoring is part of our program."
        reason="At-home injectable peptide marketing raises both supervision and safety considerations that regulators have cited. In-clinic framing is both clinically safer and compliance-safer."
      />

      <H2 id="compliant-framework">Compliant peptide therapy marketing framework</H2>

      <H3>Inventory current regulatory status</H3>
      <P>
        Maintain a current inventory of which peptides you offer,
        under which pathway (503A compounded, 503B, other), and the
        current FDA status of each. Update this inventory as the
        regulatory landscape shifts. Marketing should match the
        current inventory.
      </P>

      <H3>Generic category-first marketing</H3>
      <P>
        &ldquo;Peptide therapy options for appropriate
        candidates&rdquo; as category-first marketing allows
        substitution as specific peptides change status. Marketing
        that depends on the availability of specific peptides by
        name creates maintenance overhead and regulatory risk when
        those peptides are restricted.
      </P>

      <H3>Evidence-honest framing</H3>
      <P>
        The clinical evidence for many peptides in specific
        indications is genuinely early-stage or non-existent. Honest
        framing acknowledges this: &ldquo;Peptides as a broad
        category involve substantial ongoing research; specific
        peptides have varying evidence bases for specific
        applications.&rdquo;
      </P>

      <H3>Clinical-appropriateness forward</H3>
      <P>
        Market the clinical evaluation process rather than the
        specific peptide products. &ldquo;We evaluate patients for
        appropriateness for specific peptide therapy options based
        on clinical goals, medical history, and current regulatory
        availability&rdquo; positions the practice appropriately.
      </P>

      <H2 id="specialty-specific">Specialty-specific considerations</H2>

      <H3>Sports medicine and recovery practices</H3>
      <P>
        Marketing peptides for specific sports injuries or recovery
        outcomes combines peptide-specific issues with general
        sports-medicine substantiation issues. Use caution with
        specific-injury marketing.
      </P>

      <H3>Longevity and wellness practices</H3>
      <P>
        Longevity-framed practices face both peptide-specific issues
        and the general FTC focus on longevity claims. Combining
        peptides into longevity marketing packages can multiply
        compliance exposure.
      </P>

      <H3>Hormone and TRT clinics</H3>
      <P>
        Many hormone clinics incorporate growth hormone-releasing
        peptides (Sermorelin, Ipamorelin, CJC-1295). Marketing these
        alongside TRT creates combined compliance considerations from
        both specialty frameworks.
      </P>

      <H3>Sexual wellness practices</H3>
      <P>
        PT-141 (bremelanotide) and similar peptides in sexual wellness
        context face disease-specific claim issues (sexual dysfunction
        is a diagnosable condition). Vyleesi (bremelanotide) has
        FDA-approved specific indications that allow more specific
        marketing; compounded versions do not.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I still market Sermorelin?</H3>
      <P>
        Sermorelin has FDA-approved indications; specific compounding
        availability for clinic use depends on your pharmacy
        relationships and current regulatory status. Market
        specifically and keep the marketing current with your actual
        availability.
      </P>

      <H3>What about international sourcing?</H3>
      <P>
        International sourcing of peptides for US clinic use raises
        importation, customs, and FDA regulatory concerns beyond the
        standard marketing-compliance issues. This is a legal-counsel
        question, not a marketing question.
      </P>

      <H3>Is telehealth peptide prescribing still viable?</H3>
      <P>
        Depending on the specific peptide, state, and pharmacy
        relationship. Specific compounding-pharmacy availability and
        state prescribing rules apply. Marketing telehealth peptide
        services requires keeping pace with both the marketing-level
        compliance and the underlying regulatory viability of the
        service model.
      </P>

      <H3>Are injectable peptides different from oral peptides?</H3>
      <P>
        Regulatorily, both are subject to compounding-pharmacy rules
        and FDA claim rules. Practically, oral peptides have their own
        absorption and efficacy questions that affect substantiation
        of any efficacy claims made.
      </P>

      <H3>What documentation should peptide clinics maintain?</H3>
      <P>
        Current inventory of peptides offered and regulatory status,
        compounding-pharmacy documentation, substantiation files for
        any efficacy claims, patient intake and consent documentation,
        and regular review of regulatory status changes affecting
        current offerings.
      </P>

      <H3>Should I drop aggressive peptide marketing?</H3>
      <P>
        Many practices have substantially revised peptide marketing
        in response to the 2023 regulatory changes. Continuing
        aggressive pre-2023 marketing patterns is demonstrably
        higher-risk than it was two years ago. A marketing refresh
        that reflects current reality is both lower-risk and typically
        converts better with informed patients.
      </P>

      <KeyTakeaways
        items={[
          "FDA compounding category assignments in 2023 restricted availability of several commonly-marketed peptides including BPC-157.",
          "Marketing that hasn't been updated to reflect current regulatory status creates both misrepresentation risk and substantiation issues.",
          "Generic category-first marketing ('peptide therapy options') is more resilient than specific-peptide marketing that requires updating as availability shifts.",
          "Research-chemical sourcing framing has been specifically cited in enforcement and should not appear in clinic marketing.",
          "At-home injectable peptide marketing carries additional supervision concerns beyond in-clinic framing.",
        ]}
      />
    </>
  )
}
