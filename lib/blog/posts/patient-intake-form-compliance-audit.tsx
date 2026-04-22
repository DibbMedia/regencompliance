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
  slug: "patient-intake-form-compliance-audit",
  title:
    "Patient Intake Form Compliance Audit: What HIPAA, FTC, and State Laws Actually Require",
  description:
    "Patient intake forms often haven't been updated in years. A compliance audit catches missing authorizations, improper marketing consent, outdated HIPAA language, and state-specific requirements.",
  excerpt:
    "Most practices' intake forms were written years ago and haven't been audited since. Here's the specific audit framework covering HIPAA, marketing authorization, CAN-SPAM, TCPA, and state requirements.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "patient intake form compliance",
    "HIPAA intake form audit",
    "marketing authorization patient form",
    "patient consent compliance",
    "practice intake compliance",
  ],
  tags: ["Tactical", "HIPAA"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Patient intake forms are the primary document establishing
        the patient-practice relationship, including key
        authorizations that affect marketing, communication, and
        HIPAA compliance. Most practices&rsquo; intake forms were
        written years ago, by an attorney who understood the
        framework at the time, and haven&rsquo;t been updated
        since. A periodic audit catches gaps that accumulate.
      </Lead>

      <H2 id="audit-categories">The audit categories</H2>

      <H3>1. HIPAA Notice of Privacy Practices</H3>
      <UL>
        <LI>
          Current version reflecting recent HIPAA updates.
        </LI>
        <LI>
          Specific to your practice&rsquo;s uses and disclosures.
        </LI>
        <LI>
          Contains all required elements (access rights, amendment
          rights, accounting rights, complaint process).
        </LI>
        <LI>
          Patient acknowledgment documented.
        </LI>
      </UL>

      <H3>2. HIPAA authorizations</H3>
      <UL>
        <LI>
          Specific separate forms for non-treatment uses
          (marketing, specific disclosures).
        </LI>
        <LI>
          Not bundled with treatment consent where separate
          authorization required.
        </LI>
        <LI>
          Contains all HIPAA-required elements.
        </LI>
        <LI>
          Specific scope, not overbroad.
        </LI>
      </UL>

      <H3>3. Marketing authorization</H3>
      <UL>
        <LI>
          Separate from treatment consent.
        </LI>
        <LI>
          Specific scope (website, social media, print, video).
        </LI>
        <LI>
          Duration specified.
        </LI>
        <LI>
          Revocation mechanism described.
        </LI>
        <LI>
          Specific patient information covered.
        </LI>
      </UL>

      <H3>4. Photo and imagery authorization</H3>
      <UL>
        <LI>
          Separate authorization for photo use in marketing.
        </LI>
        <LI>
          Specific scope of use (which marketing channels).
        </LI>
        <LI>
          Duration of authorization.
        </LI>
        <LI>
          Limitations on use (before/after only, specific procedures
          only).
        </LI>
      </UL>

      <H3>5. Communication preferences and CAN-SPAM/TCPA</H3>
      <UL>
        <LI>
          Email communication consent (specific, not blanket).
        </LI>
        <LI>
          SMS/text message consent with TCPA-required express
          written consent language if autodialers used.
        </LI>
        <LI>
          Phone call consent.
        </LI>
        <LI>
          Marketing communications separate from treatment
          communications.
        </LI>
      </UL>

      <H3>6. Financial responsibility and pricing disclosure</H3>
      <UL>
        <LI>
          Accurate insurance billing practices.
        </LI>
        <LI>
          Cash-pay pricing disclosure.
        </LI>
        <LI>
          Financing options and terms.
        </LI>
        <LI>
          State-specific financial disclosure requirements.
        </LI>
      </UL>

      <H3>7. Treatment consent</H3>
      <UL>
        <LI>
          General consent for evaluation and treatment.
        </LI>
        <LI>
          Procedure-specific consents for specific services.
        </LI>
        <LI>
          Anesthesia/sedation consent where applicable.
        </LI>
        <LI>
          Off-label use consent where applicable.
        </LI>
      </UL>

      <H3>8. Consumer review policies</H3>
      <UL>
        <LI>
          No-negative-review clauses are prohibited under CRFA -
          audit for and remove.
        </LI>
        <LI>
          Review solicitation practices should not be structured as
          review-gating.
        </LI>
      </UL>

      <H3>9. State-specific requirements</H3>
      <UL>
        <LI>
          State-specific privacy laws (California CMIA, New York
          SHIELD, etc.).
        </LI>
        <LI>
          State-specific financial disclosure requirements.
        </LI>
        <LI>
          State-specific specialty board requirements.
        </LI>
      </UL>

      <H2 id="specific-pitfalls">Common audit findings</H2>

      <H3>Pitfall 1: Everything bundled into treatment consent</H3>
      <P>
        A single form asking the patient to agree to treatment,
        marketing use, photo use, and communication preferences.
        Doesn&rsquo;t meet HIPAA authorization specificity
        requirements.
      </P>

      <H3>Pitfall 2: Indefinite marketing authorizations</H3>
      <P>
        Authorizations with no expiration. HIPAA expects specific
        expiration or triggering event.
      </P>

      <H3>Pitfall 3: Old HIPAA notices</H3>
      <P>
        Notice of Privacy Practices that hasn&rsquo;t been updated
        in years. Should reflect current practice and regulatory
        framework.
      </P>

      <H3>Pitfall 4: No-negative-review clauses</H3>
      <P>
        These are prohibited under the Consumer Review Fairness
        Act. Any clause restricting patient reviews should be
        removed.
      </P>

      <H3>Pitfall 5: Blanket TCPA consent</H3>
      <P>
        SMS consent buried in a larger form without TCPA-specific
        clear-and-conspicuous express written consent language.
      </P>

      <H3>Pitfall 6: Missing state-specific addenda</H3>
      <P>
        Forms designed for one state used in multi-state practice
        without state-specific additions.
      </P>

      <H2 id="update-process">Form update process</H2>
      <OL>
        <LI>
          <Strong>Legal review of current forms.</Strong> Healthcare
          regulatory attorney identifies gaps.
        </LI>
        <LI>
          <Strong>Draft updates addressing gaps.</Strong>
          Specific attention to HIPAA, marketing authorization,
          TCPA, CRFA, state-specific items.
        </LI>
        <LI>
          <Strong>Implementation plan.</Strong> When new forms take
          effect; how existing patients transition.
        </LI>
        <LI>
          <Strong>Staff training.</Strong> Front desk understands
          the changes and collection requirements.
        </LI>
        <LI>
          <Strong>Systems integration.</Strong> EHR and practice
          management systems reflect the new forms.
        </LI>
        <LI>
          <Strong>Ongoing review.</Strong> Annual form review to
          catch regulatory updates.
        </LI>
      </OL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>How often should intake forms be updated?</H3>
      <P>
        Major review every 2-3 years with attorney involvement.
        Triggered updates when specific regulations change
        (HIPAA updates, state law changes, CRFA awareness).
      </P>

      <H3>Do existing patients need to sign new forms?</H3>
      <P>
        Depends on what changed. HIPAA Notice updates may require
        acknowledgment; new marketing authorizations typically
        apply only to new uses.
      </P>

      <H3>Can digital intake be compliant?</H3>
      <P>
        Yes, with appropriate electronic signature mechanisms and
        HIPAA-compliant platforms. Digital intake can be more
        compliant than paper because validation can be built in.
      </P>

      <H3>What about telehealth-specific intake?</H3>
      <P>
        Telehealth adds state-licensure acknowledgments, specific
        communication preferences, and platform-security
        disclosures.
      </P>

      <H3>Should I include prepaid package terms in intake?</H3>
      <P>
        Package-pricing terms are often better in separate
        documents. Bundling into general intake can create
        interpretation issues.
      </P>

      <H3>What documentation of intake should I retain?</H3>
      <P>
        Signed forms in patient records, version history of form
        updates, documentation of staff training on form usage,
        and record of any patient-specific modifications.
      </P>

      <KeyTakeaways
        items={[
          "Patient intake forms accumulate gaps over time - periodic audit catches what has drifted.",
          "HIPAA authorization, marketing authorization, photo authorization, and treatment consent should be separate documents, not bundled.",
          "No-negative-review clauses violate the Consumer Review Fairness Act and should be removed.",
          "SMS consent requires TCPA-specific express written consent language, not buried blanket consent.",
          "Annual review plus triggered updates for specific regulatory changes keeps forms current.",
        ]}
      />
    </>
  )
}
