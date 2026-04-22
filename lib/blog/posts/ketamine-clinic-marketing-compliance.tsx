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
  slug: "ketamine-clinic-marketing-compliance",
  title:
    "Ketamine Clinic Marketing Compliance: Off-Label Psychiatric Advertising, FDA Warnings, and What Still Runs",
  description:
    "Ketamine infusion marketing combines off-label promotion, psychiatric disease-claim rules, controlled-substance considerations, and specific FDA guidance warning against unapproved ketamine therapy marketing. Here's the full compliance framework.",
  excerpt:
    "The FDA has specifically warned against ketamine therapy marketing patterns. Here's what's actually being enforced, which claims produce action, and how ketamine clinics can market compliantly in 2026.",
  date: "2026-04-22",
  readingMinutes: 10,
  keywords: [
    "ketamine clinic marketing compliance",
    "ketamine therapy FDA",
    "ketamine infusion advertising rules",
    "psychiatric ketamine marketing",
    "ketamine depression marketing",
  ],
  tags: ["Mental health", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Ketamine clinics have grown rapidly since the mid-2010s, with
        marketing that frequently claims treatment of depression,
        anxiety, PTSD, chronic pain, and other serious psychiatric and
        neurological conditions. The FDA has specifically issued
        guidance warning against unapproved ketamine therapy marketing
        patterns. Ketamine is also a Schedule III controlled substance,
        adding DEA considerations on top of FDA and FTC issues.
        Ketamine clinic marketing operates in one of the most
        compliance-dense environments in current healthcare
        practice.
      </Lead>

      <H2 id="regulatory-baseline">The regulatory baseline</H2>
      <P>
        Ketamine is an FDA-approved anesthetic - that&rsquo;s
        its on-label indication. Esketamine (Spravato) is FDA-approved
        for treatment-resistant depression with specific protocols.
        Most ketamine clinic use is therefore off-label: intravenous
        ketamine for depression, anxiety, PTSD, chronic pain, and
        other indications. Off-label <Em>use</Em> is generally
        permissible clinical practice; off-label <Em>marketing</Em>
        carries FDA exposure.
      </P>

      <P>
        The FDA has issued specific guidance warning against unapproved
        marketing of ketamine, including compounded forms. The FTC has
        pursued ketamine clinic marketing for substantiation issues
        around specific outcome claims. State medical boards have
        taken action on ketamine clinic supervision and marketing
        issues in multiple jurisdictions.
      </P>

      <Callout variant="warn" title="Controlled substance considerations">
        Ketamine is a Schedule III controlled substance. Marketing
        considerations beyond FDA and FTC include DEA
        registration-based restrictions, telehealth Ryan Haight Act
        implications for prescribing, and state-specific controlled
        substance marketing rules. These considerations specifically
        require healthcare regulatory counsel familiar with both FDA
        and DEA frameworks.
      </Callout>

      <H2 id="problem-patterns">The specific problem patterns</H2>

      <H3>Pattern 1: Disease-treatment claims</H3>
      <BeforeAfter
        bad="Ketamine infusion therapy for depression, anxiety, PTSD, and chronic pain."
        good="Our practice offers IV ketamine infusions for appropriate candidates with treatment-resistant conditions; specific indications and clinical appropriateness are determined at consultation."
        reason="Listing specific psychiatric and neurological diseases as treated indications is off-label marketing of an FDA-approved anesthetic. The compliant alternative uses clinical-appropriateness framing."
      />

      <H3>Pattern 2: Efficacy percentages and outcome claims</H3>
      <BeforeAfter
        bad="70% of patients see relief from depression within hours."
        good="Published studies of IV ketamine in treatment-resistant depression have shown variable response rates depending on study design and patient population. Individual outcomes vary significantly and depend on many factors."
        reason="Specific outcome percentages require substantiation meeting the FTC standard - which most practice-level substantiation files do not meet. Citing the underlying research with appropriate qualifications is compliant."
      />

      <H3>Pattern 3: &ldquo;FDA-approved ketamine therapy&rdquo;</H3>
      <BeforeAfter
        bad="Our FDA-approved ketamine therapy for mental health."
        good="Ketamine is FDA-approved as an anesthetic. Esketamine (Spravato) has specific FDA-approved psychiatric indications. Most IV ketamine psychiatric use is off-label clinical application."
        reason="Ketamine's off-label psychiatric use is not FDA-approved for those indications. 'FDA-approved ketamine therapy' misrepresents the approval status for the marketed use."
      />

      <H3>Pattern 4: Suicidality and crisis marketing</H3>
      <BeforeAfter
        bad="Ketamine rapidly reduces suicidal ideation - get help now."
        good="(Remove suicidality-specific marketing claims. Crisis-targeted marketing of off-label psychiatric treatment raises heightened FDA and FTC concerns; crisis intervention is outside the scope of clinic marketing.)"
        reason="Marketing targeting patients in suicidal crisis raises both consumer-protection heightened-scrutiny issues and specific FDA concerns about off-label psychiatric marketing. This is a category where removal is safer than restructuring."
      />

      <H3>Pattern 5: At-home ketamine marketing</H3>
      <BeforeAfter
        bad="At-home ketamine treatment - convenient, affordable, effective."
        good="(This entire category faces heightened FDA and DEA scrutiny. Telehealth ketamine prescribing for home use has been specifically warned against by the FDA; marketing should involve healthcare counsel familiar with current Ryan Haight Act and FDA guidance.)"
        reason="At-home ketamine marketing is currently one of the highest-risk healthcare marketing categories. The FDA has issued specific warnings; the DEA has investigated specific operations. Aggressive marketing in this category is not advisable."
      />

      <H3>Pattern 6: Celebrity/testimonial-driven marketing</H3>
      <P>
        Ketamine clinic marketing frequently includes patient
        testimonials describing dramatic improvement from specific
        conditions. These testimonials carry the disease-treatment
        claim into your marketing regardless of how the clinic itself
        frames the service. They also frequently lack
        typical-experience and material-connection disclosures.
      </P>

      <H2 id="compliant-framings">Compliant ketamine marketing framework</H2>

      <H3>Candidacy-forward rather than indication-forward</H3>
      <P>
        Market the practice as offering IV ketamine for appropriate
        candidates with treatment-resistant conditions, with specific
        indications determined at consultation. Avoid listing specific
        psychiatric or pain conditions in public marketing copy. The
        clinical conversation happens at consultation.
      </P>

      <H3>Clinical context framing</H3>
      <P>
        &ldquo;IV ketamine as part of a comprehensive treatment
        plan&rdquo; positions the service as a clinical intervention
        rather than a standalone consumer purchase. This reflects both
        clinical best practice and regulatory expectation.
      </P>

      <H3>Evidence honesty</H3>
      <P>
        The evidence for IV ketamine in various psychiatric indications
        is genuinely developing - some stronger than others.
        Honest framing acknowledges this: &ldquo;Clinical research on
        IV ketamine for treatment-resistant conditions continues. We
        offer this as an option for patients who have not responded to
        standard treatment approaches.&rdquo;
      </P>

      <H3>Integration with other care</H3>
      <P>
        &ldquo;We coordinate with your primary mental health provider
        and incorporate IV ketamine into your broader treatment plan&rdquo;
        - this framing reflects the standard of care many
        responsible ketamine clinics follow and is compliance-safer
        than standalone-treatment framing.
      </P>

      <H3>Esketamine (Spravato) separately</H3>
      <P>
        If you offer esketamine (Spravato), its FDA-approved psychiatric
        indication allows more specific marketing of that product for
        its approved use. Clearly separate esketamine marketing (which
        can appropriately discuss its approved indication) from IV
        ketamine marketing (which is off-label).
      </P>

      <H2 id="platform-issues">Platform-specific issues</H2>
      <P>
        Ketamine marketing runs into additional platform-level
        restrictions:
      </P>

      <UL>
        <LI>
          <Strong>Meta.</Strong> Mental health treatment ads face
          specific policy layers. Aggressive ketamine marketing
          regularly runs into ad rejection.
        </LI>
        <LI>
          <Strong>Google Ads.</Strong> Ketamine clinic advertising
          often requires LegitScript certification. Category-level
          restrictions apply.
        </LI>
        <LI>
          <Strong>TikTok.</Strong> Mental health content has platform-
          level community guidelines in addition to advertising policy.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I discuss ketamine for specific conditions in any marketing?</H3>
      <P>
        Educational content that discusses the clinical research on
        ketamine in specific conditions, without tying that research
        to specific treatment claims about your practice, is generally
        lower-risk than direct promotional marketing of specific
        indications. The line between education and promotion matters
        and should involve counsel review.
      </P>

      <H3>What about the ongoing Ryan Haight Act telehealth question?</H3>
      <P>
        Telehealth prescribing of controlled substances including
        ketamine is in active regulatory flux. The DEA has issued
        multiple guidance updates. Telehealth ketamine operations
        must maintain current awareness of specific prescribing
        rules; marketing should not rely on prescribing patterns
        that may become restricted.
      </P>

      <H3>Is ketamine infusion different from ketamine troches or lozenges?</H3>
      <P>
        Yes, legally and regulatorily. IV ketamine is administered
        under direct medical supervision. Ketamine troches for
        at-home use raise separate controlled-substance and
        prescribing-scope issues. Marketing each form carries distinct
        considerations.
      </P>

      <H3>Do I need a psychiatrist on staff?</H3>
      <P>
        This is a clinical and state-licensure question, not a
        marketing question. Scope-of-practice and supervision rules
        for ketamine administration vary by state. Marketing that
        implies psychiatric specialization when the prescriber is not
        a psychiatrist is a separate misrepresentation issue.
      </P>

      <H3>Are there ketamine clinic enforcement examples to study?</H3>
      <P>
        The FDA has issued specific warnings about compounded
        ketamine marketing. Various state medical boards have taken
        action on ketamine clinic scope-of-practice and marketing
        issues. These are publicly available and can inform
        compliance review.
      </P>

      <H3>What&rsquo;s the most conservative defensible marketing approach?</H3>
      <P>
        Practice-forward framing: describe the clinical team,
        the evaluation process, the treatment environment, and the
        integration with broader mental health care - without
        specific indication claims or outcome numbers in public
        marketing. Conversions happen at consultation, where the
        more-detailed clinical conversation appropriately occurs.
      </P>

      <KeyTakeaways
        items={[
          "Ketamine's FDA-approved indication is as an anesthetic; most ketamine clinic use is off-label and cannot be marketed with specific FDA-approved framing for psychiatric indications.",
          "The FDA has specifically warned against unapproved ketamine marketing patterns - this is a current enforcement focus.",
          "Controlled-substance status adds DEA and Ryan Haight Act considerations on top of FDA/FTC rules.",
          "Candidacy-forward and evaluation-forward marketing is both clinically appropriate and compliance-safer than indication-forward marketing.",
          "At-home ketamine marketing and crisis-targeted marketing are particularly high-risk and should involve counsel review before running.",
        ]}
      />
    </>
  )
}
