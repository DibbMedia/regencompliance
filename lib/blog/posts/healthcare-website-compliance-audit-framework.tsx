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
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "healthcare-website-compliance-audit-framework",
  title:
    "How to Audit Your Healthcare Website for FDA/FTC Compliance: A 5-Step Framework You Can Run in Two Weeks",
  description:
    "A tactical 5-step framework for auditing a healthcare practice website for FDA/FTC compliance violations. Covers inventory, triage, claim-category scan, source rewrites, and archive retirement.",
  excerpt:
    "A tactical framework any clinic can run in two weeks: inventory, pageview-weighted triage, claim-category scan, rewrite-at-source style guide updates, and archive retirement. With the exact sequencing and who does what.",
  date: "2026-04-21",
  readingMinutes: 11,
  keywords: [
    "healthcare website compliance audit",
    "healthcare marketing audit framework",
    "FDA website audit",
    "FTC compliance audit clinic",
    "compliance audit checklist healthcare",
    "med spa website audit",
  ],
  tags: ["Compliance audit", "Framework", "Tactical"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "5-step playbook",
  extraSchemas: [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Audit a Healthcare Website for FDA/FTC Compliance in Two Weeks",
      description:
        "A tactical 5-step framework for auditing a healthcare practice website for FDA/FTC compliance violations - inventory, triage, claim-category scan, rewrite at source, archive retirement.",
      totalTime: "P14D",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Full marketing-surface inventory",
          text: "Pull every marketing surface into one sheet - website pages (via sitemap or crawl), social media posts and highlights, paid ads (active and paused), email templates and automations, sales scripts, intake forms, and third-party listings like Google Business, Yelp, Healthgrades, Zocdoc.",
          url: "https://compliance.regenportal.com/blog/healthcare-website-compliance-audit-framework#step-1-inventory",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Pageview-weighted triage",
          text: "Rank the inventory by pageviews and impressions. Top-traffic assets get reviewed first. Target the top 20% of traffic-weighted surfaces for the initial pass - this typically captures 80%+ of enforcement exposure.",
          url: "https://compliance.regenportal.com/blog/healthcare-website-compliance-audit-framework#step-2-triage",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Claim-category scan",
          text: "Run each prioritized asset through a compliance scanner (or manual checklist) scanning for the high-frequency claim categories: disease claims, structure-function overreach, FDA-approved misuse, guarantee language, testimonial-disclosure gaps, before/after typical-experience issues, and specialty-specific patterns.",
          url: "https://compliance.regenportal.com/blog/healthcare-website-compliance-audit-framework#step-3-scan",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Rewrite at source",
          text: "Update your style guide and content sources with compliant language - not just the audit output. The goal is preventing the same violations from reappearing in future content, not just removing them once.",
          url: "https://compliance.regenportal.com/blog/healthcare-website-compliance-audit-framework#step-4-rewrite",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Archive retirement",
          text: "Old pages, old social posts, and old ads that aren't worth updating should be deprecated, delisted, or removed. Regulators read your active public surface - if it exists and is findable, it's in scope.",
          url: "https://compliance.regenportal.com/blog/healthcare-website-compliance-audit-framework#step-5-archive",
        },
      ],
      tool: [
        {
          "@type": "HowToTool",
          name: "Compliance scanner (RegenCompliance or equivalent)",
        },
        { "@type": "HowToTool", name: "Site analytics (GA4, Vercel Analytics, etc.)" },
        { "@type": "HowToTool", name: "CMS or content export access" },
      ],
    },
  ],
}

export default function Body() {
  return (
    <>
      <Lead>
        A website compliance audit is the single highest-ROI compliance
        investment a healthcare practice can make right now. It is also the
        single most commonly misrun one - either treated as a
        once-a-year legal review, or as a one-time cleanup that finishes and
        stays finished. Both approaches fail under 2026 FDA/FTC enforcement
        cadence. Here is the framework that actually works.
      </Lead>

      <P>
        The goal of the framework is simple: end the audit in a better place
        than a find-and-replace pass, end it in the same place every time you
        run it (so outcomes are reproducible), and end it with audit trail that
        you can show a regulator if you need to respond to a warning letter in
        15 business days.
      </P>

      <Callout variant="info" title="Two-week sprint, not a two-month project">
        Every clinic that runs this framework in under two weeks ships. Every
        clinic that treats it as a two-month project does not. Time-box
        aggressively - the goal is getting the worst risk off the
        public surface this month, not building a perfect audit program.
      </Callout>

      <H2 id="step-1-inventory">Step 1 - Full marketing-surface inventory</H2>
      <P>
        Before you can audit, you need to know what exists. Most clinic owners
        underestimate this by a factor of 5 to 10 - the marketing
        surface is always larger than you think.
      </P>
      <H3>What to inventory</H3>
      <UL>
        <LI>
          <Strong>Website pages.</Strong> Pull a crawl from your CMS export, a
          sitemap, or an SEO tool. Include unlinked pages.
        </LI>
        <LI>
          <Strong>Social media.</Strong> Every post, story highlight, pinned
          post, and profile bio across Instagram, TikTok, Facebook, LinkedIn,
          X, YouTube.
        </LI>
        <LI>
          <Strong>Paid ads.</Strong> Every active and paused ad + every ad
          variation across Google, Meta, TikTok, YouTube. Platform ad
          libraries are public - regulators use them.
        </LI>
        <LI>
          <Strong>Email.</Strong> Every template in your ESP, every automation
          flow, every recent one-off broadcast.
        </LI>
        <LI>
          <Strong>Scripts and intake.</Strong> Sales scripts, on-hold message,
          intake forms, consent language, after-care instructions.
        </LI>
        <LI>
          <Strong>Third-party surfaces.</Strong> Your Google Business profile,
          Yelp, Healthgrades, RealSelf, Zocdoc, directory listings, partner
          sites that reference you.
        </LI>
        <LI>
          <Strong>Archive / Wayback.</Strong> Check
          {" "}<code className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[13px] text-white/90">archive.org/web/*/yourclinic.com</code>{" "}
          for pages that have been removed or rewritten. Archived pages are
          still readable by regulators.
        </LI>
      </UL>
      <P>
        Dump every URL or surface into a single spreadsheet. One row per
        surface. One column for type. This is your audit universe.
      </P>

      <H2 id="step-2-triage">
        Step 2 - Pageview-weighted triage
      </H2>
      <P>
        Auditing 200 pages perfectly takes weeks. Auditing the top 10 pages
        today cuts most of the actual risk. Do the high-traffic surfaces
        first.
      </P>
      <H3>How to prioritize</H3>
      <OL>
        <LI>
          Pull 90-day pageviews from your analytics (GA4, Plausible, Fathom,
          whatever you use).
        </LI>
        <LI>
          Sort descending. Top 10 pages typically carry 60&ndash;80% of traffic
          in a small clinic site.
        </LI>
        <LI>
          Then overlay: every page that&rsquo;s a landing page for an active
          ad. Regardless of pageview count. A low-traffic landing page that
          pairs with a high-spend ad is a high-risk surface.
        </LI>
        <LI>
          Then: every social post from the last 12 months that got above-median
          engagement. Posts that spread are the posts regulators see.
        </LI>
        <LI>
          Everything else is the long tail. Audit it in the second sprint.
        </LI>
      </OL>

      <Callout variant="warn" title="The one long-tail exception">
        Any page that makes a <Em>hard</Em> claim (cure, FDA-approved,
        guaranteed, testimonial without disclosure) is high-priority even if
        it gets ten pageviews a month. A single high-intensity claim on a
        forgotten page still opens a file.
      </Callout>

      <H2 id="step-3-claim-category-scan">
        Step 3 - Claim-category scan
      </H2>
      <P>
        For each surface in your triaged list, scan against four specific
        claim categories. These are the categories that drive the vast
        majority of 2024&ndash;2026 enforcement.
      </P>
      <H3>Category 1 - Disease claims</H3>
      <P>
        Any language asserting the product or procedure treats, cures, heals,
        reverses, or prevents a named medical condition. This is the single
        highest-density category. See{" "}
        <Link
          href="/blog/structure-function-vs-disease-claims"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          the structure/function vs. disease claims post
        </Link>{" "}
        for the line.
      </P>
      <H3>Category 2 - Implied or false FDA status</H3>
      <P>
        &ldquo;FDA-approved&rdquo; language when what you mean is
        FDA-registered, or when nothing at all is FDA-approved in the
        procedure chain. See{" "}
        <Link
          href="/blog/banned-words-healthcare-marketing-2026"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          the 7 banned words list
        </Link>{" "}
        for the specific phrases.
      </P>
      <H3>Category 3 - Outcome guarantees and safety absolutes</H3>
      <P>
        &ldquo;Guaranteed,&rdquo; &ldquo;100% safe,&rdquo; &ldquo;no side
        effects,&rdquo; &ldquo;risk-free.&rdquo; FTC territory.
      </P>
      <H3>Category 4 - Testimonial and before/after compliance</H3>
      <P>
        Testimonials without typical-experience disclosure. Before/after
        photos without standardization or consent documentation. Paid
        testimonials without material-connection disclosure.
      </P>

      <P>
        For each surface, mark which of the four categories applies and
        record the specific phrase and location. Your output from step 3 is a
        violation map: surface, category, exact text.
      </P>

      <H2 id="step-4-rewrite-at-source">
        Step 4 - Rewrite at the source, not at the instance
      </H2>
      <P>
        The most common audit failure is fixing each flagged phrase one at a
        time, letting the same language re-enter next week. The durable fix
        is to change the writing <Em>source</Em> so violations do not get
        typed in the first place.
      </P>
      <H3>Three source-level fixes</H3>
      <OL>
        <LI>
          <Strong>Marketing style guide update.</Strong> Add the seven banned
          words from the trigger-words post to your clinic style guide, with
          the approved alternatives written right next to them. This is the
          single most durable intervention.
        </LI>
        <LI>
          <Strong>Testimonial-solicitation workflow update.</Strong> Update
          your testimonial-collection form to ask patients to describe their
          experience in subjective terms rather than disease terms, and to
          include typical-experience disclosure automatically when the
          testimonial is an atypical outcome.
        </LI>
        <LI>
          <Strong>Pre-publish compliance scan.</Strong> Every piece of
          marketing content runs through a scan before it goes live. Pre-
          publish catches the violation when it is free to fix. Post-publish
          catches it after the regulator has a screenshot.
        </LI>
      </OL>
      <P>
        With all three in place, you are shipping violations at roughly 1/10
        the rate of a find-and-replace-only program. The delta compounds
        over a year.
      </P>

      <H2 id="step-5-archive-retirement">
        Step 5 - Archive retirement and audit trail
      </H2>
      <P>
        Two things remain after the rewrite pass.
      </P>
      <H3>Archive retirement</H3>
      <P>
        Pages, posts, and ads that were written under an older compliance
        standard and cannot be rewritten compliantly get retired - not
        hidden. For a website page that means 301-redirect it to the most
        relevant compliant page, so any link equity is preserved and the old
        URL stops serving violative content. For a social post, delete it;
        do not archive it.
      </P>
      <H3>Audit trail</H3>
      <P>
        Every change you made in the audit - what was flagged, what
        was rewritten, what was retired, by whom, and when - goes
        into a centralized audit log. If a warning letter arrives nine
        months from now, this is the file that turns a 15-business-day
        panic into a 15-business-day administrative task.
      </P>
      <BQ>
        The audit is not the compliance program. The audit trail is the
        compliance program.
      </BQ>

      <H2 id="cadence">How often to run this</H2>
      <UL>
        <LI>
          <Strong>Full audit:</Strong> every six months, minimum. Every quarter
          for higher-risk specialties (regen med, stem cell, GLP-1 weight
          loss).
        </LI>
        <LI>
          <Strong>Pre-publish scan:</Strong> every new piece of outward-facing
          content. No exceptions.
        </LI>
        <LI>
          <Strong>Rule refresh:</Strong> your compliance ruleset should pick
          up new FDA/FTC language within 24 hours. Quarterly manual refresh
          is too slow.
        </LI>
        <LI>
          <Strong>Archive sweep:</Strong> once a year. Check Wayback, check
          old-but-still-indexed pages, remove or redirect what no longer
          meets standards.
        </LI>
      </UL>

      <H2 id="who-runs-what">Who on the team does what</H2>
      <P>
        For most clinics, the cleanest role split is:
      </P>
      <UL>
        <LI>
          <Strong>Clinical lead (MD/owner):</Strong> signs off on rewrites
          touching disease language or testimonials. Not in the weeds of the
          audit.
        </LI>
        <LI>
          <Strong>Marketing lead or office manager:</Strong> runs the
          inventory, the scan, and the rewrites. Coordinates with vendor if
          you have one.
        </LI>
        <LI>
          <Strong>Vendor (if any):</Strong> runs the technical side -
          redirects, sitemap updates, CMS edits. Does not make compliance
          calls on copy.
        </LI>
        <LI>
          <Strong>Compliance scanner:</Strong> does the claim-category
          classification and produces the violation map. Runs pre-publish on
          every new piece of content thereafter.
        </LI>
      </UL>

      <Callout variant="success" title="Built exactly for this loop">
        <span>
          RegenCompliance runs the step-3 claim scan and the step-4 pre-
          publish scan in one tool. Every scan is logged for the step-5
          audit trail. One-click compliant rewrites are produced in under
          15 seconds.{" "}
          <Link
            href="/demo"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            Try a free scan
          </Link>
          .
        </span>
      </Callout>

      <KeyTakeaways
        items={[
          "Time-box the first audit at two weeks. Clinics that run it as a two-month project stall.",
          "Prioritize by pageviews and active-ad landing pages, not alphabetically.",
          "Scan every surface against four categories: disease claims, implied FDA approval, guarantees, testimonials.",
          "Fix at the source - style guide, testimonial workflow, pre-publish scan - so violations stop entering in the first place.",
          "Keep an exportable audit trail. In a warning-letter response, the trail is the program.",
        ]}
      />
    </>
  )
}
