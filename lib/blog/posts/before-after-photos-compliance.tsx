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
  BeforeAfter,
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "before-after-photos-compliance",
  title:
    "Before-and-After Photos: The FDA, FTC, HIPAA, and Platform Rules Nobody Talks About",
  description:
    "Before-and-after photos are the most regulated visual in healthcare marketing. Four overlapping regimes govern them: FTC Endorsement Guides, FDA, HIPAA consent, and platform ad policies. Here's the complete protocol.",
  excerpt:
    "Before-and-after photos are the most regulated visual in healthcare marketing &mdash; four overlapping regimes govern them simultaneously (FTC Endorsement Guides, FDA intent-of-use, HIPAA consent, platform ad policies). This is the complete compliant-photo protocol.",
  date: "2026-04-21",
  readingMinutes: 10,
  keywords: [
    "before after photos compliance",
    "med spa before after FTC",
    "aesthetic photo rules",
    "weight loss photo FTC",
    "healthcare before after HIPAA",
    "typical results disclosure",
  ],
  tags: ["Before/after", "FTC enforcement", "HIPAA", "Evergreen"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Photo compliance",
}

export default function Body() {
  return (
    <>
      <Lead>
        Before-and-after photos convert. They also draw more FTC attention
        than any other visual format in healthcare marketing. Four separate
        regulatory regimes touch every before-and-after photo at once &mdash;
        the FTC Endorsement Guides, FDA intent-of-use rules, HIPAA consent
        requirements, and the healthcare-specific policies of Meta, Google,
        and TikTok. Most clinics comply with zero of them.
      </Lead>

      <P>
        This post is the operator&rsquo;s manual: the four regimes, the
        specific mechanics of each, what a compliant photo package looks
        like, and the exact disclosures that go on every image.
      </P>

      <Callout variant="warn" title="Why this is more complex than you think">
        A single before-and-after photo is simultaneously: (1) a commercial
        advertising claim (FTC); (2) an implied efficacy claim about your
        procedure (FDA); (3) a use of protected patient information (HIPAA);
        and (4) subject to platform-specific healthcare ad rules that are
        stricter than federal law. The four don&rsquo;t align perfectly, so
        compliance requires satisfying the strictest element of each.
      </Callout>

      <H2 id="regime-1-ftc">
        Regime 1 &mdash; FTC Endorsement Guides
      </H2>
      <P>
        The FTC&rsquo;s Endorsement Guides (16 CFR Part 255) are the
        operative rules for any testimonial, case study, or outcome
        presentation in advertising. Before-and-after photos fall squarely
        under this framework.
      </P>
      <H3>Core requirement: typical-experience disclosure</H3>
      <P>
        If your photo depicts an outcome presented as typical of your
        patients, you must have substantiation that it <Em>is</Em> typical.
        If the outcome is atypical (which cherry-picked before-and-afters
        almost always are), you must include a clear-and-conspicuous
        disclosure of what the typical result actually is.
      </P>
      <BeforeAfter
        bad={`(photo gallery header) "See our amazing results"`}
        good={`(photo gallery header) "Patient results. Individual outcomes vary. Typical weight loss in our GLP-1 program is 10-15% of body weight over 6 months; featured outcomes are higher than typical."`}
        reason="Add a header disclosure on every gallery that establishes typical-result expectations. Individual-photo captions then don't have to repeat the whole disclosure."
      />
      <H3>&ldquo;Clear and conspicuous&rdquo; standard</H3>
      <P>
        The FTC has been specific: &ldquo;clear and conspicuous&rdquo; is
        actually readable on all devices, not tucked in a footer, not in
        low-contrast grey-on-grey type, and not hidden behind a click-to-
        expand. If a reasonable consumer has to hunt for the disclosure,
        it&rsquo;s not clear and conspicuous.
      </P>
      <H3>Material connection disclosure</H3>
      <P>
        If the patient received compensation (cash, discount, free
        treatment) for the photo or testimonial, you must disclose the
        material connection. &ldquo;Featured patient received this treatment
        at no charge in exchange for consenting to marketing use.&rdquo;
      </P>

      <H2 id="regime-2-fda">Regime 2 &mdash; FDA intent-of-use</H2>
      <P>
        The FDA doesn&rsquo;t regulate the photo itself, but it does
        regulate what the photo implies about your procedure. A photo
        paired with a named disease or condition is equivalent to claiming
        your procedure treats that condition.
      </P>
      <P>
        This matters particularly for:
      </P>
      <UL>
        <LI>
          <Strong>Acne, rosacea, melasma, hyperpigmentation photos:</Strong>{" "}
          these are medical conditions. Paired with your aesthetic
          procedure, you&rsquo;re making a disease-treatment claim.
        </LI>
        <LI>
          <Strong>Scar-reduction photos:</Strong> depending on scar type,
          these can cross into medical-condition territory.
        </LI>
        <LI>
          <Strong>Alopecia / hair-loss photos:</Strong> alopecia is a
          medical condition; clinic-level hair-loss treatments rarely have
          FDA approval for the indication.
        </LI>
        <LI>
          <Strong>Hyperhidrosis (excessive sweating) photos:</Strong>{" "}
          medical condition with FDA-approved indications for specific
          products only.
        </LI>
      </UL>
      <P>
        Solution: reframe the caption from condition language to
        appearance language. &ldquo;Acne scar removal&rdquo; → &ldquo;improved
        skin texture.&rdquo; &ldquo;Rosacea treatment&rdquo; → &ldquo;reduced
        appearance of redness.&rdquo;
      </P>

      <H2 id="regime-3-hipaa">Regime 3 &mdash; HIPAA and patient consent</H2>
      <P>
        The patient&rsquo;s image is Protected Health Information. Even if
        the face is cropped or blurred, any identifiable feature (a
        distinctive tattoo, a recognizable setting, a shared context on
        social media) can be enough to re-identify the patient. A signed
        HIPAA authorization is required before any clinical image can be
        used for marketing.
      </P>
      <H3>Required elements of the authorization</H3>
      <UL>
        <LI>
          Specific description of what will be used (which photos, in what
          context).
        </LI>
        <LI>
          Who will receive the information (clinic, marketing vendor, social
          platforms, the public).
        </LI>
        <LI>
          Purpose of use (marketing).
        </LI>
        <LI>
          Expiration date or event (e.g., &ldquo;until revoked by patient&rdquo;).
        </LI>
        <LI>
          Patient right to revoke, and how.
        </LI>
        <LI>
          Statement that treatment is not conditioned on signing.
        </LI>
      </UL>
      <P>
        Retain the signed authorization. When the patient revokes (and some
        will), you need to remove the image from all marketing surfaces
        within a reasonable time frame. This includes any cached or archived
        copies you control.
      </P>

      <H2 id="regime-4-platforms">Regime 4 &mdash; Platform ad policies</H2>
      <P>
        Meta (Instagram/Facebook), TikTok, and Google each have their own
        before-and-after photo rules that operate independently of federal
        law. Platform rejection typically happens before a regulator notices
        a violation, but platform violations are often what regulators cite
        as evidence when they do.
      </P>
      <H3>Meta / Instagram</H3>
      <UL>
        <LI>
          Before-and-after photos are explicitly prohibited for certain
          body-contouring, weight loss, and cosmetic categories when used in
          paid ads.
        </LI>
        <LI>
          Organic content has more latitude but still triggers review when
          posts go viral.
        </LI>
        <LI>
          Implying a negative self-image is against policy (&ldquo;before&rdquo;
          images that are framed as undesirable are increasingly rejected).
        </LI>
      </UL>
      <H3>Google Ads</H3>
      <UL>
        <LI>
          Before-and-after photos for most aesthetic procedures require
          additional review and are often restricted.
        </LI>
        <LI>
          Medical claim policies apply regardless of whether the photo is
          labeled as a testimonial.
        </LI>
      </UL>
      <H3>TikTok</H3>
      <UL>
        <LI>
          Healthcare advertising is on a restricted category list.
        </LI>
        <LI>
          Weight loss transformations and body modification content face the
          strictest review.
        </LI>
      </UL>

      <H2 id="production-standards">
        Production standards for the photos themselves
      </H2>
      <P>
        Beyond disclosures and consent, the photos have to be taken
        honestly. The FTC has pursued cases on photo-production grounds
        even when disclosure was adequate.
      </P>
      <UL>
        <LI>
          <Strong>Same lighting in both photos.</Strong> Warm vs cool light
          changes skin appearance dramatically.
        </LI>
        <LI>
          <Strong>Same angle, pose, framing.</Strong> Different angles
          dramatize the contrast in ways not attributable to the treatment.
        </LI>
        <LI>
          <Strong>No digital retouching beyond what&rsquo;s disclosed.</Strong>{" "}
          Healing redness can be airbrushed with disclosure; fundamental
          facial geometry cannot.
        </LI>
        <LI>
          <Strong>Disclose the time elapsed.</Strong> Three weeks vs three
          years is a different claim.
        </LI>
        <LI>
          <Strong>Disclose any concurrent treatments.</Strong> Weight loss
          with diet + exercise is a different outcome than weight loss from
          the drug alone.
        </LI>
      </UL>

      <BQ>
        A photo that depends on misleading lighting or angle to look
        impressive is an FTC claim your treatment can&rsquo;t actually
        support. The fix isn&rsquo;t better lighting &mdash; it&rsquo;s
        different patient selection.
      </BQ>

      <H2 id="the-compliant-caption-template">
        The compliant caption template
      </H2>
      <P>
        Every featured before-and-after image should include, at minimum:
      </P>
      <OL>
        <LI>
          <Strong>Procedure described in appearance terms</strong> (not
          condition terms).
        </LI>
        <LI>
          <Strong>Time elapsed</strong> between the two photos.
        </LI>
        <LI>
          <Strong>Concurrent treatments</strong> (diet, exercise, adjunct
          therapies).
        </LI>
        <LI>
          <Strong>Individual results vary</strong> disclaimer.
        </LI>
        <LI>
          <Strong>Typical experience disclosure</strong> (either per-photo or
          per-gallery header).
        </LI>
        <LI>
          <Strong>Material connection disclosure</strong> if the patient
          received compensation.
        </LI>
      </OL>
      <P>
        Example: &ldquo;Patient age 42. 4 months of medically supervised
        semaglutide program plus dietary consultation. Patient consented to
        marketing use. Individual results vary; this outcome is above our
        typical range of 10&ndash;15% body-weight loss at 6 months. Photo
        taken in identical lighting and pose.&rdquo;
      </P>

      <H2 id="what-to-do-this-week">
        What to do this week
      </H2>
      <OL>
        <LI>
          <Strong>Audit every before-and-after photo live on your site,
          socials, and ads.</Strong> Flag any without typical-experience
          disclosure, time-frame disclosure, or concurrent-treatment
          disclosure.
        </LI>
        <LI>
          <Strong>Verify signed HIPAA authorization for each.</Strong> If
          you don&rsquo;t have it, take the photo down immediately.
        </LI>
        <LI>
          <Strong>Replace condition-language captions</strong> (acne,
          rosacea, alopecia) with appearance-language captions (skin
          texture, redness, hair density).
        </LI>
        <LI>
          <Strong>Add a gallery-header disclosure</strong> if your gallery
          pages don&rsquo;t have one.
        </LI>
        <LI>
          <Strong>Update your testimonial-solicitation workflow</strong> to
          capture consent, concurrent treatments, and time elapsed at the
          same moment you capture the photo. See{" "}
          <Link
            href="/blog/healthcare-testimonial-compliance"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            the testimonial compliance guide
          </Link>
          .
        </LI>
      </OL>

      <Callout variant="success" title="Gallery scanning in the tool">
        <span>
          RegenCompliance flags captions missing typical-experience disclosure,
          condition-language paired with aesthetic procedures, and
          comparative language that cannot be substantiated. Gallery pages
          scan end-to-end against the full FTC/FDA/HIPAA ruleset.{" "}
          <Link
            href="/demo"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            Scan a gallery page
          </Link>
          .
        </span>
      </Callout>

      <KeyTakeaways
        items={[
          "Four regimes govern every before-and-after photo: FTC Endorsement Guides, FDA intent-of-use, HIPAA consent, and platform ad policies.",
          "Typical-experience disclosure is required when the featured outcome is atypical &mdash; which most cherry-picked before-and-afters are.",
          "Pair photos with appearance language (texture, volume, redness), not condition language (acne, rosacea, alopecia).",
          "Signed HIPAA authorization is required for every clinical photo used in marketing; retain the file and honor revocations.",
          "Production standards matter: same lighting, angle, pose, and disclosed time frame. Misleading production is a direct FTC target.",
        ]}
      />
    </>
  )
}
