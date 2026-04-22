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
  slug: "pre-publish-compliance-checklist",
  title:
    "The Pre-Publish Compliance Checklist: A 90-Second Review Every Piece of Healthcare Marketing Should Pass",
  description:
    "A practical 15-item checklist for reviewing any piece of healthcare marketing content before it goes live. Covers the FDA, FTC, HIPAA, and platform-policy categories in 90 seconds per item.",
  excerpt:
    "Most compliance failures would be caught by a 90-second review. Here's the exact checklist - 15 items across FDA, FTC, HIPAA, and platform policy - that every piece of content should pass before publishing.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "pre-publish compliance checklist",
    "healthcare marketing review checklist",
    "FTC compliance check",
    "marketing approval checklist healthcare",
    "compliance review process",
  ],
  tags: ["Tactical", "Checklist"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical checklist",
  extraSchemas: [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Pre-publish healthcare marketing compliance checklist",
      description:
        "A 15-item checklist for reviewing any piece of healthcare marketing content before it goes live - FDA, FTC, HIPAA, and platform policy categories.",
      totalTime: "PT10M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "FDA claim check",
          text: "Scan for disease-treatment claims, 'FDA-approved' misuse, off-label indication promotion, and safety absolutes.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "FTC substantiation check",
          text: "Verify any objective claim has competent-and-reliable scientific evidence on file before the claim is made.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Endorsement disclosure check",
          text: "Check material-connection disclosure and typical-experience disclosure on any endorsement or testimonial.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "HIPAA authorization check",
          text: "Verify patient authorization exists for any patient information used, including photos and testimonials.",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Platform policy check",
          text: "Verify compliance with specific platform rules for the channel the content is going to - Meta, Google, TikTok each have distinct requirements.",
        },
      ],
    },
  ],
}

export default function Body() {
  return (
    <>
      <Lead>
        Most healthcare marketing compliance failures are preventable
        with a 90-second review per item. The problem is not that
        review takes too long - it&rsquo;s that the review
        isn&rsquo;t structured, so staff don&rsquo;t know what to
        check. Here&rsquo;s a practical 15-item checklist that covers
        the main FDA, FTC, HIPAA, and platform-policy categories.
        Use it before every publish.
      </Lead>

      <Callout variant="info" title="Print this">
        Laminate it. Tape it to the monitor of whoever publishes
        social posts. Include it in your content management system as
        a required pre-publish gate. Most compliance failures are
        caught by &ldquo;did anyone check&rdquo; going from no to
        yes.
      </Callout>

      <H2 id="fda-claims">FDA claim check (4 items)</H2>

      <H3>1. Any disease names?</H3>
      <P>
        Scan for specific disease or condition names used in
        connection with your treatment. &ldquo;Arthritis,&rdquo;
        &ldquo;depression,&rdquo; &ldquo;diabetes,&rdquo;
        &ldquo;cancer,&rdquo; &ldquo;ED,&rdquo; &ldquo;migraine&rdquo;
        - any named disease paired with claimed treatment is
        FDA drug-claim territory. Remove the disease name or remove
        the claim.
      </P>

      <H3>2. Any &ldquo;cures,&rdquo; &ldquo;treats,&rdquo; &ldquo;heals,&rdquo; &ldquo;prevents,&rdquo; &ldquo;reverses&rdquo;?</H3>
      <P>
        Direct therapeutic verbs are drug claims. Replace with
        &ldquo;may support,&rdquo; &ldquo;may help,&rdquo; &ldquo;has
        been studied for&rdquo; language plus the appropriate
        individual-variation disclosure.
      </P>

      <H3>3. &ldquo;FDA-approved&rdquo; accurate?</H3>
      <P>
        Check: is the specific product FDA-approved (PMA/NDA),
        FDA-cleared (510(k)), FDA-registered (facility), or none of
        the above? The three are not interchangeable. Verify and
        correct.
      </P>

      <H3>4. Any safety absolutes?</H3>
      <P>
        &ldquo;No side effects,&rdquo; &ldquo;completely safe,&rdquo;
        &ldquo;risk-free,&rdquo; &ldquo;painless&rdquo; -
        absolute-safety claims. Replace with specific
        &ldquo;most patients experience&rdquo; language.
      </P>

      <H2 id="ftc-substantiation">FTC substantiation check (3 items)</H2>

      <H3>5. Specific numbers?</H3>
      <P>
        Any specific percentage, pound, inch, follicle count, or
        other number needs substantiation. Cite the study, or
        attribute as &ldquo;some patients report&rdquo; without the
        specific number, or remove.
      </P>

      <H3>6. &ldquo;Clinically proven,&rdquo; &ldquo;studies show,&rdquo; &ldquo;research confirms&rdquo;?</H3>
      <P>
        These phrases trigger the prior-substantiation rule. Either
        cite the specific study with specific findings, or rephrase
        as &ldquo;research into [area] continues&rdquo; framing.
      </P>

      <H3>7. Superlatives (&ldquo;best,&rdquo; &ldquo;top,&rdquo; &ldquo;leading,&rdquo; &ldquo;most&rdquo;)?</H3>
      <P>
        Superlative claims need substantiation. Reframe as
        &ldquo;a leading [specialty] practice in [location]&rdquo; or
        remove.
      </P>

      <H2 id="endorsement">Endorsement and testimonial check (3 items)</H2>

      <H3>8. Testimonials have typical-experience framing?</H3>
      <P>
        Any testimonial describing outcome must be paired with
        disclosure of typical experience. &ldquo;Results may vary&rdquo;
        is not sufficient - disclose what typical customers
        actually experience.
      </P>

      <H3>9. Material connections disclosed?</H3>
      <P>
        Paid endorsers, free-treatment endorsers, employees, family
        members - the material connection must be clearly
        disclosed in the post itself. Not in bio, not in fine print,
        not behind a click.
      </P>

      <H3>10. Celebrity or influencer content?</H3>
      <P>
        Apply heightened scrutiny to celebrity or influencer content.
        Verify the endorsement relationship is documented, the
        disclosure is in the post itself, and the content avoids
        implied-endorsement patterns if no formal relationship exists.
      </P>

      <H2 id="hipaa-check">HIPAA and patient info check (2 items)</H2>

      <H3>11. Patient authorization for info used?</H3>
      <P>
        Photos, stories, quotes, initials - any patient
        information needs documented HIPAA-compliant authorization
        for marketing use. Verify authorization exists in your
        records.
      </P>

      <H3>12. No unauthorized PHI visible?</H3>
      <P>
        Check backgrounds of photos for patient charts, names, or
        protected information. Check testimonials for statements
        that implicitly identify specific patients.
      </P>

      <H2 id="platform-check">Platform-specific check (2 items)</H2>

      <H3>13. Platform policy for intended channel?</H3>
      <P>
        Meta: before/after imagery rules, specific health-outcome
        claim rules. Google Ads: category restrictions, landing page
        compliance. TikTok: medical content guidelines. Verify the
        specific channel&rsquo;s rules.
      </P>

      <H3>14. Landing page also compliant?</H3>
      <P>
        If the content is an ad, the landing page is in the same
        compliance scope. Verify the landing page meets the same
        standards as the ad.
      </P>

      <H2 id="final-check">Final check (1 item)</H2>

      <H3>15. Would you show this to a regulator?</H3>
      <P>
        The gut check. If the piece of content makes you hesitate
        when imagining it as an exhibit in an FDA or FTC
        proceeding, stop and revise. Most reviewers know the
        answer; the checklist just creates the space to acknowledge
        it.
      </P>

      <BQ>
        This checklist is the difference between &ldquo;someone
        should have caught that&rdquo; and &ldquo;we have a process
        for this.&rdquo; The checklist itself takes 90 seconds per
        item with practice. The cost of not having one is measured
        in warning letters.
      </BQ>

      <H2 id="integration">Integrating the checklist into your workflow</H2>
      <UL>
        <LI>
          <Strong>Every social post.</Strong> Run through the
          checklist before scheduling. Items 1-10 apply to every
          post; items 11-14 apply depending on content.
        </LI>
        <LI>
          <Strong>Every ad.</Strong> Full checklist for every ad
          creative, including landing page review at item 14.
        </LI>
        <LI>
          <Strong>Every email send.</Strong> Items 1-10 at minimum;
          full checklist if email includes testimonials or
          endorsements.
        </LI>
        <LI>
          <Strong>Every website page.</Strong> Full checklist at
          launch; re-check when edits touch compliance-sensitive
          sections.
        </LI>
        <LI>
          <Strong>Every blog post.</Strong> Full checklist, with extra
          attention to substantiation items 5-7 for educational
          content making specific claims.
        </LI>
      </UL>

      <KeyTakeaways
        items={[
          "A 15-item pre-publish checklist catches most compliance failures in 90 seconds per item.",
          "Items cluster across FDA claim (4), FTC substantiation (3), endorsement (3), HIPAA (2), platform (2), and final gut check (1).",
          "Print the checklist and integrate it into the content workflow - the discipline of running it matters more than the specific format.",
          "Gut check at item 15 - would you show this to a regulator? - is the most-useful item because it invites honest reviewer judgment.",
          "Different content types apply different subsets; ads get the full checklist plus landing page review.",
        ]}
      />
    </>
  )
}
