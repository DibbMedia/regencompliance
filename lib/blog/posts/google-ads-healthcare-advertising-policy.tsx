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
  slug: "google-ads-healthcare-advertising-policy",
  title:
    "Google Ads for Healthcare Practices: Policy Certification, Restricted Categories, and What Actually Runs",
  description:
    "Google Ads has one of the strictest healthcare advertising policies of any major platform — including required certifications, restricted treatment categories, and specific claim prohibitions. Here's the full playbook for getting healthcare practice ads to run consistently.",
  excerpt:
    "Google Ads requires certifications for some healthcare categories, outright prohibits others, and enforces specific claim restrictions across all of them. Here's what the policy actually says and how to structure Google Ads campaigns that clear review and convert reliably.",
  date: "2026-04-22",
  readingMinutes: 10,
  keywords: [
    "Google Ads healthcare policy",
    "Google Ads medical advertising certification",
    "Google Ads weight loss policy",
    "Google Ads aesthetic practice",
    "Google LegitScript certification",
    "Google Ads healthcare compliance",
  ],
  tags: ["Platform", "Google", "Advertising"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Platform playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Google Ads has the most detailed healthcare advertising policy
        of any major platform. It includes required certifications for
        certain treatment categories, outright prohibitions for others,
        specific claim restrictions, and different rules for different
        countries. Running Google Ads for a healthcare practice
        successfully requires understanding which rules apply to your
        specialty, obtaining the relevant certifications, and
        structuring ad copy that meets both the platform policy and
        the underlying FDA/FTC rules. This post is the full playbook.
      </Lead>

      <P>
        Unlike Meta, which enforces policy primarily through ad-level
        review, Google Ads layers policy enforcement through both
        ad-level review and account-level certification requirements.
        Getting certified is a specific administrative step that most
        healthcare advertisers need to complete before their ads will
        run at all in certain categories.
      </P>

      <Callout variant="info" title="Google's policy structure">
        Google organizes healthcare advertising policy into several
        categories: prescription drugs, online pharmacies, addiction
        services, unproven treatments, and general healthcare
        advertising. Each has its own certification requirements and
        restriction levels. Your specialty determines which
        apply.
      </Callout>

      <H2 id="the-certification-landscape">The certification landscape</H2>

      <H3>LegitScript certification</H3>
      <P>
        Google requires LegitScript certification for advertisers in
        certain healthcare categories &mdash; most prominently
        addiction treatment services. LegitScript is a third-party
        certification provider that verifies healthcare advertisers
        meet specific standards. Certification takes weeks, requires
        documentation of licensure and clinical practices, and has an
        associated cost.
      </P>
      <P>
        For most general med spa, weight-loss, aesthetic, and
        regenerative-medicine practices, LegitScript is not required.
        For addiction treatment, dental (in some regions), and
        pharmacy services, it typically is.
      </P>

      <H3>Pharmacy certification</H3>
      <P>
        Online pharmacies must be certified (typically via NABP VIPPS
        or similar) to advertise on Google. Telehealth practices that
        include pharmacy-style dispensing models may need to determine
        whether this applies to their operation.
      </P>

      <H3>Google&rsquo;s healthcare provider certification</H3>
      <P>
        Google has rolled out certification requirements for certain
        healthcare provider categories in specific countries. Healthcare
        advertisers should check the Ads Policies center for current
        requirements in each country they advertise in.
      </P>

      <H2 id="prohibited-categories">Prohibited and restricted categories</H2>

      <H3>Unproven or experimental treatments</H3>
      <P>
        Google prohibits advertising for treatments the platform
        considers unproven or experimental. The enforcement is
        category-level: certain specific treatments (including some
        regenerative medicine and stem cell applications) have been
        the subject of specific Google policy enforcement. The
        restriction can be a total ad ban for the specific
        treatment.
      </P>

      <H3>Weight-loss products and services</H3>
      <P>
        Weight-loss advertising is heavily restricted. Certain claims
        (specific pounds-lost numbers, guaranteed results) and certain
        product categories (unapproved weight-loss supplements,
        certain compounded medications) face heightened restriction.
        Weight-loss ads that clear Google review tend to be
        service-forward rather than product/outcome-forward.
      </P>

      <H3>Prescription drug advertising</H3>
      <P>
        Direct-to-consumer prescription drug advertising is allowed in
        the US but with specific format requirements mirroring FDA
        rules. Google enforces these format requirements at the ad
        level &mdash; meaning fair balance, risk disclosure, and other
        elements are required in the ad copy itself.
      </P>

      <H3>Certain regenerative medicine claims</H3>
      <P>
        Google has enforcement patterns around stem cell and exosome
        marketing that mirror FDA enforcement. Specific claims
        regularly get ads disapproved even when the broader practice
        category is allowed.
      </P>

      <H2 id="allowed-with-restrictions">What&rsquo;s allowed with restrictions</H2>

      <H3>General medical practices and specialty clinics</H3>
      <P>
        Most medical practice advertising is allowed with standard
        restrictions: no misleading claims, no unsupported
        outcomes, no medical condition implications in targeting
        (similar to Meta, health-status-based targeting has been
        restricted on Google).
      </P>

      <H3>Aesthetic practice advertising</H3>
      <P>
        Med spas, aesthetic surgery, and cosmetic dermatology can
        advertise with the standard restrictions plus Google&rsquo;s
        specific rules on before/after imagery in some countries.
      </P>

      <H3>Dental practice advertising</H3>
      <P>
        Dental advertising is generally permitted with the standard
        restrictions. Some regions have additional requirements around
        specific dental claims and specialty representations.
      </P>

      <H3>Telehealth practice advertising</H3>
      <P>
        Telehealth advertising is allowed with state-licensure
        requirements and, for prescription-related services, additional
        pharmacy-category restrictions depending on the business model.
      </P>

      <H2 id="ad-copy-restrictions">Ad copy specifics</H2>

      <H3>Prohibited claim patterns</H3>
      <UL>
        <LI>
          <Strong>Misleading health claims.</Strong> Claims about curing
          diseases, reversing aging, or guaranteeing medical outcomes.
        </LI>
        <LI>
          <Strong>Unsubstantiated superlatives.</Strong>
          &ldquo;Best,&rdquo; &ldquo;top,&rdquo; &ldquo;most
          effective&rdquo; without substantiation.
        </LI>
        <LI>
          <Strong>Specific weight-loss numbers without substantiation.</Strong>
          &ldquo;Lose 30 pounds in 30 days&rdquo; types of claims.
        </LI>
        <LI>
          <Strong>Personal condition implications.</Strong> Ads
          implying the viewer has a specific health condition.
        </LI>
        <LI>
          <Strong>Comparative drug claims.</Strong> Side-by-side
          claims comparing prescription drugs.
        </LI>
      </UL>

      <H3>Ad formats and headlines</H3>
      <P>
        Google&rsquo;s responsive search ads (RSAs) allow multiple
        headlines and descriptions. Each headline is reviewed
        individually and can be disapproved without disapproving the
        entire ad. This means a single problematic headline across 10
        variations can reduce serving rates.
      </P>

      <H3>Display and YouTube</H3>
      <P>
        Display ads and YouTube ads add visual review. Imagery
        implying specific body transformations, unrealistic aesthetic
        outcomes, or medical procedures can be flagged for display
        placement restrictions.
      </P>

      <H2 id="landing-page-requirements">Landing page requirements</H2>
      <P>
        Google doesn&rsquo;t just review ads &mdash; it reviews the
        landing page the ad points to. Policy violations on the landing
        page can disqualify the ad. Common landing page issues:
      </P>

      <UL>
        <LI>
          <Strong>Missing disclosures.</Strong> Landing pages selling
          medical services need appropriate disclosures (licensure,
          disclaimer language, regulatory status of treatments).
        </LI>
        <LI>
          <Strong>Disease claims on landing pages.</Strong> Ads that
          clear review pointing to landing pages making disease claims
          get disqualified after landing page review.
        </LI>
        <LI>
          <Strong>Testimonials without typical-experience framing.</Strong>
          Google&rsquo;s landing page review frequently catches this.
        </LI>
        <LI>
          <Strong>Prescription drug information without fair balance.</Strong>
          For prescription-drug-related landing pages.
        </LI>
      </UL>

      <H2 id="patterns-that-run">Ad patterns that clear review reliably</H2>

      <H3>Practice-service ads</H3>
      <P>
        &ldquo;[Practice name] offers [general service category] in
        [location]. Schedule a consultation to discuss your goals.&rdquo;
        This format clears review consistently, converts well for
        practice-level search terms, and doesn&rsquo;t create
        policy-history issues.
      </P>

      <H3>Educational content ads</H3>
      <P>
        &ldquo;Learn about [topic] from a licensed provider&rdquo;
        leading to educational content that informs without promising.
        Useful for top-of-funnel and builds a retargeting pool.
      </P>

      <H3>Consultation-booking ads</H3>
      <P>
        &ldquo;Schedule your consultation&rdquo; as the primary CTA.
        Keeps specific outcome claims out of ad copy. Consultation
        itself is where specific outcome conversations happen.
      </P>

      <H3>Practice-differentiation ads</H3>
      <P>
        &ldquo;Board-certified providers,&rdquo; &ldquo;advanced
        training in [specialty],&rdquo; &ldquo;serving [location]
        since [year]&rdquo; &mdash; differentiation without specific
        outcome claims. Particularly effective for higher-ticket
        aesthetic and surgical services.
      </P>

      <H2 id="campaign-structure">Campaign structure recommendations</H2>

      <H3>Separate campaigns by policy risk</H3>
      <P>
        Higher-risk categories (weight loss, specific regen
        treatments) in one campaign; lower-risk services (general
        consultations, less-restricted treatments) in another. Keeps
        account history cleaner and makes it easier to identify
        policy issues.
      </P>

      <H3>Conservative keyword strategy initially</H3>
      <P>
        Build keyword lists conservatively. Bidding on
        disease-specific keywords (&ldquo;stem cell therapy for
        arthritis&rdquo;) is both expensive and a policy signal that
        Google may flag. Building from practice-service and
        location-based keywords and expanding from there is safer.
      </P>

      <H3>Negative keyword lists</H3>
      <P>
        Maintain negative keyword lists that exclude specific
        disease-treatment search combinations, specific competitor
        comparisons, and specific policy-risk search patterns. This
        prevents your ads from showing for searches where the
        conversation would push toward non-compliant claims.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Do I need LegitScript certification for my practice?</H3>
      <P>
        For most general healthcare practices (med spas, aesthetic,
        weight loss, regen, dental), no. It&rsquo;s primarily required
        for addiction-treatment services. Google&rsquo;s current
        policy pages are authoritative; always verify there rather
        than relying on secondary summaries.
      </P>

      <H3>What happens if my account is suspended?</H3>
      <P>
        Google account suspension can be category-specific (you
        can&rsquo;t advertise a specific product) or account-wide
        (you can&rsquo;t advertise at all from that account).
        Recovery depends on the violation and generally requires
        working through Google Support with documentation of
        corrections. Severe patterns can result in Merchant Center
        and AdSense restrictions beyond just Ads.
      </P>

      <H3>Can I run Google Shopping for medical products?</H3>
      <P>
        Depends on the product. Medical devices can be advertised with
        restrictions; prescription drugs generally cannot via Shopping;
        supplements have their own category rules. Practice-service
        advertising is primarily a Search campaign rather than
        Shopping context.
      </P>

      <H3>What about YouTube pre-roll for practice marketing?</H3>
      <P>
        Video ad policy mirrors general ad policy plus additional
        visual standards. Healthcare practice videos with
        testimonial-focused content, transformation imagery, or
        specific medical claims face the most scrutiny. Educational
        and practice-introduction videos generally clear more
        easily.
      </P>

      <H3>How often does Google policy change?</H3>
      <P>
        Google updates healthcare advertising policies multiple times
        per year. Material changes are published in the policy center
        with advance notice (typically 30 days). Smaller enforcement-
        practice shifts happen more frequently and may not be
        announced.
      </P>

      <H3>Is Bing/Microsoft Ads substantially similar?</H3>
      <P>
        Microsoft Ads healthcare policy is similar but not identical.
        It tends to be slightly less restrictive in some areas and
        enforces less aggressively. Some healthcare advertisers
        maintain Microsoft Ads as a secondary channel with slightly
        different creative approaches.
      </P>

      <KeyTakeaways
        items={[
          "Google Ads has the most detailed healthcare advertising policy of major platforms — including LegitScript certification for certain categories.",
          "Weight-loss, unproven treatments, and certain regenerative medicine categories face the strongest restrictions.",
          "Landing page review is part of ad review — ad-copy compliance is not enough if the landing page has violations.",
          "Practice-service and consultation-booking ad structures clear review reliably and convert well.",
          "Keep high-risk and low-risk service categories in separate campaigns to isolate account-history impact.",
        ]}
      />
    </>
  )
}
