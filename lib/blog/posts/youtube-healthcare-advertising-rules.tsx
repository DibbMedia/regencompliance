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
  slug: "youtube-healthcare-advertising-rules",
  title:
    "YouTube Healthcare Advertising Rules: Pre-Roll, In-Stream, and Channel Content Compliance",
  description:
    "YouTube healthcare advertising spans pre-roll ads, in-stream video, and channel content. Each has specific Google Ads policy and YouTube community guideline considerations on top of FDA/FTC rules.",
  excerpt:
    "YouTube is where healthcare practices build long-term trust and authority. Here's the compliance framework for pre-roll ads, channel content, and the specific patterns YouTube enforces.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "YouTube healthcare advertising",
    "YouTube medical ads rules",
    "Google Ads YouTube healthcare",
    "YouTube channel compliance healthcare",
    "YouTube healthcare community guidelines",
  ],
  tags: ["Platform", "YouTube"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Platform playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        YouTube healthcare advertising operates at the intersection
        of Google Ads policy, YouTube community guidelines, FDA/FTC
        rules, and the specific dynamics of video-based medical
        content. Pre-roll ads, in-stream advertising, channel-owned
        content, and creator partnership content each have their own
        compliance considerations. This post covers the full
        playbook for healthcare practices advertising or creating
        content on YouTube.
      </Lead>

      <H2 id="platform-structure">YouTube&rsquo;s compliance structure</H2>
      <P>
        Advertising on YouTube operates through Google Ads, so
        Google Ads healthcare policy applies (see our Google Ads
        healthcare post). YouTube itself has additional community
        guidelines on medical content.
      </P>

      <H3>Google Ads applied to YouTube</H3>
      <P>
        Prescription drug restrictions, unproven treatment
        restrictions, certification requirements for certain
        categories, landing page review, and general deceptive
        claims rules all apply to YouTube ads the same way they
        apply elsewhere in Google Ads.
      </P>

      <H3>YouTube-specific medical misinformation policy</H3>
      <P>
        YouTube has implemented specific medical misinformation
        policies, particularly around health-related content that
        contradicts expert consensus from health authorities. This
        affects both channel content (demonetization, removal) and
        advertising (disapproval).
      </P>

      <H2 id="ad-formats">Ad format considerations</H2>

      <H3>Pre-roll (in-stream)</H3>
      <P>
        Short (5-60 second) ads before video content. Compliance
        considerations:
      </P>
      <UL>
        <LI>
          Disclosure challenges similar to TikTok &mdash; visible
          on-screen text, verbal disclosure, caption support.
        </LI>
        <LI>
          Landing page compliance critical since viewers click
          through.
        </LI>
        <LI>
          Typical-experience and outcome-claim considerations apply
          in the video itself.
        </LI>
      </UL>

      <H3>Discovery ads</H3>
      <P>
        Ads appearing in YouTube search and browse. Content runs on
        the landing-page-plus-ad compliance framework.
      </P>

      <H3>Bumper ads</H3>
      <P>
        6-second non-skippable ads. Short format makes disclosure
        particularly challenging; simple practice-awareness content
        works better than complex claims.
      </P>

      <H3>Non-skippable in-stream</H3>
      <P>
        Longer ads users must watch. Content scrutiny is higher
        because full content is guaranteed to be seen.
      </P>

      <H2 id="channel-content">Channel content considerations</H2>
      <P>
        Many healthcare practices operate their own YouTube channels
        with educational and practice-content videos. This content
        is not ad-reviewed but is still subject to:
      </P>
      <UL>
        <LI>
          FDA/FTC marketing rules (if it&rsquo;s promoting the
          practice, it&rsquo;s marketing).
        </LI>
        <LI>
          HIPAA considerations if patient content is included.
        </LI>
        <LI>
          YouTube community guidelines on medical content.
        </LI>
        <LI>
          Monetization eligibility (different from ad compliance
          but affects channel revenue).
        </LI>
      </UL>

      <H2 id="creator-partnerships">Creator and influencer partnerships</H2>
      <P>
        Healthcare practices partnering with YouTube creators for
        sponsored content face the same FTC Endorsement Guides
        rules as any influencer partnership:
      </P>
      <UL>
        <LI>
          Material-connection disclosure in the video itself, not
          only in the description.
        </LI>
        <LI>
          Verbal and on-screen disclosure for compliance
          robustness.
        </LI>
        <LI>
          Content claims attributable to the practice require
          substantiation even when delivered by the creator.
        </LI>
        <LI>
          Creator&rsquo;s expertise (or lack thereof) affects how
          the FTC evaluates the endorsement.
        </LI>
      </UL>

      <H2 id="medical-doctor-content">&ldquo;MD&rdquo; / physician creator content</H2>
      <P>
        Physicians who create substantial YouTube content (educational
        channels, review content, commentary) face specific
        considerations:
      </P>
      <UL>
        <LI>
          Physicians commenting on their own practice&rsquo;s
          services are marketing; disclosure required.
        </LI>
        <LI>
          Physicians discussing products with paid relationships
          have material connection to disclose.
        </LI>
        <LI>
          State medical board rules on physician public communication
          apply.
        </LI>
        <LI>
          Physician endorsements of products create expert-endorsement
          considerations under FTC Guides.
        </LI>
      </UL>

      <H2 id="healthcare-channel-content">Healthcare channel content patterns that work</H2>

      <H3>Patient education</H3>
      <P>
        Explaining conditions, treatment categories, research
        findings without tying to specific practice services.
        Generally low compliance friction and builds long-term
        trust.
      </P>

      <H3>Procedure explanation</H3>
      <P>
        Describing what a procedure involves, typical experience,
        recovery, and candidacy considerations. Informative and
        generally compliant when outcome claims are handled
        carefully.
      </P>

      <H3>Team and practice introduction</H3>
      <P>
        Meeting the providers, touring the clinic, describing the
        patient experience. Brand-building with minimal compliance
        friction.
      </P>

      <H3>Behind-the-scenes and day-in-the-life</H3>
      <P>
        Humanizing content that doesn&rsquo;t make specific outcome
        claims. Generally low-risk unless patient content is
        included (HIPAA considerations).
      </P>

      <H3>Question-answering / Q&amp;A</H3>
      <P>
        Addressing common patient questions. Compliance-friendly as
        long as answers stay within appropriate scope and don&rsquo;t
        make specific outcome promises.
      </P>

      <H2 id="content-patterns-to-avoid">YouTube content patterns to avoid</H2>

      <H3>Condition-specific treatment claim videos</H3>
      <P>
        Videos titled &ldquo;How Our Treatment Cures [Condition]&rdquo;
        carry both FDA disease-claim exposure and YouTube medical
        misinformation policy risk.
      </P>

      <H3>Testimonial compilation videos</H3>
      <P>
        Multi-patient testimonial compilations without proper FTC
        framing and HIPAA authorization create compounded compliance
        risk.
      </P>

      <H3>Before/after transformation compilations</H3>
      <P>
        Similar to TikTok: dramatic before/after transformation
        content faces both FTC typical-experience rules and
        platform-specific content review.
      </P>

      <H3>Competitor disparagement content</H3>
      <P>
        Videos criticizing other providers&rsquo; treatment approaches
        or outcomes can create defamation exposure independent of
        advertising compliance.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Does YouTube monetization eligibility affect healthcare channels?</H3>
      <P>
        Yes. YouTube&rsquo;s Advertiser-Friendly Guidelines restrict
        monetization of certain healthcare content categories.
        Channel monetization and ad compliance are separate but
        related systems.
      </P>

      <H3>Can I use YouTube for patient education content?</H3>
      <P>
        Yes. Educational content is generally compliance-friendly
        and builds trust. The distinction is between genuinely
        educational content and educational-framed promotional
        content.
      </P>

      <H3>How should I handle patient testimonials in YouTube videos?</H3>
      <P>
        HIPAA-compliant authorization for the specific video use,
        typical-experience framing, material-connection disclosure
        if any incentive was provided, and avoidance of
        disease-specific outcome claims.
      </P>

      <H3>What about live-stream content?</H3>
      <P>
        Live content faces the same rules as recorded. Plus
        additional real-time HIPAA considerations if patients appear
        or are discussed without specific authorization.
      </P>

      <H3>Do physician YouTube creators need to disclose practice ownership?</H3>
      <P>
        Material connections to practices they own or have financial
        interest in should be clearly disclosed when discussing
        those practices. Many physicians do this through explicit
        channel framing rather than per-video disclosure.
      </P>

      <H3>How often does YouTube update its medical policies?</H3>
      <P>
        Multiple times per year. Major policy changes are announced
        in the YouTube Creator blog and Google Ads policy center.
        Subscribe to both for current information.
      </P>

      <KeyTakeaways
        items={[
          "YouTube advertising uses Google Ads policy plus YouTube-specific medical misinformation policy — both apply.",
          "Short-form ad formats challenge disclosure but don't remove requirements — use on-screen text + verbal + caption support.",
          "Channel content (non-ad) still falls under FDA/FTC marketing rules and HIPAA when promoting the practice.",
          "Creator and influencer partnerships need FTC-compliant disclosure in the video itself, not only in descriptions.",
          "Educational, practice-introduction, and Q&A content run reliably; condition-specific treatment claims and transformation compilations face the most scrutiny.",
        ]}
      />
    </>
  )
}
