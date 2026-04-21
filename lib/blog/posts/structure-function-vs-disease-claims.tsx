import Link from "next/link"
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
  BeforeAfter,
  StatCard,
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "structure-function-vs-disease-claims",
  title:
    "Structure/Function Claims vs. Disease Claims: The One FDA Distinction That Determines Whether Your Marketing Is Legal",
  description:
    "The difference between a legal structure/function claim and an illegal disease claim is the single most important line in healthcare marketing. Here is how the FDA actually draws it, with plain-English examples for every specialty.",
  excerpt:
    "One line separates legal marketing from a warning letter: the difference between a structure/function claim and a disease claim. Most practice owners think they know where the line is. They are usually wrong by one or two key phrases.",
  date: "2026-04-21",
  readingMinutes: 11,
  keywords: [
    "structure function claims FDA",
    "disease claims FDA marketing",
    "healthcare marketing compliance",
    "med spa claims compliance",
    "supplement claims FDA",
    "healthcare advertising rules",
  ],
  tags: ["FDA regulation", "Marketing claims", "Evergreen"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Foundational",
}

export default function Body() {
  return (
    <>
      <Lead>
        If you understand exactly one thing about FDA enforcement of healthcare
        marketing, understand this: the difference between a legal{" "}
        <Em>structure/function</Em> claim and an illegal <Em>disease</Em> claim is
        the line that every warning letter is drawn on. Most clinic owners think
        they know where the line is. After reading a few hundred warning letters,
        the pattern is clear &mdash; they are usually wrong by exactly one or two
        words.
      </Lead>

      <P>
        This article walks through what the distinction actually is in the
        FDA&rsquo;s own regulatory framework, why it exists, how to keep
        structure/function claims on the legal side of the line, and the five
        specific traps that turn an otherwise-compliant claim into a disease claim
        by accident.
      </P>

      <H2 id="the-core-distinction">The core distinction in plain English</H2>

      <P>
        The FDA regulates drugs and devices based on their <Strong>intended
        use</Strong>. Intended use is determined by what you say the product or
        procedure is for &mdash; not by what it biologically does. This is the
        part that confuses almost every new clinic owner.
      </P>

      <BQ>
        A product becomes a drug when you say it treats, cures, prevents, or
        mitigates a disease. It does not matter whether the statement is true. It
        does not matter whether you have clinical data. The claim itself changes
        the regulatory classification.
      </BQ>

      <P>This creates two fundamentally different types of claim:</P>

      <UL>
        <LI>
          <Strong>Structure/function claims</Strong> describe what a product or
          procedure does to the structure or function of the human body without
          reference to a named disease state. Example: &ldquo;supports joint
          comfort,&rdquo; &ldquo;maintains healthy immune function.&rdquo; These
          claims are legal for unapproved products with appropriate disclaimers.
        </LI>
        <LI>
          <Strong>Disease claims</Strong> describe what a product or procedure
          does to a named disease, diagnosable medical condition, or specific
          pathology. Example: &ldquo;cures arthritis,&rdquo; &ldquo;treats
          chronic fatigue syndrome.&rdquo; These claims require FDA approval for
          the specific indication. Without that approval, the claim is illegal.
        </LI>
      </UL>

      <Callout variant="info" title="The practical test">
        If a competent pharmacist reading your copy could name the FDA-indicated
        drug that would cover what you are claiming, you are making a disease
        claim. If the mechanism is described generally (&ldquo;supports,&rdquo;
        &ldquo;maintains,&rdquo; &ldquo;helps with normal&hellip;&rdquo;), you are
        probably in structure/function territory.
      </Callout>

      <H2 id="why-this-exists">Why this distinction exists</H2>
      <P>
        The line exists because the FDA drug-approval process (for small molecules
        and biologics) and the device-clearance process (510(k), De Novo, PMA) are
        built around a specific assertion: that this product, for this indicated
        use, at this dose and route, is safe and effective. Removing the indicated
        use from that assertion breaks the entire regulatory framework.
      </P>
      <P>
        If any compound could be marketed as a cure for any condition without
        going through the approval process, no drug company would ever pay for an
        approval. The structure/function-versus-disease line is what keeps the
        approval system intact.
      </P>
      <P>
        The FDA does not care whether your treatment works. It cares whether you
        are saying it works for something that requires approval.
      </P>

      <H2 id="the-five-traps">
        The five traps that convert a compliant claim into a disease claim
      </H2>

      <H3>Trap 1: Naming the condition in any form</H3>
      <P>
        This is the most common error and the most straightforward to fix. The
        moment you name a specific medical condition &mdash; arthritis,
        fibromyalgia, chronic pain, alopecia, rosacea, depression, erectile
        dysfunction, diabetes, endometriosis &mdash; in proximity to your
        product, you have made a disease claim.
      </P>

      <BeforeAfter
        bad="PRP therapy for chronic joint pain and arthritis."
        good="PRP therapy may support joint comfort and normal range of motion."
        reason="&ldquo;Arthritis&rdquo; is a named disease. &ldquo;Chronic pain&rdquo; is a diagnosable medical condition. Either one, tied to a procedure, creates drug/device-level regulatory obligations."
      />

      <H3>Trap 2: Implying the condition without naming it</H3>
      <P>
        The FDA is not impressed by creative paraphrasing. Describing a disease by
        its symptoms, referring to it by a slang or consumer label, or using an
        image or context that unambiguously identifies the condition is treated as
        if the condition had been named.
      </P>

      <BeforeAfter
        bad="For patients who struggle to have children &mdash; our regenerative protocol may be the answer."
        good="Not a compliant rewrite &mdash; reproductive medical conditions cannot be addressed through unapproved regenerative therapies marketed to the public, regardless of phrasing."
        reason="Even without naming infertility explicitly, the claim is identifiable to the condition. The FDA treats implied disease claims the same as named disease claims."
      />

      <H3>Trap 3: Treatment language</H3>
      <P>
        The verbs <Em>treat</Em>, <Em>cure</Em>, <Em>heal</Em>, <Em>reverse</Em>,{" "}
        <Em>restore</Em>, <Em>repair</Em>, and <Em>eliminate</Em> are red-flag
        verbs in healthcare marketing. Each one implies a medical intervention for
        a medical condition.
      </P>

      <BeforeAfter
        bad="Our stem cell therapy heals damaged cartilage and restores joint function."
        good="Some patients report improved joint comfort and greater range of motion following treatment. Individual outcomes vary."
        reason="&ldquo;Heals&rdquo; and &ldquo;restores&rdquo; are disease-oriented treatment verbs. The compliant version reports observed patient experience without asserting a clinical outcome."
      />

      <H3>Trap 4: Drug-like language even for non-drug products</H3>
      <P>
        Describing a procedure, device, or supplement using pharmaceutical idiom
        (&ldquo;therapeutic dose,&rdquo; &ldquo;targeted treatment,&rdquo;{" "}
        &ldquo;indicated for&rdquo;) is a disease claim even when the underlying
        product is not a drug.
      </P>

      <BeforeAfter
        bad="Our IV therapy protocol is indicated for patients suffering from chronic fatigue."
        good="Our IV nutrient formulation is designed to help patients maintain normal energy metabolism."
        reason="&ldquo;Indicated for&rdquo; is FDA-approval language. Using it without approval converts the claim into an unapproved drug representation."
      />

      <H3>Trap 5: Testimonials that do the disease claim for you</H3>
      <P>
        A testimonial that makes a disease claim is a disease claim made by the
        clinic. You cannot outsource the regulatory status of the claim by
        pointing at the patient who said it. If you publish the testimonial on a
        channel you control, you own the claim.
      </P>

      <BeforeAfter
        bad={`"After one treatment my rheumatoid arthritis was gone. I can play with my grandkids again." &mdash; real patient quote`}
        good={`Instead of publishing this testimonial, solicit a version that focuses on the patient's subjective experience without naming a condition. Always include typical-experience disclosure when an atypical outcome is featured.`}
        reason="The patient named a specific disease and claimed a cure. Republishing that unchanged makes the clinic responsible for a cure claim for a named condition."
      />

      <H2 id="how-to-write-inside-the-line">
        How to write structure/function claims that still sell
      </H2>
      <P>
        The biggest concern most practice owners have about structure/function
        language is that it sounds weaker than disease-claim language. It does not
        have to. The trick is to lean into specific, verifiable patient experience
        rather than vague abstractions.
      </P>

      <H3>Use specific body-system or function language</H3>
      <P>
        Rather than soft abstractions (&ldquo;supports wellness&rdquo;), name the
        structure or function concretely (&ldquo;supports normal joint
        comfort,&rdquo; &ldquo;supports healthy cellular energy
        production&rdquo;).
      </P>

      <H3>Report patient experience, do not assert clinical outcome</H3>
      <P>
        &ldquo;Some patients report&rdquo; is regulatory gold. It is a factual
        claim about what patients said &mdash; which is substantiable &mdash;
        rather than a claim about what the treatment medically does.
      </P>

      <H3>Keep individual-variation language in every testimonial</H3>
      <P>
        &ldquo;Individual results vary. These results are not typical and are not
        guaranteed.&rdquo; This disclosure is not legal boilerplate you can omit;
        it is part of what makes a featured patient story substantiable under FTC
        endorsement guidance.
      </P>

      <H3>Do not let marketing creative override clinical honesty</H3>
      <P>
        If a claim is too ambitious to phrase without using a disease word, the
        answer is not to phrase it more cleverly. The answer is to stop making that
        claim publicly. Keep aspirational results inside your clinical
        conversations, not inside your ad set.
      </P>

      <Callout variant="warn" title="The compliance scanner test">
        A useful gut check: if you cannot rewrite a sentence compliantly without
        making it meaningfully less persuasive, the original sentence was probably
        illegal marketing, not persuasive marketing. Persuasive marketing survives
        the rewrite; only illegal marketing needs the disease word.
      </Callout>

      <H2 id="special-cases">
        Special cases that trip up specific specialties
      </H2>

      <H3>Regenerative medicine and stem cell</H3>
      <P>
        The combination of &ldquo;stem cell&rdquo; + any disease name is the
        highest-density FDA warning-letter trigger in healthcare right now. Even
        structure/function language can tip into disease-claim territory when
        paired with stem-cell terminology. Err aggressively toward patient-
        experience language.
      </P>

      <H3>Med spa and aesthetics</H3>
      <P>
        Cosmetic conditions that also have a medical classification &mdash;
        rosacea, acne, alopecia, hyperpigmentation, hyperhidrosis &mdash; are
        disease territory. &ldquo;Reduces the appearance of&rdquo; is compliant
        language; &ldquo;treats&rdquo; or &ldquo;cures&rdquo; the same condition
        is not.
      </P>

      <H3>GLP-1 and weight-loss clinics</H3>
      <P>
        Weight loss itself is structure/function territory when phrased in general
        health terms. Obesity, diabetes, and metabolic syndrome are disease
        territory. Compounded GLP-1s have additional drug-identity complications
        that structure/function language does not solve.
      </P>

      <H3>IV therapy and wellness</H3>
      <P>
        NAD+, glutathione, high-dose vitamin C, and hormone-adjacent IV protocols
        are frequently marketed with disease-claim language for chronic fatigue,
        brain fog, migraine, and depression. All four are diagnosable medical
        conditions; none of those claims are legal.
      </P>

      <H3>Dental and cosmetic dentistry</H3>
      <P>
        Structural claims about implants, crowns, and veneers are generally safe
        if they do not extend into medical outcomes. &ldquo;Lifetime&rdquo; and
        &ldquo;permanent&rdquo; guarantees are separate FTC issues independent of
        the FDA disease-claim line.
      </P>

      <H2 id="apply-this">Applying this to your own marketing this week</H2>

      <OL>
        <LI>
          <Strong>List every medical condition named anywhere in your public
          marketing.</Strong> Site, ads, captions, emails. Every instance is a
          candidate for rewrite or removal.
        </LI>
        <LI>
          <Strong>Scan your service pages for treatment verbs.</Strong> Any
          occurrence of <Em>cure</Em>, <Em>heal</Em>, <Em>reverse</Em>,{" "}
          <Em>restore</Em>, <Em>repair</Em>, <Em>eliminate</Em>, or{" "}
          <Em>treat</Em> tied to a procedure is a direct rewrite target.
        </LI>
        <LI>
          <Strong>Pull every testimonial and mark the ones naming a
          condition.</Strong> Either re-solicit a compliant version or remove it.
        </LI>
        <LI>
          <Strong>Add &ldquo;individual results vary&rdquo; as a default
          footer</Strong> on any page or post that features an outcome
          description.
        </LI>
      </OL>

      <Callout variant="success" title="This is exactly what the scanner catches">
        <span>
          RegenCompliance flags disease-claim verbs, named medical conditions,
          implied-condition language, and testimonial compliance issues in
          real time &mdash; and produces a one-click structure/function-safe
          rewrite.{" "}
          <Link
            href="/demo"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            Scan a page of your own content
          </Link>{" "}
          and see what the line looks like on your actual site.
        </span>
      </Callout>

      <KeyTakeaways
        items={[
          "Intended use determines regulatory status. Saying a product treats a disease makes it a drug in the FDA's eyes.",
          "Structure/function language (&ldquo;supports,&rdquo; &ldquo;maintains&rdquo;) is legal; disease language (&ldquo;cures,&rdquo; &ldquo;treats&rdquo; a named condition) is not.",
          "The five traps are: naming the condition, implying it, treatment verbs, drug-like idiom, and testimonials that make the claim for you.",
          "Compliant marketing leans on specific body-system language and patient-experience reporting &mdash; not softer abstractions.",
          "If a claim cannot be rewritten compliantly without losing persuasiveness, it was probably illegal marketing to begin with.",
        ]}
      />
    </>
  )
}
