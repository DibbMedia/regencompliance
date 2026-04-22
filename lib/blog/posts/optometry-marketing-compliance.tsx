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
  slug: "optometry-marketing-compliance",
  title:
    "Optometry Marketing Compliance: Contact Lens Rules, Dry Eye Treatment Claims, and Myopia Management Marketing",
  description:
    "Optometry practices face specific marketing rules around contact lens sales (FTC Contact Lens Rule), dry eye treatment claims, myopia management marketing, and retail optical versus clinical framing.",
  excerpt:
    "Optometry marketing combines retail optical rules, FDA device considerations, FTC contact lens rules, and specific claim categories like dry eye treatment and myopia management. Here's the framework.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "optometry marketing compliance",
    "FTC contact lens rule",
    "dry eye treatment advertising",
    "myopia management marketing",
    "optometrist advertising rules",
  ],
  tags: ["Optometry", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Optometry practices operate under a distinct mix of
        compliance rules: state optometry licensing boards, the FTC
        Contact Lens Rule (which specifically governs contact lens
        sales), FDA device considerations for various
        treatments, and specific claim-category rules for dry eye
        treatment and myopia management marketing. The retail
        optical layer adds consumer-product rules on top.
      </Lead>

      <H2 id="ftc-contact-lens-rule">The FTC Contact Lens Rule</H2>
      <P>
        The FTC Contact Lens Rule (16 CFR Part 315) regulates
        contact lens prescriptions and sales. Marketing implications:
      </P>
      <UL>
        <LI>
          Prescriptions must be provided to patients automatically
          after eye exams; marketing cannot imply prescriptions are
          optional or additional-fee services.
        </LI>
        <LI>
          Automatic-refill programs and subscription models need
          specific disclosure.
        </LI>
        <LI>
          Pricing marketing for exam services shouldn&rsquo;t bundle
          prescription release with service charges.
        </LI>
        <LI>
          Online contact lens retailers face specific rules about
          prescription verification.
        </LI>
      </UL>

      <H2 id="dry-eye">Dry eye treatment marketing</H2>
      <P>
        Dry eye treatment is one of the fastest-growing optometry
        service categories. Compliance considerations:
      </P>
      <UL>
        <LI>
          Specific treatment claims (IPL, LipiFlow, punctal plugs,
          prescription eye drops) need substantiation matching the
          specific device or treatment.
        </LI>
        <LI>
          FDA-cleared vs FDA-approved distinction applies to
          devices (most dry eye devices are cleared).
        </LI>
        <LI>
          Claims about specific outcomes (improved tear production,
          specific symptom resolution timelines) need substantiation.
        </LI>
      </UL>

      <H2 id="myopia-management">Myopia management marketing</H2>
      <P>
        Myopia management (orthokeratology, low-dose atropine,
        special contact lenses, behavioral interventions) is a
        growing pediatric service line.
      </P>
      <UL>
        <LI>
          Specific myopia-progression-slowing claims need published
          evidence supporting the specific intervention.
        </LI>
        <LI>
          Atropine is off-label for myopia management in most
          circumstances; marketing should reflect this.
        </LI>
        <LI>
          Pediatric marketing considerations apply (see pediatric
          practice marketing compliance post).
        </LI>
      </UL>

      <H2 id="refractive-surgery">Refractive surgery marketing</H2>
      <P>
        LASIK, PRK, SMILE, and ICL marketing follows general
        surgical marketing framework. Specific issues:
      </P>
      <UL>
        <LI>
          Outcome promises (20/20 vision guaranteed) are
          unsubstantiable.
        </LI>
        <LI>
          Pricing marketing should clearly disclose total cost.
        </LI>
        <LI>
          Candidacy-specific outcomes should be framed individually.
        </LI>
        <LI>
          Comparison between refractive surgery types needs
          substantiation.
        </LI>
      </UL>

      <H2 id="state-rules">State optometry board rules</H2>
      <P>
        State optometry boards have varying advertising rules and
        scope-of-practice rules (some states allow broader treatment
        including minor surgery, others more restricted). Marketing
        should match actual scope.
      </P>

      <H2 id="retail-considerations">Retail optical considerations</H2>
      <P>
        Optical retail (frames, lenses, sunglasses) adds
        consumer-product marketing rules on top of the clinical
        layer:
      </P>
      <UL>
        <LI>
          Pricing disclosure for packages (frames + lenses +
          coatings).
        </LI>
        <LI>
          Brand-name lens marketing.
        </LI>
        <LI>
          Guarantee and warranty language.
        </LI>
      </UL>

      <H2 id="compliant-framework">Compliant optometry marketing framework</H2>
      <UL>
        <LI>
          <Strong>FTC Contact Lens Rule compliance.</Strong>
          Especially for practices selling contacts.
        </LI>
        <LI>
          <Strong>Accurate FDA device status.</Strong> Cleared vs
          approved, specific indications.
        </LI>
        <LI>
          <Strong>Service-and-examination-forward framing.</Strong>
          Consultation and comprehensive examination as the
          entry point.
        </LI>
        <LI>
          <Strong>Conservative outcome framing for refractive surgery.</Strong>
          Most patients achieve significant vision improvement;
          individual outcomes vary.
        </LI>
        <LI>
          <Strong>Accurate scope-of-practice representation.</Strong>
          State-specific for treatment services.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Does the FTC Contact Lens Rule apply to my practice?</H3>
      <P>
        If you prescribe or sell contact lenses, yes. The Rule
        covers prescribers and sellers. Specific compliance
        requirements include automatic prescription release and
        verification procedures for online sales.
      </P>

      <H3>Can I market specific LASIK outcome percentages?</H3>
      <P>
        With substantiation from specific device clinical data.
        Practice-specific outcome claims need your actual outcome
        data. General &ldquo;99% satisfaction&rdquo; marketing is
        typically unsubstantiable.
      </P>

      <H3>What about dry eye treatment device marketing?</H3>
      <P>
        Accurate FDA-cleared status, specific labeled indications,
        published clinical evidence for specific claims. Most dry
        eye devices are cleared for specific indications; marketing
        within those is generally fine.
      </P>

      <H3>How should I market myopia management to parents?</H3>
      <P>
        With substantiation for specific interventions and honest
        framing of the evidence state. Different myopia management
        approaches have different evidence bases; accurate
        representation matters.
      </P>

      <H3>What about online eye exam marketing?</H3>
      <P>
        Online refraction services face specific FTC and state
        board attention. Marketing should accurately represent
        what online services can and cannot provide, and the role
        of in-person examination.
      </P>

      <H3>What documentation should optometry practices maintain?</H3>
      <P>
        Contact Lens Rule compliance records, device FDA clearance
        documentation, substantiation for efficacy claims, state
        scope-of-practice documentation, and standard healthcare
        marketing records.
      </P>

      <KeyTakeaways
        items={[
          "The FTC Contact Lens Rule specifically governs contact lens marketing and prescription handling — compliance affects pricing and service marketing.",
          "Dry eye treatment device marketing needs accurate FDA-cleared status and evidence-backed efficacy claims.",
          "Myopia management marketing requires substantiation for specific interventions; atropine is typically off-label.",
          "Refractive surgery outcome claims need candidacy-specific framing; broad percentage claims are typically unsubstantiable.",
          "State optometry board scope-of-practice varies; marketing should match authorized services.",
        ]}
      />
    </>
  )
}
