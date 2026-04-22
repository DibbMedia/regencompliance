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
  slug: "healthcare-about-page-compliance",
  title:
    "Healthcare Practice 'About' Page Compliance: The Most-Overlooked Marketing Surface",
  description:
    "Practice About pages and provider bios are rarely reviewed for compliance - but they frequently contain specialty misrepresentations, credential overstatement, and outcome claims that draw enforcement. Here's what to audit.",
  excerpt:
    "Your About page hasn't been audited in years. It probably has specialty misrepresentations, credentialing issues, and outcome claims nobody noticed. Here's the specific audit framework.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "healthcare about page compliance",
    "provider bio compliance",
    "medical specialty claims",
    "physician credentialing marketing",
    "About page audit healthcare",
  ],
  tags: ["Tactical", "Website"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Practice &ldquo;About&rdquo; pages and provider bios are
        typically written once and rarely updated - much less
        reviewed for compliance. They frequently contain specialty
        misrepresentations, credential overstatement, outcome claims,
        and superlative language that compliance counsel would flag
        if they ever saw them. State medical boards specifically
        target About-page language patterns. This post is the
        focused audit framework for one of the most-overlooked
        marketing surfaces in most practices.
      </Lead>

      <H2 id="common-issues">The specific issues that accumulate on About pages</H2>

      <H3>Issue 1: Specialty misrepresentation</H3>
      <BeforeAfter
        bad="Dr. Smith is a cosmetic dentist specializing in smile makeovers."
        good="Dr. Smith is a general dentist with advanced training and clinical focus on aesthetic dental treatments."
        reason="'Cosmetic dentist' is not an ADA-recognized specialty. State dental boards in multiple jurisdictions have disciplined physicians for specialty claims without the corresponding recognized specialty."
      />

      <BeforeAfter
        bad="Our board-certified plastic surgeon Dr. Jones..."
        good="Dr. Jones is certified by the American Board of Plastic Surgery (an ABMS member board)."
        reason="'Board-certified' claims require specific ABMS or equivalent certification and state medical boards require disclosure of the specific certifying board."
      />

      <H3>Issue 2: Credential overstatement</H3>
      <BeforeAfter
        bad="Recognized as a top expert in regenerative medicine."
        good="Dr. Smith has completed advanced training in regenerative medicine techniques and has been offering these treatments since [year]."
        reason="'Top expert' is a superlative without substantiation. 'Recognized' implies third-party recognition that often doesn't exist in any verifiable form."
      />

      <H3>Issue 3: Outcome claims in bios</H3>
      <BeforeAfter
        bad="Dr. Smith has helped thousands of patients achieve life-changing results."
        good="Dr. Smith has performed [number] [specific procedures] since [year] as part of his clinical practice."
        reason="'Life-changing results' is an unsubstantiated outcome claim. Specific procedure counts are factual and compliance-safer."
      />

      <H3>Issue 4: Education overstatement</H3>
      <BeforeAfter
        bad="Graduated from the top medical school in the country."
        good="Graduated from [specific medical school], [year]."
        reason="'Top medical school' is superlative without substantiation. Specific factual attribution is always preferable."
      />

      <H3>Issue 5: &ldquo;Member of&rdquo; implying certification</H3>
      <BeforeAfter
        bad="Member of the International Academy of Aesthetic Medicine (implying specialty certification)."
        good="Member of the International Academy of Aesthetic Medicine (a professional association; not a specialty certification)."
        reason="Professional memberships are different from specialty certifications. Listing memberships in a way that implies certification is a state medical board concern."
      />

      <H3>Issue 6: Inflation of experience</H3>
      <BeforeAfter
        bad="Dr. Smith has over 20 years of experience in stem cell therapy."
        good="Dr. Smith has practiced medicine for over 20 years, including [specific time period] focused on regenerative medicine."
        reason="Implying long experience in an area that only existed in current form for a much shorter period is misleading. Be specific about what kind of experience spans what time period."
      />

      <H3>Issue 7: Trademark and brand name issues</H3>
      <P>
        Staff bios mentioning specific brand names (&ldquo;Nurse Smith
        specializes in Botox&rdquo;) carry the same brand-advertising
        issues as promotional marketing. Generic framing
        (&ldquo;specializes in neuromodulator injections&rdquo;) is
        compliance-safer on bio pages.
      </P>

      <H3>Issue 8: Patient success implications</H3>
      <P>
        &ldquo;Our patients love what we do&rdquo; is a generic
        positive framing that&rsquo;s typically fine. &ldquo;Our
        patients consistently achieve their aesthetic goals&rdquo;
        crosses into outcome-implication territory. The line is
        subtle but matters.
      </P>

      <H2 id="audit-framework">The About-page audit framework</H2>

      <H3>Step 1: Compile every bio and About page</H3>
      <P>
        Main About page, each provider bio, leadership team bios,
        founding-story pages, company-values pages. Many practices
        discover they have more of these than they realized.
      </P>

      <H3>Step 2: Run claim-category scan</H3>
      <P>
        For each page, scan for: specialty-claim issues,
        credential-overstatement issues, outcome claims, superlative
        language, and brand-name issues. This is the same rule-set
        as other marketing surfaces but applied to bio content.
      </P>

      <H3>Step 3: Verify credentials specifically</H3>
      <P>
        For each board certification claim, verify with the specific
        board (ABMS member or equivalent). For each educational
        claim, verify dates and institutions. For each clinical
        focus claim, verify it matches training and practice
        pattern.
      </P>

      <H3>Step 4: Update with specific factual framing</H3>
      <P>
        Rewrite with specific factual attribution where marketing
        language was vague. &ldquo;Board-certified&rdquo; becomes
        &ldquo;Certified by [specific board].&rdquo; &ldquo;Years of
        experience&rdquo; becomes specific time periods. Specificity
        is both compliant and more credible to informed readers.
      </P>

      <H3>Step 5: Maintain going forward</H3>
      <P>
        Provider bios drift as people add accomplishments over time.
        Build an annual bio-review step into the practice&rsquo;s
        compliance calendar.
      </P>

      <Callout variant="info" title="The About-page insight">
        About pages are written once and rarely reviewed, but they
        carry as much regulatory exposure per word as your
        highest-traffic marketing pages. State medical boards
        specifically look at About pages in complaint investigations
        because they capture how the practice represents itself.
      </Callout>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Do staff bio pages get the same treatment?</H3>
      <P>
        Yes. Nurse injector bios, aesthetician bios, and
        administrative-staff bios all contain marketing claims if
        they describe the person&rsquo;s work at the practice.
        Review them all.
      </P>

      <H3>What about &ldquo;Meet the team&rdquo; pages?</H3>
      <P>
        Same rules. Bio blurbs that include specialty claims,
        credentials, or outcome implications need the same scrutiny.
        Brief photo-and-name formats are generally lower-risk because
        they make fewer claims.
      </P>

      <H3>Can I say someone is an &ldquo;expert&rdquo;?</H3>
      <P>
        Generally avoid it. &ldquo;Expert&rdquo; is a superlative
        without formal credential; state medical boards have
        specifically flagged this language. Specific attribution
        (&ldquo;Dr. Smith has performed over X procedures,&rdquo;
        &ldquo;trained at [specific program]&rdquo;) is both more
        factual and more credible.
      </P>

      <H3>What about press mentions and awards on bios?</H3>
      <P>
        Generally fine with specific attribution. &ldquo;Named in
        Best Doctors by [publication] in [year]&rdquo; with a
        specific citation is factual. Using awards to imply broader
        superiority (&ldquo;award-winning practice&rdquo;) without
        the specific award crosses into superlative territory.
      </P>

      <H3>Do state medical boards really look at About pages?</H3>
      <P>
        Yes. State medical board complaint investigations frequently
        reference the physician&rsquo;s public bio and About page
        content. Disciplinary actions based on About-page content
        specifically have occurred across multiple states.
      </P>

      <H3>How often should About pages be reviewed?</H3>
      <P>
        Annually at minimum, plus any time a provider changes role,
        earns new credentials, or changes practice focus. Most
        practices underinvest in this review.
      </P>

      <KeyTakeaways
        items={[
          "About pages and provider bios are rarely reviewed for compliance but contain significant marketing exposure.",
          "Specialty misrepresentations, credential overstatement, and outcome claims are the most common issues.",
          "State medical boards specifically review About pages in complaint investigations.",
          "Specific factual attribution - named boards, specific dates, specific institutions - is compliance-safer and more credible than vague superlative language.",
          "Annual review prevents the long-term drift that makes About pages the most-ignored high-exposure marketing surface.",
        ]}
      />
    </>
  )
}
