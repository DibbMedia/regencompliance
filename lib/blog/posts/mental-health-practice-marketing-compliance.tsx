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
  slug: "mental-health-practice-marketing-compliance",
  title:
    "Mental Health Practice Marketing Compliance: Therapy, Psychiatry, and the Rules That Apply to Each",
  description:
    "Mental health practices face specific compliance considerations - HIPAA is stricter, FTC substantiation applies to treatment outcome claims, and platform policies for mental health advertising are particularly tight.",
  excerpt:
    "Therapy practices, psychiatry clinics, and online mental health platforms operate under specific marketing rules. Here's the complete framework for responsible and compliant mental health marketing.",
  date: "2026-04-22",
  readingMinutes: 9,
  keywords: [
    "mental health practice marketing",
    "therapy clinic advertising compliance",
    "psychiatry marketing rules",
    "telehealth mental health advertising",
    "mental health HIPAA marketing",
  ],
  tags: ["Mental health", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Mental health practice marketing operates under compliance
        rules that are in some ways stricter than other healthcare
        categories. HIPAA considerations are heightened because
        mental health treatment data is particularly sensitive.
        Platform advertising policies for mental health content are
        among the most restrictive. And FTC substantiation rules
        apply to specific treatment outcome claims. This post
        covers therapy, psychiatry, and online mental health
        platform marketing.
      </Lead>

      <H2 id="hipaa-considerations">Enhanced HIPAA considerations</H2>
      <P>
        Mental health information is treated as particularly
        sensitive under HIPAA. Psychotherapy notes have additional
        protections beyond general PHI. This affects marketing in
        several ways:
      </P>
      <UL>
        <LI>
          Testimonials and patient stories in mental health
          marketing carry higher HIPAA sensitivity.
        </LI>
        <LI>
          Authorization requirements are particularly important.
        </LI>
        <LI>
          Responses to online reviews risk disclosing sensitive
          information.
        </LI>
        <LI>
          Aggregate or anonymized patient-outcome marketing requires
          careful de-identification review.
        </LI>
      </UL>

      <H2 id="treatment-claims">Treatment outcome claims</H2>
      <P>
        Claims about mental health treatment outcomes need
        substantiation:
      </P>
      <UL>
        <LI>
          &ldquo;Cures depression&rdquo; is disease-treatment
          territory; therapy does not &ldquo;cure&rdquo;
          depression in the sense that language implies.
        </LI>
        <LI>
          &ldquo;Proven to work&rdquo; or &ldquo;clinically proven&rdquo;
          needs specific evidence for specific modalities.
        </LI>
        <LI>
          Success-rate claims need substantiation based on
          published literature or specific practice data.
        </LI>
      </UL>
      <P>
        Compliant framing acknowledges therapy as clinical care with
        variable individual outcomes. &ldquo;Evidence-based treatment
        for depression and anxiety&rdquo; is defensible when the
        modalities offered have an evidence base.
      </P>

      <H2 id="platform-policy">Platform policy restrictions</H2>
      <P>
        Platform policies for mental health content are particularly
        restrictive:
      </P>
      <UL>
        <LI>
          <Strong>Meta.</Strong> Mental health ads face specific
          policy restrictions; suicide-related content faces
          additional community guidelines.
        </LI>
        <LI>
          <Strong>Google Ads.</Strong> Mental health advertising often
          requires specific certification; addiction treatment
          requires LegitScript.
        </LI>
        <LI>
          <Strong>TikTok.</Strong> Mental health content faces
          community guidelines in addition to advertising policy.
        </LI>
      </UL>

      <H2 id="crisis-marketing">Crisis and suicide-related marketing</H2>
      <P>
        Marketing that targets patients in acute crisis raises
        specific concerns:
      </P>
      <UL>
        <LI>
          FTC heightened-scrutiny considerations for marketing to
          vulnerable populations.
        </LI>
        <LI>
          Professional ethics considerations (APA, NASW) on
          commercial targeting of crisis contexts.
        </LI>
        <LI>
          Platform policy restrictions on crisis-related commercial
          content.
        </LI>
      </UL>
      <P>
        Crisis resource provision (988, crisis hotlines) is
        appropriate in mental health content; commercial conversion
        targeting patients in crisis is not.
      </P>

      <H2 id="telehealth-considerations">Online and telehealth mental health</H2>
      <P>
        Online therapy platforms and telehealth psychiatry face
        additional rules:
      </P>
      <UL>
        <LI>
          State licensure of providers for patients in specific
          states.
        </LI>
        <LI>
          Prescribing considerations for telehealth psychiatry,
          including controlled-substance Ryan Haight Act
          considerations.
        </LI>
        <LI>
          Clear marketing of the care model (async vs sync, therapy
          vs psychiatry, prescribing vs non-prescribing).
        </LI>
        <LI>
          State-specific telehealth rules that vary.
        </LI>
      </UL>

      <H2 id="therapy-modality">Therapy modality marketing</H2>
      <P>
        Specific modality marketing (CBT, EMDR, DBT, ACT,
        psychodynamic, somatic) needs accuracy:
      </P>
      <UL>
        <LI>
          Modality certifications require specific training;
          claiming modality specialization needs accurate
          credentials.
        </LI>
        <LI>
          Evidence base varies by modality; claims about efficacy
          should reflect the actual research.
        </LI>
        <LI>
          &ldquo;Certified&rdquo; in specific modalities often has
          specific certifying organizations; casual usage can be
          misleading.
        </LI>
      </UL>

      <H2 id="psychiatric-medication">Psychiatric medication marketing</H2>
      <P>
        Psychiatry practices marketing specific medications face
        prescription-drug advertising considerations. Branded
        medication marketing (SSRI brand names, ketamine, esketamine,
        stimulants) falls under the same rules as other prescription
        drug advertising.
      </P>
      <P>
        See our ketamine clinic marketing compliance post for
        specific considerations in that subcategory.
      </P>

      <H2 id="compliant-framework">Compliant mental health practice marketing</H2>
      <OL>
        <LI>
          <Strong>Clinical-approach framing.</Strong> Describe the
          therapy modalities, practitioner training, and care
          structure.
        </LI>
        <LI>
          <Strong>Evidence-based language where supported.</Strong>
          &ldquo;Evidence-based treatment approaches&rdquo; with
          specific named modalities when appropriate.
        </LI>
        <LI>
          <Strong>Accurate outcome framing.</Strong> &ldquo;Many
          patients find meaningful improvement through therapy;
          individual experiences vary&rdquo; is honest and
          compliant.
        </LI>
        <LI>
          <Strong>Clear service model description.</Strong>
          Especially for online platforms - what service,
          with whom, in what format.
        </LI>
        <LI>
          <Strong>Crisis resource inclusion.</Strong> Content that
          touches on crisis topics should include professional
          resources (988, crisis lines).
        </LI>
        <LI>
          <Strong>HIPAA-authorized testimonials only.</Strong>
          Generic experience framing rather than specific-condition
          recovery stories.
        </LI>
      </OL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I share patient success stories generally?</H3>
      <P>
        With HIPAA-compliant authorization and appropriate framing.
        Mental health testimonials face higher HIPAA sensitivity
        than other specialties; authorization should be
        particularly specific.
      </P>

      <H3>What about patient-written reviews on external platforms?</H3>
      <P>
        Patients can post reviews on their own. You should not
        repost or republish without HIPAA authorization. Responding
        requires generic framing that doesn&rsquo;t confirm
        patient status.
      </P>

      <H3>Does therapy marketing need FDA consideration?</H3>
      <P>
        Typically no, for non-medication therapy. FDA considerations
        emerge when digital therapeutics (FDA-regulated software as
        medical device), wearables, or medication-related content
        is involved.
      </P>

      <H3>How should practice bios discuss provider specialization?</H3>
      <P>
        Accurately. &ldquo;Specializes in treating adolescents with
        anxiety and depression&rdquo; is defensible when true.
        &ldquo;Specialist&rdquo; with implication of board
        certification needs the actual credential.
      </P>

      <H3>What about online therapy platform comparison marketing?</H3>
      <P>
        Comparative marketing between platforms faces FTC
        comparative-claim substantiation rules. &ldquo;Better than
        [competitor]&rdquo; claims need head-to-head evidence.
      </P>

      <H3>Are there specific ethics considerations from professional associations?</H3>
      <P>
        Yes. APA, APA (psychiatry), NASW, and state licensing
        boards have ethics codes that affect marketing. Many
        include restrictions beyond FTC rules (e.g., on
        testimonials, on solicitation practices, on comparative
        advertising).
      </P>

      <KeyTakeaways
        items={[
          "Mental health data is particularly HIPAA-sensitive - testimonial and review-response practices need extra care.",
          "Platform advertising policies for mental health content are among the most restrictive; account certification is sometimes required.",
          "Crisis-targeted commercial marketing raises FTC heightened-scrutiny and professional ethics concerns.",
          "Modality marketing (CBT, EMDR, DBT, etc.) needs accurate training and certification backing.",
          "Professional association ethics codes (APA, NASW) add compliance layers beyond FTC rules.",
        ]}
      />
    </>
  )
}
