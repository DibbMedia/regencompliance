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
  slug: "ftc-teeth-straightening-enforcement",
  title:
    "FTC and State AG Enforcement Against Direct-to-Consumer Teeth-Straightening: What the SmileDirectClub Era Taught the Industry",
  description:
    "The SmileDirectClub enforcement saga produced lessons for the broader clear aligner and teeth-straightening industry. Here's what happened, what it established, and what current practices should learn from it.",
  excerpt:
    "SmileDirectClub's collapse followed sustained state dental board and FTC attention. The patterns cited apply to the broader DTC aligner category and traditional orthodontic marketing.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "SmileDirectClub enforcement",
    "DTC aligner enforcement",
    "clear aligner FTC",
    "dental board aligner enforcement",
    "teledentistry orthodontic enforcement",
  ],
  tags: ["Case study", "Dental", "Orthodontic"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Case study",
}

export default function Body() {
  return (
    <>
      <Lead>
        The direct-to-consumer teeth-straightening category &mdash;
        epitomized by SmileDirectClub&rsquo;s rise and collapse
        &mdash; produced sustained regulatory attention from the
        FTC, state dental boards, and state AGs over roughly a
        decade. The patterns cited in those enforcement actions
        apply to the broader clear aligner marketplace, including
        practice-based and traditional orthodontic marketing. This
        post analyzes what happened, what it established, and
        what current practices should learn from it.
      </Lead>

      <H2 id="background">Background</H2>
      <P>
        SmileDirectClub pioneered a direct-to-consumer teeth-
        straightening model that combined online/store-based
        impressioning, remote dentist oversight, mail-order aligners,
        and limited in-person clinical evaluation. At peak, the
        company served hundreds of thousands of patients. It also
        drew sustained regulatory attention.
      </P>

      <H2 id="enforcement-threads">The enforcement threads</H2>

      <H3>State dental board actions</H3>
      <P>
        Multiple state dental boards issued rulings, cease-and-
        desist letters, or began investigations related to DTC
        aligner practices. Issues cited:
      </P>
      <UL>
        <LI>
          Adequacy of clinical evaluation before treatment.
        </LI>
        <LI>
          Supervision representation in marketing.
        </LI>
        <LI>
          Scope-of-practice for dentists providing remote oversight.
        </LI>
        <LI>
          Informed consent adequacy.
        </LI>
      </UL>

      <H3>FTC attention</H3>
      <P>
        The FTC specifically addressed DTC aligner marketing,
        pursuing consumer-protection issues including:
      </P>
      <UL>
        <LI>
          Marketing claims about results and timelines.
        </LI>
        <LI>
          Review-suppression and non-disparagement clauses in
          consumer agreements.
        </LI>
        <LI>
          Complaint-handling practices.
        </LI>
      </UL>

      <H3>Consumer lawsuits and class actions</H3>
      <P>
        Class action litigation alleged various consumer-protection
        violations. Settlement discussions, regulatory attention,
        and operational challenges ultimately contributed to the
        company&rsquo;s dissolution.
      </P>

      <H2 id="what-was-cited">What the enforcement actions specifically cited</H2>

      <H3>Supervision representation</H3>
      <P>
        Marketing implying orthodontic specialist supervision when
        actual supervision was by general dentists via remote
        review. The marketing/reality gap was a primary state
        dental board concern.
      </P>

      <H3>Evaluation adequacy</H3>
      <P>
        Clinical evaluation based on impressions/scans without
        in-person examination, x-rays, or comprehensive
        assessment. Regulators questioned whether this met the
        standard of care for orthodontic treatment.
      </P>

      <H3>Guarantee and outcome claims</H3>
      <P>
        Specific outcome promises without individual case
        evaluation. Marketing that implied treatment suitability for
        all patients regardless of case complexity.
      </P>

      <H3>Non-disparagement clauses</H3>
      <P>
        Consumer contracts containing non-disparagement clauses
        that violated the Consumer Review Fairness Act. This
        became a specific FTC enforcement focus.
      </P>

      <H3>Complaint handling</H3>
      <P>
        Practices around handling consumer complaints, including
        requirements to waive claims or sign agreements to receive
        refunds or treatment adjustments.
      </P>

      <H2 id="lessons-for-industry">Lessons for the broader industry</H2>

      <H3>Lesson 1: Supervision representation matters</H3>
      <P>
        Any aligner or orthodontic practice &mdash; DTC, teledental,
        or traditional &mdash; must accurately represent who is
        supervising treatment and at what level. Implying
        specialist supervision when actual supervision is general
        practice creates exposure regardless of business model.
      </P>

      <H3>Lesson 2: Clinical evaluation standards apply</H3>
      <P>
        State dental boards set clinical evaluation standards.
        Marketing that minimizes evaluation (&ldquo;skip the
        office visit&rdquo;) conflicts with evaluation
        requirements and has drawn specific attention.
      </P>

      <H3>Lesson 3: Non-disparagement clauses are prohibited</H3>
      <P>
        CRFA prohibits clauses that restrict consumer reviews.
        Any provider using such clauses creates specific federal
        law violation exposure.
      </P>

      <H3>Lesson 4: Review practices are scrutinized</H3>
      <P>
        How practices solicit, handle, and respond to consumer
        reviews has become an enforcement area. Review-gating,
        solicitation patterns, and complaint handling all matter.
      </P>

      <H3>Lesson 5: Outcome marketing needs individual-case framing</H3>
      <P>
        Treatment-timeline promises (&ldquo;straight teeth in 6
        months&rdquo;) conflict with case-complexity reality.
        Individual-case framing is both clinically accurate and
        compliance-safer.
      </P>

      <H2 id="current-implications">Current implications</H2>
      <P>
        For current practices, including those operating in the
        DTC or teledental aligner space:
      </P>
      <UL>
        <LI>
          Audit any non-disparagement clauses in consumer
          agreements.
        </LI>
        <LI>
          Review marketing for supervision-representation accuracy.
        </LI>
        <LI>
          Ensure clinical evaluation practices meet state
          standards.
        </LI>
        <LI>
          Implement compliant review solicitation practices
          (no gating, no retaliation).
        </LI>
        <LI>
          Frame outcome marketing around case-specific evaluation
          rather than universal promises.
        </LI>
      </UL>

      <H2 id="broader-lessons">Broader lessons for healthcare marketing</H2>
      <P>
        The DTC aligner category illustrates principles that apply
        broadly:
      </P>
      <OL>
        <LI>
          <Strong>Scaling marketing ahead of compliance scaling
          creates concentrated exposure.</Strong> Rapid growth
          amplifies compliance failures; compliance infrastructure
          needs to scale proportionally.
        </LI>
        <LI>
          <Strong>State-level regulators can be decisive.</Strong>
          State dental boards acting individually and collectively
          shaped this category&rsquo;s trajectory. State-level
          enforcement is a significant vector.
        </LI>
        <LI>
          <Strong>Consumer review practices matter.</Strong>
          Non-disparagement clauses, review gating, complaint
          handling all fall under specific federal and state rules.
        </LI>
        <LI>
          <Strong>Clinical-marketing gap is a durable issue.</Strong>
          When marketing claims exceed clinical practice,
          regulators notice.
        </LI>
      </OL>

      <BQ>
        The DTC aligner era wasn&rsquo;t about any single practice;
        it was about the sustained conflict between marketing
        claims and clinical/regulatory reality. Practices
        operating in the broader aligner space &mdash; or in any
        healthcare category where that gap opens &mdash; should
        learn from the trajectory.
      </BQ>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I still operate a teledental aligner practice?</H3>
      <P>
        Yes, with compliance infrastructure matching the
        specific clinical-evaluation, supervision, and marketing
        standards that apply. Specific state rules vary.
      </P>

      <H3>What about non-disparagement clauses in patient forms?</H3>
      <P>
        Remove them. CRFA prohibits them; they create specific
        federal exposure regardless of whether they&rsquo;re ever
        enforced.
      </P>

      <H3>Does this affect Invisalign and practice-based clear aligner marketing?</H3>
      <P>
        Some lessons apply (outcome guarantees, specialty claims,
        supervision) regardless of business model. Practice-based
        aligner treatment under traditional orthodontic evaluation
        doesn&rsquo;t face the same model-specific issues.
      </P>

      <H3>What about patient review solicitation practices?</H3>
      <P>
        See our review response and FTC Endorsement Guides posts
        for specific framework. Review gating and suppression are
        specific enforcement areas.
      </P>

      <H3>How should I market clear aligner services now?</H3>
      <P>
        See our orthodontic and clear aligner marketing compliance
        post. Candidacy-forward marketing, accurate supervision
        representation, and honest outcome framing.
      </P>

      <H3>Will the DTC aligner category reemerge?</H3>
      <P>
        Various companies continue operating in adjacent models.
        The specific issues cited will continue to be enforcement
        priorities.
      </P>

      <KeyTakeaways
        items={[
          "The DTC aligner enforcement saga produced specific lessons applicable to the broader clear aligner and orthodontic marketing industry.",
          "Supervision representation, clinical evaluation adequacy, and non-disparagement clauses were the primary enforcement threads.",
          "Consumer Review Fairness Act prohibits non-disparagement clauses — all healthcare practices should audit consumer agreements.",
          "Scaling marketing ahead of compliance scaling creates concentrated exposure that can ultimately threaten business operations.",
          "State dental boards were particularly decisive in this category — state-level enforcement is a significant vector.",
        ]}
      />
    </>
  )
}
