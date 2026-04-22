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
  slug: "healthcare-social-media-compliance-audit",
  title:
    "How to Audit Your Healthcare Practice's Social Media for FDA/FTC Compliance: A Step-by-Step Framework",
  description:
    "A tactical audit framework for healthcare practice social media — Instagram, TikTok, Facebook, YouTube, LinkedIn, and staff personal accounts. Covers what to scan for, how to prioritize, and how to fix patterns at the source.",
  excerpt:
    "Your social media is the highest-velocity compliance surface in your practice — and the one that typically has the least review before publish. Here's the audit framework to catch compliance issues before a regulator does.",
  date: "2026-04-22",
  readingMinutes: 11,
  keywords: [
    "healthcare social media compliance audit",
    "med spa Instagram compliance",
    "TikTok healthcare compliance audit",
    "social media FTC audit",
    "healthcare marketing audit social",
  ],
  tags: ["Tactical", "Social media", "Audit"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical playbook",
  extraSchemas: [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to audit healthcare practice social media for FDA/FTC compliance",
      description:
        "Step-by-step framework for auditing your practice's social media presence across Instagram, TikTok, Facebook, YouTube, LinkedIn, and staff accounts for FDA and FTC compliance.",
      totalTime: "P7D",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Inventory every account",
          text: "List every public-facing social account associated with the practice, including physician personal accounts, nurse injector personal accounts, and any staff accounts that mention the practice. All of these are in scope.",
          url: "https://compliance.regenportal.com/blog/healthcare-social-media-compliance-audit#step-1-inventory",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Pull content export or screenshot history",
          text: "For each account, export or screenshot the last 12 months of posts, stories, highlights, and ad creative. For platforms without export, use a third-party archiving tool.",
          url: "https://compliance.regenportal.com/blog/healthcare-social-media-compliance-audit#step-2-export",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Scan for specific claim categories",
          text: "Run each piece of content through a compliance scan covering: disease-treatment claims, FDA-approved misuse, safety absolutes, outcome guarantees, typical-experience gaps, material-connection disclosures, and brand-name advertising compliance.",
          url: "https://compliance.regenportal.com/blog/healthcare-social-media-compliance-audit#step-3-scan",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Triage by reach and risk",
          text: "Prioritize corrections by the product of reach and risk. High-reach posts with HIGH-risk flags come first; LOW-risk flags on low-reach posts can wait.",
          url: "https://compliance.regenportal.com/blog/healthcare-social-media-compliance-audit#step-4-triage",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Correct or retire content",
          text: "For each flagged piece of content, either edit it to remove the violation, add required disclosures, or delete it. Document what was changed on each piece and why.",
          url: "https://compliance.regenportal.com/blog/healthcare-social-media-compliance-audit#step-5-correct",
        },
        {
          "@type": "HowToStep",
          position: 6,
          name: "Update the publish process",
          text: "Implement a pre-publish compliance check going forward so the same categories of issues don't reappear in new content. This is the structural change that prevents recurrence.",
          url: "https://compliance.regenportal.com/blog/healthcare-social-media-compliance-audit#step-6-update-process",
        },
      ],
    },
  ],
}

export default function Body() {
  return (
    <>
      <Lead>
        Social media is the highest-velocity marketing surface in most
        healthcare practices and the one that typically gets the least
        compliance review before publish. It&rsquo;s also
        disproportionately where FTC and FDA enforcement actually
        starts &mdash; the Wellbeing Corporation settlement cited a
        single Instagram post; the FDA regularly cites social media
        content in warning letters. If you haven&rsquo;t audited your
        practice&rsquo;s social media presence for compliance, this
        post walks through the framework to do it in a week.
      </Lead>

      <H2 id="step-1-inventory">Step 1 &mdash; Inventory every account</H2>
      <P>
        Most clinic owners underestimate the number of social accounts
        in scope. A typical med spa with a physician owner and three
        nurse injectors can easily have 8-12 distinct accounts that
        the FDA or FTC would consider part of the practice&rsquo;s
        marketing surface.
      </P>

      <H3>Accounts in scope</H3>
      <UL>
        <LI>
          <Strong>Practice accounts.</Strong> Official Instagram,
          TikTok, Facebook, YouTube, LinkedIn, Twitter/X accounts for
          the practice.
        </LI>
        <LI>
          <Strong>Physician personal accounts.</Strong> If the
          physician discusses the practice, its treatments, or patient
          outcomes anywhere, the account is in scope. &ldquo;Personal
          account&rdquo; does not mean exempt.
        </LI>
        <LI>
          <Strong>Nurse injector and provider accounts.</Strong> Same
          rule &mdash; if practice-related content appears, it&rsquo;s
          part of the marketing surface.
        </LI>
        <LI>
          <Strong>Front desk, marketing staff accounts.</Strong>
          Often-overlooked but sometimes include practice content.
        </LI>
        <LI>
          <Strong>Patient-facing communication accounts.</Strong>
          Direct message accounts, appointment-booking chat systems,
          any account used for patient outreach.
        </LI>
      </UL>

      <H2 id="step-2-export">Step 2 &mdash; Pull content export or screenshot history</H2>
      <P>
        Before scanning, you need to have the content accessible.
        Different platforms have different export capabilities:
      </P>

      <H3>Platform-specific export options</H3>
      <UL>
        <LI>
          <Strong>Instagram.</Strong> Meta&rsquo;s data download
          includes posts, stories, and DMs. Third-party tools can
          extract caption + image data in reviewable format.
        </LI>
        <LI>
          <Strong>TikTok.</Strong> Similar data download available.
          For caption and voiceover text, third-party transcription
          tools help.
        </LI>
        <LI>
          <Strong>Facebook.</Strong> Meta&rsquo;s data download covers
          pages and personal accounts.
        </LI>
        <LI>
          <Strong>YouTube.</Strong> Google Takeout provides video and
          caption data; transcripts can be pulled from the platform.
        </LI>
        <LI>
          <Strong>LinkedIn.</Strong> Data export available; less
          frequently an issue unless the practice uses LinkedIn for
          consumer marketing.
        </LI>
      </UL>

      <H3>Scope: how far back to audit</H3>
      <P>
        For practical purposes, 12-24 months covers most active
        enforcement risk. Older content that&rsquo;s no longer
        prominent can be prioritized after newer content. Content
        that appears in archives or highlights stays in scope
        regardless of age.
      </P>

      <H2 id="step-3-scan">Step 3 &mdash; Scan for specific claim categories</H2>
      <P>
        Scanning without a structured rule set misses categories of
        issues consistently. Use a specific list of claim categories
        rather than ad-hoc review.
      </P>

      <H3>Claim categories to scan for</H3>
      <OL>
        <LI>
          <Strong>Disease-treatment claims.</Strong> Any phrasing that
          says or implies a treatment addresses a named disease or
          condition.
        </LI>
        <LI>
          <Strong>FDA-approved misuse.</Strong> &ldquo;FDA-approved&rdquo;
          applied to products that are FDA-cleared, FDA-registered,
          or operating under the 361 pathway.
        </LI>
        <LI>
          <Strong>Safety absolutes.</Strong> &ldquo;No side
          effects,&rdquo; &ldquo;completely safe,&rdquo;
          &ldquo;risk-free.&rdquo;
        </LI>
        <LI>
          <Strong>Outcome guarantees.</Strong> &ldquo;Guaranteed
          results,&rdquo; &ldquo;money-back guarantee on
          outcomes,&rdquo; similar.
        </LI>
        <LI>
          <Strong>Typical-experience gaps.</Strong> Outcome claims
          without typical-experience disclosure, particularly in
          before/after content and weight-loss testimonials.
        </LI>
        <LI>
          <Strong>Material-connection gaps.</Strong> Endorsements
          without FTC-compliant disclosure of paid relationships or
          other material connections.
        </LI>
        <LI>
          <Strong>Brand-name advertising issues.</Strong> Prescription
          drug brand names in promotional contexts, off-label
          indication promotion, etc.
        </LI>
        <LI>
          <Strong>Substantiation issues.</Strong> &ldquo;Clinically
          proven,&rdquo; &ldquo;proven to work,&rdquo; without the
          specific evidence cited.
        </LI>
        <LI>
          <Strong>Superlative claims.</Strong> &ldquo;Best,&rdquo;
          &ldquo;top,&rdquo; &ldquo;most effective&rdquo; without
          substantiation.
        </LI>
      </OL>

      <Callout variant="info" title="Manual vs automated scanning">
        A purely manual audit of 12 months of social content across 8
        accounts is extremely time-consuming. An automated compliance
        scanner can process the same content in a fraction of the
        time with more consistent application of the rule set. Even
        if you use a scanner, a human reviewer should spot-check the
        output.
      </Callout>

      <H2 id="step-4-triage">Step 4 &mdash; Triage by reach and risk</H2>
      <P>
        Not all flagged content is equally urgent. The priority
        framework is reach times risk:
      </P>

      <H3>Risk levels</H3>
      <UL>
        <LI>
          <Strong>HIGH risk.</Strong> Disease-treatment claims,
          FDA-approved misuse, cancer or serious-condition claims,
          undisclosed celebrity endorsements.
        </LI>
        <LI>
          <Strong>MEDIUM risk.</Strong> Safety absolutes, typical-
          experience gaps, brand-name issues, superlative claims.
        </LI>
        <LI>
          <Strong>LOW risk.</Strong> Missing disclosures on
          lower-stakes content, minor substantiation issues.
        </LI>
      </UL>

      <H3>Reach proxy</H3>
      <P>
        For each flagged piece of content, use impression count or
        engagement as a reach proxy. A HIGH-risk post with 50,000
        impressions is more urgent than a HIGH-risk post with 200
        impressions &mdash; though both need fixing.
      </P>

      <H3>Triage output</H3>
      <P>
        Produce a ranked list: highest reach × highest risk first.
        This list is what the correction team works through in
        sequence. Without this triage, teams often fix easy issues
        first and run out of energy before addressing the
        highest-impact ones.
      </P>

      <H2 id="step-5-correct">Step 5 &mdash; Correct or retire content</H2>
      <P>
        For each flagged piece, there are three options: edit, add
        disclosure, or delete.
      </P>

      <H3>Edit</H3>
      <P>
        When the underlying content is worth preserving but the
        specific claim needs to change, edit the caption, replace the
        offending phrase with a compliant alternative, and update.
        Most HIGH-risk claims can be edited to compliant alternatives
        without losing the marketing message.
      </P>

      <H3>Add disclosure</H3>
      <P>
        For typical-experience gaps, material-connection issues, and
        some substantiation issues, adding proper disclosure is often
        sufficient &mdash; provided the disclosure is clear and
        conspicuous (not in fine print, not linked elsewhere).
      </P>

      <H3>Delete</H3>
      <P>
        Sometimes the content is fundamentally non-compliant and
        cannot be salvaged. Disease-treatment testimonials, celebrity
        endorsements without proper disclosure for which you
        can&rsquo;t add disclosure retroactively, or content making
        cancer-related claims should typically be deleted rather than
        edited.
      </P>

      <H3>Document every change</H3>
      <P>
        Maintain a log: post URL, original content (screenshot),
        action taken, date, responsible staff. This documentation is
        valuable both for ongoing compliance records and as evidence
        of good-faith compliance in any future regulatory interaction.
      </P>

      <H2 id="step-6-update-process">Step 6 &mdash; Update the publish process</H2>
      <P>
        The audit is temporary. The publish process is permanent. If
        you don&rsquo;t change how new content enters the social
        surface, the same categories of issues will reappear within
        months.
      </P>

      <H3>Pre-publish compliance check</H3>
      <P>
        Implement a step in your social media publishing workflow
        where each piece of content is checked against the same rule
        set you just used for the audit. This can be a 30-second
        scanner review, a checklist review by the marketing manager,
        or a combination.
      </P>

      <H3>Staff training</H3>
      <P>
        Train every staffer who creates or approves social content
        on the claim categories and the specific patterns that got
        flagged in your audit. Training should be documented (dates,
        topics, attendees).
      </P>

      <H3>Archive management</H3>
      <P>
        Highlights and pinned posts stay public long after the
        original post date. Include them in recurring audits and in
        any archival strategy.
      </P>

      <H3>Physician and staff account policy</H3>
      <P>
        Create clear written guidelines for what physicians and staff
        can and cannot post about practice treatments on personal
        accounts. Many practices solve this by saying &ldquo;no
        practice-related content on personal accounts&rdquo; &mdash;
        which is clear, enforceable, and eliminates an entire class of
        compliance risk.
      </P>

      <H2 id="platform-specifics">Platform-specific notes</H2>

      <H3>Instagram</H3>
      <P>
        Highlights, Reels, and Stories each have their own compliance
        considerations. Highlights stick around as permanent content;
        Reels often get higher reach than feed posts; Stories expire
        but can be captured by screenshot.
      </P>

      <H3>TikTok</H3>
      <P>
        Audio transcripts matter for compliance review, not just
        captions. The FTC reads video content including voiceover and
        on-screen text. Short-form video ads face the highest
        enforcement attention.
      </P>

      <H3>Facebook</H3>
      <P>
        Boost-promoted posts carry the same compliance weight as paid
        ads. Review boosted posts with the same rigor as formal ad
        campaigns. Also review user-generated content on your page
        where you&rsquo;ve interacted (engagement can be construed as
        endorsement).
      </P>

      <H3>YouTube</H3>
      <P>
        Video descriptions and transcripts both count. YouTube ads
        require the same compliance rigor as other video ad
        platforms. Live-stream content should be treated like any
        other marketing content once recorded.
      </P>

      <H3>LinkedIn</H3>
      <P>
        Business-to-business healthcare content (e.g., speaking to
        other physicians or practice owners) has different considerations
        than consumer marketing, but practice LinkedIn pages that
        reach consumers still need compliance review.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>How long does a first-time audit take?</H3>
      <P>
        For a typical med spa or aesthetic practice with 12 months of
        content across 5-10 accounts, a first-time audit runs a
        week with automation or 2-3 weeks fully manual. Subsequent
        audits take significantly less time because most of the
        historical content has been cleaned up.
      </P>

      <H3>Can I do this in-house or do I need an agency?</H3>
      <P>
        In-house with the right tools and someone willing to learn the
        rules. An agency specializing in healthcare marketing
        compliance can accelerate the work but is typically
        cost-effective only for larger practices or practices with
        extensive historical content.
      </P>

      <H3>What if I find content that&rsquo;s clearly been a violation for years?</H3>
      <P>
        Correct it quickly. The length of time a violation has been
        up doesn&rsquo;t increase your liability for subsequent
        correction &mdash; but continuing the violation after
        awareness definitely does. Silent, prompt correction is the
        right approach for most historical issues.
      </P>

      <H3>Do I need to disclose the audit publicly?</H3>
      <P>
        No. Compliance audits are standard business practice and
        don&rsquo;t require public disclosure. Visible
        &ldquo;retroactively corrected&rdquo; notices are not
        required and generally not recommended.
      </P>

      <H3>What about deleted content that&rsquo;s archived elsewhere?</H3>
      <P>
        Third-party archives (Wayback Machine, platform data exports
        requested by others, screenshots in news coverage) are beyond
        your control. Your responsibility is compliance on the
        surfaces you control. Deleted content that&rsquo;s been
        archived elsewhere is not ongoing advertising from your
        practice.
      </P>

      <H3>How often should audits recur?</H3>
      <P>
        Quarterly for most practices. Faster for high-volume social
        publishing. A comprehensive annual audit plus quarterly
        check-ins is the cadence that balances rigor and practicality.
      </P>

      <KeyTakeaways
        items={[
          "Every practice-adjacent social account is in scope — including physician personal accounts and nurse injector personal accounts.",
          "Scan with a structured rule set covering disease-treatment, FDA-approved misuse, safety absolutes, outcome guarantees, typical-experience gaps, and material-connection gaps.",
          "Triage corrections by reach × risk — highest-reach HIGH-risk content first.",
          "The audit closes historical issues; updating the publish process prevents recurrence.",
          "Document every correction with URL, original content, action, date, and responsible staff — this is evidence of good-faith compliance.",
        ]}
      />
    </>
  )
}
