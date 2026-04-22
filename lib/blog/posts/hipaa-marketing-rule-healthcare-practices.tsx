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
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "hipaa-marketing-rule-healthcare-practices",
  title:
    "The HIPAA Marketing Rule for Healthcare Practices: When You Need Patient Authorization and When You Don't",
  description:
    "HIPAA's marketing rule restricts how patient information (PHI) can be used in marketing. Here's what counts as marketing under HIPAA, when patient authorization is required, and what the exceptions actually cover.",
  excerpt:
    "Most healthcare practices conflate HIPAA compliance with FTC compliance — they're different regulatory regimes with different rules. Here's the HIPAA-specific framework for marketing that uses any patient information.",
  date: "2026-04-22",
  readingMinutes: 9,
  keywords: [
    "HIPAA marketing rule",
    "HIPAA patient authorization marketing",
    "PHI marketing use healthcare",
    "patient testimonial HIPAA",
    "healthcare marketing privacy rules",
  ],
  tags: ["HIPAA", "Foundational"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Foundational",
}

export default function Body() {
  return (
    <>
      <Lead>
        HIPAA&rsquo;s marketing rule restricts how protected health
        information (PHI) can be used in marketing communications.
        It&rsquo;s a separate regulatory regime from FTC rules on
        testimonials and FDA rules on claims &mdash; and many
        healthcare practices conflate the three. HIPAA compliance
        doesn&rsquo;t cure FTC issues, and FTC compliance doesn&rsquo;t
        cure HIPAA issues. Both layers apply. This post is the
        HIPAA-specific framework for healthcare marketing.
      </Lead>

      <H2 id="what-is-marketing-under-hipaa">What counts as marketing under HIPAA</H2>
      <P>
        HIPAA defines &ldquo;marketing&rdquo; more narrowly than
        general usage. Under 45 CFR 164.501, marketing means a
        communication about a product or service that encourages
        recipients to purchase or use the product or service. The
        definition has specific exceptions for:
      </P>
      <UL>
        <LI>
          <Strong>Face-to-face communications</Strong> made directly
          to an individual by the covered entity.
        </LI>
        <LI>
          <Strong>Promotional gifts of nominal value</Strong> provided
          by the covered entity.
        </LI>
        <LI>
          <Strong>Certain treatment-related communications</Strong>
          about the covered entity&rsquo;s own services or products.
        </LI>
        <LI>
          <Strong>Health care operations communications</Strong> in
          specific contexts.
        </LI>
      </UL>
      <P>
        Outside these exceptions, using PHI for marketing requires
        patient authorization. And the exceptions have specific
        limits that most practices misunderstand.
      </P>

      <H2 id="authorization-requirements">What authorization requires</H2>
      <P>
        A valid HIPAA marketing authorization under 45 CFR 164.508
        must be in plain language and include specific elements:
      </P>
      <OL>
        <LI>
          <Strong>Description of the information.</Strong> What
          specific PHI will be used.
        </LI>
        <LI>
          <Strong>Identity of recipients.</Strong> Who will receive or
          use the information.
        </LI>
        <LI>
          <Strong>Description of purpose.</Strong> What the
          information will be used for.
        </LI>
        <LI>
          <Strong>Expiration.</Strong> When the authorization expires
          or the event that triggers expiration.
        </LI>
        <LI>
          <Strong>Patient&rsquo;s right to revoke.</Strong> The
          authorization must state that the patient can revoke in
          writing.
        </LI>
        <LI>
          <Strong>Remuneration statement.</Strong> If the covered
          entity is receiving direct or indirect remuneration from a
          third party for the marketing, the authorization must
          disclose this.
        </LI>
        <LI>
          <Strong>Signature and date.</Strong>
        </LI>
      </OL>
      <P>
        General practice intake forms with blanket
        &ldquo;authorize marketing use&rdquo; clauses typically don&rsquo;t
        meet the authorization requirements. A specific marketing-use
        authorization, signed at the time of the specific marketing
        use, is the compliant approach.
      </P>

      <H2 id="common-scenarios">Common scenarios and the HIPAA analysis</H2>

      <H3>Scenario 1: Using a patient&rsquo;s before/after photo</H3>
      <P>
        Photos of a patient&rsquo;s face or body in the context of
        treatment are PHI. Using them in marketing requires
        HIPAA-compliant authorization specific to the marketing use.
        The authorization needs to cover the specific medium, the
        specific use, and duration. Authorization should be separate
        from treatment consent &mdash; a single form bundling both
        typically doesn&rsquo;t meet the authorization specificity
        requirements.
      </P>

      <H3>Scenario 2: Publishing a patient&rsquo;s testimonial</H3>
      <P>
        Quotes, reviews, or stories from patients are PHI when they
        describe treatment at your practice. Using them in marketing
        requires authorization. Even using &ldquo;John S., patient&rdquo;
        attribution requires the underlying authorization if the
        content describes treatment.
      </P>

      <H3>Scenario 3: Responding to an online review from a patient</H3>
      <P>
        Responding publicly to a review that confirms or reveals
        treatment at your practice &mdash; even generically &mdash;
        can constitute a HIPAA disclosure. This is why generic
        responses that neither confirm nor deny treatment are the
        recommended approach. See our post on responding to negative
        reviews for more.
      </P>

      <H3>Scenario 4: Sending treatment-related emails to current patients</H3>
      <P>
        Communications to existing patients about their own
        treatment plan are not marketing under HIPAA. Communications
        about additional services the practice offers may be marketing
        depending on context. The treatment-communication exception
        has specific limits and should not be stretched beyond its
        text.
      </P>

      <H3>Scenario 5: Using patient contact information for newsletters</H3>
      <P>
        Using patient contact information to send general practice
        newsletters is typically considered marketing if the
        newsletter promotes services. Patients should have opted into
        the newsletter specifically; intake-form blanket contact
        consent doesn&rsquo;t typically cover marketing uses.
      </P>

      <H3>Scenario 6: Social media success posts about patient outcomes</H3>
      <P>
        Posts about patient outcomes &mdash; even without names &mdash;
        may still reveal PHI in combination with photos, dates, or
        distinctive details. Authorization should cover the specific
        social media use.
      </P>

      <H2 id="common-misunderstandings">Common misunderstandings</H2>

      <H3>&ldquo;Patient wrote a public review so we can use it&rdquo;</H3>
      <P>
        The patient making their treatment public on their own
        platform doesn&rsquo;t change your HIPAA obligations. You
        still need authorization to use their review in your own
        marketing. Their public disclosure waived their privacy in
        that forum, not for your republishing.
      </P>

      <H3>&ldquo;We have treatment consent, so marketing use is covered&rdquo;</H3>
      <P>
        Treatment consent and marketing authorization are distinct
        HIPAA documents with different requirements. A treatment
        consent that happens to mention marketing in fine print
        typically doesn&rsquo;t meet marketing authorization
        requirements.
      </P>

      <H3>&ldquo;We changed the patient&rsquo;s name in the story&rdquo;</H3>
      <P>
        De-identification under HIPAA requires meeting specific
        standards (either the safe harbor method removing 18 specific
        identifiers or the expert determination method). Casually
        changing a name doesn&rsquo;t meet de-identification
        requirements. Accompanying photos, dates, or distinctive
        details can re-identify an otherwise-anonymized story.
      </P>

      <H3>&ldquo;Business associate agreements cover our agency&rsquo;s use&rdquo;</H3>
      <P>
        Business associate agreements govern how a BA uses PHI for
        services to you; they don&rsquo;t grant marketing use of PHI
        that the underlying HIPAA rules don&rsquo;t authorize.
        Sharing patient testimonials with an agency for marketing use
        requires patient authorization regardless of the BA
        agreement.
      </P>

      <H2 id="practical-compliance">Practical HIPAA marketing compliance</H2>

      <H3>Separate marketing authorization form</H3>
      <P>
        Use a standalone marketing authorization form, separate from
        treatment consent. The form should identify specific uses
        (photos in website marketing, testimonial in email
        campaigns, video on social media) with clear scope and
        duration.
      </P>

      <H3>Document and retain authorizations</H3>
      <P>
        Keep signed authorizations in patient records. If you ever
        need to demonstrate compliance, documented authorizations are
        the evidence. Missing or incomplete authorizations are the
        weakness OCR investigations commonly find.
      </P>

      <H3>Respect revocations</H3>
      <P>
        Patients can revoke marketing authorizations in writing.
        When they do, stop using the specific PHI promptly. Have a
        workflow for processing revocations.
      </P>

      <H3>Train staff on the marketing rule</H3>
      <P>
        HIPAA training often focuses on clinical privacy and
        doesn&rsquo;t adequately cover the marketing rule. Marketing
        staff specifically need training on when PHI is being used
        and when authorization is required.
      </P>

      <H2 id="enforcement">HIPAA marketing enforcement</H2>
      <P>
        OCR (HHS Office for Civil Rights) has pursued enforcement
        actions specifically involving HIPAA marketing violations,
        including six-figure settlements against practices that
        disclosed PHI in review responses or used patient
        information in marketing without authorization. These
        actions are public and can inform your compliance review.
      </P>

      <BQ>
        HIPAA compliance and FTC compliance are separate regulatory
        regimes. Meeting one doesn&rsquo;t meet the other.
        Healthcare marketing that uses any patient information needs
        review under both layers &mdash; and often a third layer
        (state privacy or medical board rules) as well.
      </BQ>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>What if I only use the patient&rsquo;s first name?</H3>
      <P>
        Dependent on context. If first-name plus other details
        (photo, date, condition) could identify the patient,
        it&rsquo;s still PHI. HIPAA de-identification has specific
        technical requirements; first-name-only usage typically
        doesn&rsquo;t meet them.
      </P>

      <H3>Can I use patient reviews that were posted publicly?</H3>
      <P>
        Republishing public reviews on your own marketing channels
        is a different use than the patient&rsquo;s own public
        posting. Authorization is typically needed. Some practices
        get authorization alongside review-solicitation workflows.
      </P>

      <H3>Does HIPAA apply to non-patients who become testimonial subjects?</H3>
      <P>
        HIPAA only applies to PHI &mdash; information generated
        through treatment. If someone hasn&rsquo;t received treatment
        at your practice, HIPAA doesn&rsquo;t apply to their
        statements. But FTC endorsement rules still do.
      </P>

      <H3>Are internal staff testimonials subject to HIPAA marketing rules?</H3>
      <P>
        Staff testimonials about their own experience or impressions
        of the practice aren&rsquo;t typically PHI. Staff testimonials
        referencing specific patients&rsquo; care can be PHI even
        without naming the patient.
      </P>

      <H3>How long should authorizations be in effect?</H3>
      <P>
        The authorization should state its expiration or
        expiration-triggering event. Indefinite authorizations with
        no expiration are disfavored. Reasonable durations (1-5
        years depending on use) with renewal processes are common
        practice.
      </P>

      <H3>What about state laws that go beyond HIPAA?</H3>
      <P>
        Several states have health-privacy laws stricter than HIPAA
        (California&rsquo;s CMIA, New York&rsquo;s SHIELD Act,
        others). Compliance requires meeting both federal HIPAA and
        applicable state law. The stricter standard applies.
      </P>

      <KeyTakeaways
        items={[
          "HIPAA's marketing rule restricts PHI use in marketing — separate regulatory regime from FTC and FDA rules.",
          "Authorization for marketing use has specific content requirements; standard treatment consent typically doesn't meet them.",
          "Public posting by a patient doesn't waive your HIPAA obligations to get authorization for your own use of their information.",
          "Responding to reviews in ways that confirm treatment can be a HIPAA disclosure — generic responses that neither confirm nor deny are the safer approach.",
          "OCR has pursued HIPAA marketing violations with six-figure settlements — enforcement is active even though less visible than FTC enforcement.",
        ]}
      />
    </>
  )
}
