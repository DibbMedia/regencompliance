import Link from "next/link"
import type { BlogPostMeta } from "@/lib/blog/types"
import {
  H2,
  H3,
  P,
  Lead,
  UL,
  LI,
  Strong,
  Callout,
  BeforeAfter,
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "nad-iv-therapy-marketing-fda-position",
  title:
    "NAD+ IV Therapy Marketing and the FDA Position: What Actually Has Approval, What Does Not, and How to Word It",
  description:
    "NAD+ IV therapy marketing routinely overstates FDA status. Here is what the FDA position actually is on NAD+, nicotinamide riboside, and related infusion products, and how to write marketing copy that does not borrow approval status that does not exist.",
  excerpt:
    "Most NAD+ IV therapy marketing trouble is upstream of the FTC longevity-claim issue. It is the quiet implication that NAD+ has some kind of FDA status it does not have. Here is the actual FDA position and how to word a NAD+ program page around it.",
  date: "2026-05-19",
  readingMinutes: 9,
  keywords: [
    "NAD+ IV therapy marketing FDA",
    "NAD IV infusion FDA position",
    "nicotinamide riboside DSHEA",
    "NAD+ compounding rules",
    "NAD IV therapy compliance",
  ],
  tags: ["NAD+", "IV therapy", "Longevity", "Modality playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Modality playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Most NAD+ IV therapy marketing trouble is not the longevity
        claim. The longevity-claim issue is downstream. The upstream
        issue, and the one that survives every rewrite of the
        anti-aging language, is the quiet implication that NAD+ has
        some kind of FDA approval status that it does not have. Once you
        get the FDA-status sentence right, the rest of the page is
        easier to write.
      </Lead>

      <P>
        This is a focused note on the FDA position around NAD+ infusion
        products and the marketing language that survives a regulator
        review. For the broader longevity, anti-aging, and cognitive-
        enhancement claim categories, see our companion post on{" "}
        <Link
          href="/blog/nad-plus-marketing-compliance"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          NAD+ marketing compliance
        </Link>
        .
      </P>

      <Callout variant="info" title="The one-sentence FDA position">
        NAD+ as administered in most IV therapy and wellness clinics is
        not FDA-approved for any indication. Nicotinamide (vitamin B3) is
        an approved drug for specific medical uses; over-the-counter
        nicotinamide riboside and nicotinamide mononucleotide are
        regulated as dietary supplements under DSHEA, with the limits
        and disclaimers that framework requires.
      </Callout>

      <H2 id="status">What actually has FDA status, in plain language</H2>
      <UL>
        <LI>
          <Strong>Nicotinamide.</Strong> A form of vitamin B3, available
          as an FDA-approved prescription product for specific medical
          uses such as pellagra. This is not the same product as a
          compounded NAD+ IV bag.
        </LI>
        <LI>
          <Strong>Nicotinamide riboside (NR) and nicotinamide
          mononucleotide (NMN).</Strong> Sold as dietary supplements.
          NMN&rsquo;s regulatory posture has shifted; FDA has taken the
          position that NMN does not qualify as a dietary ingredient
          because it was first studied as a drug. NR continues to be
          marketed as a supplement under DSHEA. Either way, this is the
          supplement framework, with the required DSHEA disclaimer.
        </LI>
        <LI>
          <Strong>NAD+ for IV infusion.</Strong> Typically prepared as a
          compounded sterile preparation by a licensed compounding
          pharmacy under section 503A or 503B. There is no FDA-approved
          drug product called NAD+ for IV infusion. The compounded
          product is not the same as an approved drug.
        </LI>
        <LI>
          <Strong>NAD+ subcutaneous injections.</Strong> Same
          regulatory posture as IV - compounded preparation, no FDA
          approval as a finished drug product for the marketed
          indications.
        </LI>
      </UL>

      <H2 id="pitfalls">Five FDA-position pitfalls in NAD+ marketing</H2>

      <H3>Pitfall 1: Borrowing nicotinamide&rsquo;s status for NAD+</H3>
      <BeforeAfter
        bad="NAD+ is an FDA-approved compound used in medical treatment."
        good="NAD+ as administered in our IV program is a compounded sterile preparation provided by a licensed compounding pharmacy. There is no FDA-approved drug product called NAD+ for IV infusion in the wellness context. Nicotinamide, a related vitamin B3 compound, has separate FDA-approved uses."
        reason="The bad version blurs nicotinamide approval status onto compounded NAD+. The FDA does not treat these as the same product, and warning letters in adjacent compounded-product categories show this is the kind of equivalence the agency reads as misleading."
      />

      <H3>Pitfall 2: Calling compounded NAD+ a drug therapy</H3>
      <BeforeAfter
        bad="NAD+ therapy is a cellular medicine that reverses age-related decline."
        good="NAD+ IV is a wellness service that delivers a compounded preparation of nicotinamide adenine dinucleotide; it is not an FDA-approved treatment for aging or any disease."
        reason="Therapy and medicine for a non-approved indication moves the copy into disease-claim territory under FDA rules. Wellness service or program is the framing that holds up."
      />

      <H3>Pitfall 3: Importing supplement-tier evidence for the IV product</H3>
      <BeforeAfter
        bad="A landmark NAD+ study showed it boosts cellular energy in humans."
        good="Research on NAD+ precursor supplementation in humans is ongoing; findings to date typically involve oral nicotinamide riboside or nicotinamide mononucleotide in healthy adults, not compounded IV NAD+. We do not extrapolate those results to IV outcomes."
        reason="Most of the citeable human research on the NAD+ axis is in oral precursors, not in compounded IV. Borrowing oral-supplement evidence to substantiate an IV product is the Pom Wonderful FTC substantiation pattern."
      />

      <H3>Pitfall 4: DSHEA disclaimer missing on supplement adjuncts</H3>
      <BeforeAfter
        bad="Maintain your NAD+ between visits with our daily NR capsules - supports energy, focus, and longevity."
        good="Our daily NR supplement is a dietary supplement that supports cellular function. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."
        reason="If you sell NR or NMN alongside the IV, that part of the offer is under DSHEA. The disclaimer is mandatory and longevity is the kind of word that pushes a structure-function claim into disease-claim territory."
      />

      <H3>Pitfall 5: Medical-grade and pharmaceutical-grade euphemisms</H3>
      <BeforeAfter
        bad="Our pharmaceutical-grade NAD+ delivers what supplements cannot."
        good="Our NAD+ IV uses a compounded sterile preparation from a state-licensed compounding pharmacy. Compounded is the accurate term; the product is not a pharmaceutical-grade manufactured drug."
        reason="Pharmaceutical-grade and medical-grade are marketing words, not FDA terms of art. When used to imply parity with an approved drug, they cross into the same equivalence pattern as FDA-approved."
      />

      <H2 id="program-page-language">A defensible NAD+ program page sentence-by-sentence</H2>
      <P>
        The following is the kind of language we see survive review.
        Adapt the wording to your clinic; the structure is the part that
        matters.
      </P>
      <UL>
        <LI>
          <Strong>What it is:</Strong> NAD+ IV is a wellness service in
          which a compounded preparation of nicotinamide adenine
          dinucleotide is administered intravenously by licensed clinical
          staff.
        </LI>
        <LI>
          <Strong>FDA status:</Strong> NAD+ for IV infusion in the
          wellness context is a compounded preparation. It is not an
          FDA-approved drug product, and is not approved by the FDA for
          any specific medical indication.
        </LI>
        <LI>
          <Strong>What patients report:</Strong> Some patients describe
          subjective improvements in energy or mental clarity after
          treatment; these are individual experiences and do not
          represent clinical evidence of specific outcomes.
        </LI>
        <LI>
          <Strong>What we do not claim:</Strong> We do not claim NAD+
          treats, prevents, or reverses aging, cognitive decline,
          neurodegenerative disease, addiction, or any other medical
          condition.
        </LI>
        <LI>
          <Strong>Who decides:</Strong> Eligibility is determined during
          a clinical consultation; NAD+ is not appropriate for every
          patient.
        </LI>
      </UL>

      <Callout variant="success" title="NAD+ rules in the scanner">
        <span>
          RegenCompliance flags FDA-status overstatement, drug-vs-wellness
          framing, supplement-vs-IV substantiation mismatch, and missing
          DSHEA disclaimers on the supplement layer of NAD+ programs.{" "}
          <Link
            href="/apply"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            Apply for the founder beta
          </Link>{" "}
          or browse the full{" "}
          <Link
            href="/coverage"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            modality coverage list
          </Link>
          .
        </span>
      </Callout>

      <H2 id="adjacent">Adjacent reading</H2>
      <P>
        NAD+ infusion programs frequently sit next to ozone and other IV
        offerings inside the same clinic. The ozone marketing rules are
        narrower and sharper - see{" "}
        <Link
          href="/blog/ozone-therapy-marketing-compliance-rules"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          ozone therapy marketing compliance
        </Link>{" "}
        for the parallel.
      </P>

      <KeyTakeaways
        items={[
          "NAD+ IV in the wellness context is a compounded preparation; it is not an FDA-approved drug product, and approval borrowed from nicotinamide is not the same thing.",
          "Nicotinamide riboside and nicotinamide mononucleotide are regulated as dietary supplements under DSHEA; the disclaimer is mandatory when those are on the page.",
          "Most citeable human NAD+ research is in oral precursors, not in compounded IV - borrowing oral evidence to substantiate IV claims is a recurring FTC substantiation pattern.",
          "Therapy, medicine, pharmaceutical-grade, and medical-grade all push a wellness service toward disease-claim or equivalence-with-approved-drug framing.",
          "Lead the program page with what NAD+ actually is and what its FDA status actually is, in plain language - the rest of the longevity-claim work gets easier once that paragraph is right.",
        ]}
      />
    </>
  )
}
