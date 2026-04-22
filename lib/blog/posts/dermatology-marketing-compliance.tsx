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
  slug: "dermatology-marketing-compliance",
  title:
    "Dermatology Marketing Compliance: Medical, Cosmetic, and Skin Cancer Claims That Draw Enforcement",
  description:
    "Dermatology practices combine medical dermatology, cosmetic dermatology, and increasingly med-spa-adjacent services. Each creates its own compliance considerations. Here's the full framework.",
  excerpt:
    "Dermatology marketing spans medical dermatology, cosmetic procedures, skin cancer screening, and retail skincare — each with its own compliance rules. Here's the full playbook.",
  date: "2026-04-22",
  readingMinutes: 9,
  keywords: [
    "dermatology marketing compliance",
    "cosmetic dermatology advertising",
    "skin cancer screening marketing",
    "dermatology prescription advertising",
    "dermatology teledermatology compliance",
  ],
  tags: ["Dermatology", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Dermatology practices typically offer a mix of medical
        dermatology (acne, psoriasis, eczema, skin cancer screening),
        cosmetic dermatology (neurotoxins, fillers, lasers,
        chemical peels), and increasingly retail or private-label
        skincare. Each category carries different compliance
        considerations, and the mix makes dermatology marketing one
        of the more complex healthcare marketing surfaces. This post
        covers the category-by-category framework.
      </Lead>

      <H2 id="medical-dermatology">Medical dermatology marketing</H2>

      <H3>Disease-specific treatment claims</H3>
      <BeforeAfter
        bad="Our treatments cure psoriasis, eczema, and acne permanently."
        good="Our practice evaluates and treats psoriasis, eczema, and acne with evidence-based medical protocols. Treatment response varies by individual; ongoing management is typical for chronic conditions."
        reason="Specific disease cure claims cross FDA disease-claim rules. Medical dermatology practices legitimately treat these conditions — marketing should describe evidence-based treatment without claiming cures."
      />

      <H3>Skin cancer screening marketing</H3>
      <P>
        Skin cancer screening marketing is a specific category where
        FTC and state AGs have been active. Claims about detection
        rates, early-detection outcome benefits, and AI-assisted
        screening should be substantiated and framed carefully.
      </P>

      <BeforeAfter
        bad="Our advanced AI screening catches 100% of melanomas earlier than any other method."
        good="We offer comprehensive skin examinations including the use of [specific technology]. Early detection improves outcomes in many cases; no screening method is perfect."
        reason="Absolute detection claims are unsubstantiable. Comparative superiority claims against other methods require head-to-head evidence."
      />

      <H3>Prescription dermatology advertising</H3>
      <P>
        Branded prescription marketing (biologics like Dupixent,
        Humira; topicals like brand-name retinoids) falls under
        prescription drug advertising rules. Most dermatology
        practices don&rsquo;t directly market these brands but do
        reference them in treatment discussions.
      </P>

      <H2 id="cosmetic-dermatology">Cosmetic dermatology marketing</H2>
      <P>
        Cosmetic dermatology shares most of the med spa compliance
        framework &mdash; before/after imagery rules, injectable
        brand-name rules, device FDA-cleared/approved distinctions,
        typical-experience disclosure. See our med spa compliance
        post for the detailed framework that applies.
      </P>

      <H3>Specialty-specific considerations</H3>
      <UL>
        <LI>
          <Strong>Board-certified dermatologist marketing.</Strong>
          ABD certification is widely recognized and supportable
          when accurately stated.
        </LI>
        <LI>
          <Strong>Cosmetic specialty framing.</Strong> Dermatologists
          legitimately offer cosmetic services within their scope;
          &ldquo;cosmetic dermatologist&rdquo; is defensible with
          appropriate backing.
        </LI>
        <LI>
          <Strong>Physician-performed vs delegated procedures.</Strong>
          Clear marketing of who performs what matters both for
          consumer understanding and for state medical board
          compliance.
        </LI>
      </UL>

      <H2 id="retail-skincare">Retail and private-label skincare</H2>
      <P>
        Many dermatology practices sell retail skincare or private-
        label lines. Cosmetic labeling and claim rules apply:
      </P>

      <H3>Cosmetic vs drug boundary</H3>
      <BeforeAfter
        bad="Our private-label cream heals eczema and reduces inflammation."
        good="Our private-label moisturizer is formulated to support skin barrier function and hydration."
        reason="Disease-treatment claims (heals eczema, reduces inflammation in a disease context) convert cosmetics into drugs. Structure-function and cosmetic-benefit language stays within cosmetic regulatory scope."
      />

      <H3>&ldquo;Medical-grade&rdquo; and &ldquo;cosmeceutical&rdquo;</H3>
      <P>
        Neither term has specific FDA definition. Using them in
        marketing creates an implication of regulatory status that
        doesn&rsquo;t exist. Specific framing
        (&ldquo;professional-strength,&rdquo; &ldquo;clinical-grade
        formulation&rdquo;) is typically less problematic than
        implying FDA endorsement.
      </P>

      <H3>Ingredient claims</H3>
      <P>
        Specific ingredient outcome claims (&ldquo;retinol reverses
        aging,&rdquo; &ldquo;vitamin C brightens&rdquo;) need
        substantiation. Ingredient-level claims can be more
        substantiable than product-level claims because research on
        specific ingredients is often robust.
      </P>

      <H2 id="teledermatology">Teledermatology marketing</H2>
      <P>
        Teledermatology adds telehealth-specific rules on top of
        general dermatology compliance:
      </P>
      <UL>
        <LI>
          <Strong>State licensure.</Strong> Teledermatology to patients
          requires provider licensure in the patient&rsquo;s state.
        </LI>
        <LI>
          <Strong>Examination standards.</Strong> Marketing that
          minimizes clinical evaluation has drawn state board
          attention.
        </LI>
        <LI>
          <Strong>Prescribing rules.</Strong> Prescription-based
          teledermatology faces controlled-substance and
          store-and-forward rules depending on the prescriptions.
        </LI>
        <LI>
          <Strong>Asynchronous vs synchronous.</Strong> Marketing
          should accurately describe the actual service model.
        </LI>
      </UL>

      <H2 id="common-mistakes">Common mistakes specific to dermatology marketing</H2>

      <H3>Mistake 1: Conflating cosmetic and medical in claims</H3>
      <P>
        Dermatology practices legitimately offer both but
        sometimes blur the lines in marketing in ways that create
        regulatory overlap. Medical and cosmetic framings each have
        their own compliance considerations, and marketing should
        respect the boundary.
      </P>

      <H3>Mistake 2: Skin cancer scare-based marketing</H3>
      <P>
        Scare-marketing around skin cancer (&ldquo;don&rsquo;t wait,
        skin cancer kills&rdquo;) triggers consumer-protection
        scrutiny when it&rsquo;s paired with promotional offers for
        screening. Informational content about skin cancer is fine;
        fear-based conversion tactics face additional scrutiny.
      </P>

      <H3>Mistake 3: Private-label supplement line marketing</H3>
      <P>
        Dermatology practices selling private-label supplement lines
        for skin, hair, or nail health face DSHEA rules plus FDA
        drug-claim concerns on disease claims. Supplement marketing
        alongside clinical services creates documentation and claim
        challenges.
      </P>

      <H3>Mistake 4: Before/after without medical dermatology context</H3>
      <P>
        Before/after imagery for medical dermatology (acne, rosacea,
        psoriasis) often lacks the clinical context and individual-
        variation framing that medical marketing requires. Treat
        medical dermatology before/after with the same rigor as
        cosmetic dermatology before/after.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I market non-FDA-approved off-label uses?</H3>
      <P>
        Clinical off-label use is standard practice; marketing
        specific off-label uses is a regulatory risk. For
        dermatology, this often involves biologics used for
        conditions beyond their labeled indications.
      </P>

      <H3>What about cosmetic claim substantiation?</H3>
      <P>
        Cosmetic claims still need substantiation under FTC rules,
        though the evidentiary bar is less strict than for drug
        claims. Specific outcome claims (&ldquo;reduces wrinkles by
        X%&rdquo;) need supporting evidence.
      </P>

      <H3>Does physician endorsement of products create material connection?</H3>
      <P>
        If the physician has a financial interest in the product,
        yes &mdash; and the relationship should be disclosed in the
        endorsement. This is common in private-label situations and
        is sometimes missed in disclosure practice.
      </P>

      <H3>How do I handle prescription-related content?</H3>
      <P>
        General patient education about conditions and treatment
        categories is generally lower-risk. Specific
        prescription-drug promotion by brand name falls under
        prescription advertising rules with fair-balance
        requirements.
      </P>

      <H3>What about social media aesthetic content from dermatologists?</H3>
      <P>
        Dermatologists&rsquo; personal and professional social media
        content discussing their practice is subject to the same
        rules as the practice&rsquo;s official marketing. Personal
        accounts that discuss practice services aren&rsquo;t exempt.
      </P>

      <H3>Are there derm-specific insurance considerations?</H3>
      <P>
        Dermatology malpractice insurance may have specific
        provisions about cosmetic vs medical practice scope.
        Advertising exposure (FTC claims, private class action) is
        typically covered differently than malpractice. Review
        policies specifically.
      </P>

      <KeyTakeaways
        items={[
          "Dermatology marketing combines medical, cosmetic, retail skincare, and teledermatology — each with its own compliance framework.",
          "Specific disease cure claims for dermatologic conditions trigger FDA drug-claim rules even though dermatologists legitimately treat these conditions.",
          "'Medical-grade' and 'cosmeceutical' are not defined regulatory terms — using them implies endorsement that doesn't exist.",
          "Skin cancer screening marketing faces FTC and state AG scrutiny around detection claims and scare-based conversion tactics.",
          "Private-label skincare and supplement lines add DSHEA and cosmetic-drug boundary considerations to core dermatology marketing.",
        ]}
      />
    </>
  )
}
