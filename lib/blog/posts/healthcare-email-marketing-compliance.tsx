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
  slug: "healthcare-email-marketing-compliance",
  title:
    "Healthcare Email Marketing Compliance: HIPAA, CAN-SPAM, and the Content-Level Rules That Apply to Every Patient Email",
  description:
    "Healthcare email marketing combines HIPAA rules on patient communication, CAN-SPAM rules on commercial email, FTC rules on claims, and state-specific email marketing rules. Here's the framework.",
  excerpt:
    "Every healthcare patient email involves multiple compliance layers that general CAN-SPAM advice doesn't cover. Here's what practices need to know about HIPAA-compliant, FTC-compliant email marketing.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "healthcare email marketing compliance",
    "HIPAA email marketing",
    "CAN-SPAM healthcare",
    "patient email marketing rules",
    "medical practice email compliance",
  ],
  tags: ["Email", "Tactical", "HIPAA"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Healthcare email marketing combines several regulatory
        layers: HIPAA rules on patient communication and use of PHI,
        CAN-SPAM rules on commercial email generally, FTC rules on
        claims in the email body, and state-specific email marketing
        rules. This post covers the full framework for
        HIPAA-compliant, FTC-compliant healthcare email marketing.
      </Lead>

      <H2 id="hipaa-layer">The HIPAA layer</H2>
      <P>
        HIPAA affects email marketing in several specific ways:
      </P>
      <UL>
        <LI>
          <Strong>Patient list usage.</Strong> Using patient contact
          information for marketing is generally marketing under
          HIPAA and requires authorization, with some specific
          exceptions.
        </LI>
        <LI>
          <Strong>Treatment communication exception.</Strong>
          Communications about the patient&rsquo;s own treatment
          are not marketing under HIPAA. But communications
          promoting other services often are.
        </LI>
        <LI>
          <Strong>PHI in email content.</Strong> Including PHI in
          email content (even to the patient whose PHI it is) has
          specific security considerations.
        </LI>
        <LI>
          <Strong>Email security.</Strong> Standard email is not
          secure. Using standard email for PHI requires specific
          patient consent.
        </LI>
      </UL>

      <H2 id="can-spam-layer">The CAN-SPAM layer</H2>
      <P>
        CAN-SPAM applies to commercial emails. Key requirements:
      </P>
      <UL>
        <LI>
          Accurate header information (not misleading sender/subject).
        </LI>
        <LI>
          Clear identification as advertising (if primary purpose is
          commercial).
        </LI>
        <LI>
          Physical mailing address.
        </LI>
        <LI>
          Clear and conspicuous opt-out mechanism.
        </LI>
        <LI>
          Processing opt-outs within 10 business days.
        </LI>
      </UL>
      <P>
        Most healthcare practice emails fall under CAN-SPAM when
        they include promotional content alongside any transactional
        content.
      </P>

      <H2 id="content-rules">Content rules in email</H2>
      <P>
        Email body content is marketing subject to the same rules as
        any other marketing surface:
      </P>
      <UL>
        <LI>
          FTC claim rules apply (no deceptive claims, no
          unsubstantiated efficacy claims).
        </LI>
        <LI>
          FDA disease-claim rules apply.
        </LI>
        <LI>
          Endorsement Guides apply to any testimonials quoted in
          emails.
        </LI>
        <LI>
          State healthcare marketing rules apply.
        </LI>
      </UL>

      <H2 id="specific-patterns">Specific email marketing patterns</H2>

      <H3>Pattern 1: Treatment announcement emails</H3>
      <P>
        Emails announcing new services or treatments need to meet
        both HIPAA marketing rules (if PHI is used) and claim
        compliance rules.
      </P>

      <H3>Pattern 2: Patient appointment follow-up</H3>
      <P>
        Appointment-specific communications are generally
        treatment-related. Emails that combine appointment follow-up
        with promotional content for additional services may cross
        into marketing.
      </P>

      <H3>Pattern 3: Patient testimonial emails</H3>
      <P>
        Newsletters featuring patient testimonials combine HIPAA
        authorization requirements, FTC Endorsement Guides
        requirements, and standard email compliance.
      </P>

      <H3>Pattern 4: Health education content</H3>
      <P>
        Genuinely educational content is generally lower-risk than
        promotional content. The line is whether the email is
        primarily education vs primarily promotion.
      </P>

      <H3>Pattern 5: Review solicitation emails</H3>
      <P>
        Post-visit emails soliciting reviews have specific
        considerations: FTC review-gating rules prohibit soliciting
        only happy patients; CAN-SPAM rules apply; HIPAA
        authorization for using patient information to solicit may
        be required.
      </P>

      <H3>Pattern 6: Appointment reminder emails</H3>
      <P>
        Typically treatment-related (not marketing under HIPAA).
        But if the reminder includes promotional content about
        other services, the promotional portion is marketing.
      </P>

      <H2 id="list-management">Patient list management</H2>
      <P>
        Email list management has specific healthcare
        considerations:
      </P>
      <UL>
        <LI>
          Acquiring email addresses during treatment encounters -
          specific consent for marketing use beyond treatment
          communications.
        </LI>
        <LI>
          Third-party list purchases - generally not
          appropriate for healthcare.
        </LI>
        <LI>
          Opt-in from website forms - should clearly indicate
          marketing use.
        </LI>
        <LI>
          Opt-out processing - within CAN-SPAM timeframes,
          with appropriate HIPAA-compliant handling.
        </LI>
      </UL>

      <H2 id="platform-considerations">Platform and service provider considerations</H2>
      <P>
        Email marketing platforms (Mailchimp, Constant Contact,
        HubSpot, etc.) handling patient information are Business
        Associates under HIPAA. Specific considerations:
      </P>
      <UL>
        <LI>
          Business Associate Agreements required with platforms
          handling PHI.
        </LI>
        <LI>
          Platform-level security must be HIPAA-compliant.
        </LI>
        <LI>
          Some platforms market HIPAA-compliant service tiers;
          verify specifically.
        </LI>
      </UL>

      <H2 id="compliant-framework">Compliant healthcare email marketing framework</H2>
      <UL>
        <LI>
          <Strong>Appropriate authorization for list use.</Strong>
          Specific consent for marketing beyond treatment.
        </LI>
        <LI>
          <Strong>HIPAA-compliant platform.</Strong> BAA in place,
          appropriate security.
        </LI>
        <LI>
          <Strong>CAN-SPAM compliance.</Strong> Header accuracy,
          physical address, opt-out.
        </LI>
        <LI>
          <Strong>Content compliance.</Strong> Same FDA/FTC rules
          as other marketing surfaces.
        </LI>
        <LI>
          <Strong>Separation of treatment and marketing.</Strong>
          Clear distinction or appropriate framing.
        </LI>
        <LI>
          <Strong>Review-solicitation compliance.</Strong> No
          review-gating.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Does every patient email need opt-in?</H3>
      <P>
        Treatment-related emails typically don&rsquo;t require
        marketing opt-in. Marketing emails do - either under
        HIPAA marketing authorization rules or CAN-SPAM opt-in
        mechanics, depending on the email category.
      </P>

      <H3>Can I send health education emails to my patient list?</H3>
      <P>
        Generally yes, with appropriate consent and if the content
        is genuinely educational rather than primarily promotional.
        Pure education to an existing patient list is low-risk.
      </P>

      <H3>What about sending special offers to my patient list?</H3>
      <P>
        This is marketing under HIPAA and CAN-SPAM. Requires
        appropriate authorization, CAN-SPAM compliance, and
        content-level compliance.
      </P>

      <H3>Do I need a specific HIPAA-compliant email service?</H3>
      <P>
        If you&rsquo;re handling PHI in emails, yes. BAA with the
        provider, appropriate security. Many mainstream providers
        offer HIPAA-compliant tiers.
      </P>

      <H3>What about SMS marketing alongside email?</H3>
      <P>
        SMS has its own rules (TCPA) plus HIPAA considerations.
        Same general framework with additional SMS-specific
        considerations (prior express written consent, opt-out
        mechanics, message frequency disclosure).
      </P>

      <H3>How do I handle unsubscribe requests?</H3>
      <P>
        Process within 10 business days per CAN-SPAM. Don&rsquo;t
        add unsubscribes back to lists. Don&rsquo;t require
        unreasonable steps to unsubscribe (no passwords, no account
        login for opt-out).
      </P>

      <KeyTakeaways
        items={[
          "Healthcare email marketing combines HIPAA, CAN-SPAM, FTC claim rules, and state-specific email rules - all apply.",
          "Treatment communications aren't marketing under HIPAA; promotional content for other services typically is.",
          "Email platforms handling PHI are Business Associates requiring BAA and appropriate security.",
          "Review-solicitation emails face FTC review-gating rules in addition to standard email compliance.",
          "Standard email security is insufficient for PHI content; specific patient consent is required for using standard email.",
        ]}
      />
    </>
  )
}
