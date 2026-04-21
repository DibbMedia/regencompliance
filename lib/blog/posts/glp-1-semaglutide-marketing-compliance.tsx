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
  Callout,
  BeforeAfter,
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "glp-1-semaglutide-marketing-compliance",
  title:
    "GLP-1 and Semaglutide Marketing: The Regulatory Minefield Every Weight Loss Clinic Needs to Navigate",
  description:
    "GLP-1 and semaglutide marketing is the fastest-growing FDA enforcement category in healthcare. Here's the stack of rules weight loss clinics face: drug identity, compounding rules, off-label indication, outcome claims, and before/after photo compliance.",
  excerpt:
    "GLP-1 and semaglutide marketing sits on top of the most regulated substance category in healthcare advertising. Weight loss clinics face a 5-layer compliance stack: drug identity, compounding, off-label use, outcome claims, and before/after photos. This post walks through each.",
  date: "2026-04-21",
  readingMinutes: 11,
  keywords: [
    "GLP-1 marketing compliance",
    "semaglutide advertising FDA",
    "weight loss clinic marketing",
    "tirzepatide marketing rules",
    "compounded semaglutide advertising",
    "GLP-1 FTC enforcement",
  ],
  tags: ["GLP-1", "Weight loss", "Compounding", "Specialty"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Weight loss specialty",
}

export default function Body() {
  return (
    <>
      <Lead>
        No healthcare specialty has seen a faster increase in FDA and FTC
        enforcement over the last 18 months than weight loss clinics marketing
        GLP-1 receptor agonists &mdash; semaglutide, tirzepatide, liraglutide,
        and their compounded variants. The regulatory environment around GLP-1
        is the most complex in healthcare advertising today because it
        overlays five distinct issues at once.
      </Lead>

      <P>
        This post walks through that five-layer stack: drug identity,
        compounding rules, off-label use, outcome claims, and before/after
        photo compliance. If you run a weight loss or metabolic clinic
        marketing GLP-1 products, each layer has to be addressed separately.
      </P>

      <Callout variant="warn" title="Why this specialty is a regulator magnet">
        GLP-1 marketing combines three aggravating factors for regulators at
        once: (1) very high consumer demand driving aggressive marketing
        behavior across clinics; (2) branded drug identity confusion between
        approved products and compounded versions; (3) an outcome (weight
        loss) that is both a health goal and a commercial claim, with clearly
        substantiable and clearly unsubstantiable versions sitting side-by-
        side in the same marketing copy. The FDA and FTC are both active.
      </Callout>

      <H2 id="layer-1-drug-identity">Layer 1: Drug identity and name use</H2>
      <P>
        Novo Nordisk markets semaglutide under three brand names: Ozempic
        (type 2 diabetes), Wegovy (chronic weight management), and Rybelsus
        (oral type 2 diabetes). Eli Lilly&rsquo;s tirzepatide is branded
        Mounjaro (diabetes) and Zepbound (weight management). Using the
        branded name in your clinic&rsquo;s marketing triggers trademark and
        regulatory issues.
      </P>

      <H3>The rules at a glance</H3>
      <UL>
        <LI>
          <Strong>Never market a branded drug you don&rsquo;t dispense.</Strong>{" "}
          Using &ldquo;Ozempic&rdquo; in your copy implies you&rsquo;re
          providing Ozempic.
        </LI>
        <LI>
          <Strong>Never imply a compounded product is the branded product.</Strong>{" "}
          Semaglutide compounded at a 503A or 503B pharmacy is NOT Ozempic. FDA
          treats conflating the two as a misbranding issue.
        </LI>
        <LI>
          <Strong>Use the generic molecule name when describing compounded
          products.</Strong> &ldquo;Compounded semaglutide&rdquo; is factually
          accurate and doesn&rsquo;t step on trademark.
        </LI>
      </UL>

      <BeforeAfter
        bad="Affordable Ozempic weight loss — $299/mo."
        good="Medically supervised semaglutide weight loss program, using compounded semaglutide prepared by a state-licensed compounding pharmacy. This is not FDA-approved Ozempic or Wegovy."
        reason="Brand-name confusion is a federal issue on two tracks (FDA misbranding + Lanham Act trademark). The compliant version is explicit about the compounded status and the non-FDA-approved nature of the program."
      />

      <H2 id="layer-2-compounding">Layer 2: Compounding rules</H2>
      <P>
        The FDA allows compounded versions of drugs under specific
        circumstances (503A for patient-specific prescriptions; 503B for
        outsourcing facilities). Compounded semaglutide marketing has its own
        set of FDA concerns:
      </P>
      <UL>
        <LI>
          <Strong>Drug-shortage status:</Strong> Compounding of a drug on the
          FDA shortage list is permitted under specific rules; outside the
          shortage list, there are stricter constraints.
        </LI>
        <LI>
          <Strong>Marketing to the general public:</Strong> 503A compounding
          is patient-specific and based on an individual prescription.
          Marketing &ldquo;come get semaglutide&rdquo; to the public blurs
          this line and is an FDA enforcement target.
        </LI>
        <LI>
          <Strong>Product composition:</Strong> Compounded products may
          include additives (B12, B-complex, etc.) that are NOT present in the
          branded drug. Marketing these as &ldquo;the same as Ozempic, plus
          extras&rdquo; is false equivalence.
        </LI>
      </UL>

      <BeforeAfter
        bad="Our exclusive semaglutide+B12 formula — more effective than Ozempic."
        good="A semaglutide formulation compounded to your individual prescription. Some programs include additional vitamin B12; this is an additive, not an FDA-evaluated enhancement to efficacy."
        reason="Never claim a compounded variant is &ldquo;more effective&rdquo; than the branded drug without head-to-head substantiation (which does not exist). Disclose additives as additives, not as efficacy enhancers."
      />

      <H2 id="layer-3-off-label">Layer 3: Off-label indication use</H2>
      <P>
        Semaglutide is FDA-approved for type 2 diabetes (Ozempic) and chronic
        weight management in patients meeting specific BMI criteria (Wegovy).
        Marketing semaglutide for weight loss in patients who don&rsquo;t meet
        the Wegovy criteria is off-label use.
      </P>
      <P>
        Off-label prescribing is legal for licensed physicians. Off-label{" "}
        <Em>marketing</Em> has significantly tighter rules. A clinic
        marketing semaglutide for weight loss without specifying the
        indication criteria is effectively promoting an unapproved use to the
        general public.
      </P>

      <BeforeAfter
        bad="Semaglutide weight loss program — lose 15% of your body weight in 6 months."
        good="Medically supervised GLP-1-based weight loss program. A physician consultation will determine whether GLP-1 therapy is appropriate based on your BMI, medical history, and weight loss goals. FDA-approved indications for weight management apply to specific patient populations."
        reason="Don't publish outcome-specific weight-loss claims to the general public. Route the clinical decision to the physician consultation and flag that FDA-approved indications are population-specific."
      />

      <H2 id="layer-4-outcome-claims">Layer 4: Outcome claims</H2>
      <P>
        The weight loss industry has decades of FTC enforcement history
        around specific language. The agency has settled multiple cases
        against weight loss marketers for unsubstantiated claims including:
      </P>
      <UL>
        <LI>Specific-pound or specific-percentage claims without substantiation.</LI>
        <LI>Before-and-after photo galleries implying typical outcomes.</LI>
        <LI>Testimonial-based outcome claims without typicality disclosure.</LI>
        <LI>&ldquo;Guaranteed&rdquo; weight loss language.</LI>
        <LI>Comparative claims (&ldquo;better than diet and exercise&rdquo;).</LI>
      </UL>
      <P>
        The FTC doesn&rsquo;t care that GLP-1 drugs <Em>do</Em> produce weight
        loss in clinical trials. The enforcement theory is about how the
        claim is presented in marketing &mdash; whether it&rsquo;s
        substantiated for this specific product, this specific population,
        and this specific clinical context.
      </P>

      <BeforeAfter
        bad="Lose up to 30 lbs in 3 months, guaranteed."
        good="Weight loss outcomes on GLP-1 therapy vary significantly by patient. In clinical trials of FDA-approved semaglutide for chronic weight management, the average weight loss was approximately 15% of body weight over 68 weeks in patients meeting specific criteria. Your results will depend on your starting point, adherence, and medical history."
        reason="Replace the outcome guarantee with honest clinical-trial-based language, specifying the population and timeframe. Long, specific, factual &mdash; and defensible."
      />

      <H2 id="layer-5-before-after">Layer 5: Before-and-after photos</H2>
      <P>
        Before-and-after weight loss photos are the most regulated visual
        format in healthcare marketing. The FTC Endorsement Guides govern
        this entire category. See{" "}
        <Link
          href="/blog/before-after-photos-compliance"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          the before-and-after photos deep dive
        </Link>{" "}
        for the full protocol. For GLP-1 specifically:
      </P>
      <UL>
        <LI>
          <Strong>Typical-experience disclosure required</Strong> on every
          photo presented as representative.
        </LI>
        <LI>
          <Strong>Time frame must be disclosed.</Strong> &ldquo;Results in 90
          days&rdquo; requires that both photos were taken 90 days apart.
        </LI>
        <LI>
          <Strong>Patient consent documentation</Strong> must be retained.
        </LI>
        <LI>
          <Strong>Diet-and-exercise qualifier:</Strong> GLP-1 trial results
          assumed adherence to diet and exercise guidelines. Photos without
          that disclosure overclaim the drug&rsquo;s solo contribution.
        </LI>
      </UL>

      <H2 id="social-media-specifics">
        Social media and platform policy specifics
      </H2>
      <P>
        Meta, TikTok, and Google have all tightened their healthcare ad
        policies specifically around GLP-1 marketing in 2024&ndash;2025.
        Platform-level rejection happens before any regulator notices, but
        platform violations are often the evidence a regulator uses to build
        a case.
      </P>
      <UL>
        <LI>
          <Strong>Meta / Instagram:</Strong> Weight loss claims with specific
          numerical outcomes are typically rejected. Testimonials with
          dramatic transformations often trigger policy review.
        </LI>
        <LI>
          <Strong>TikTok:</Strong> Healthcare products including GLP-1 are on
          a restricted category list. Brand-name drug references in organic
          content (not just ads) have triggered video removal.
        </LI>
        <LI>
          <Strong>Google Ads:</Strong> Prescription drug advertising is
          heavily restricted and typically requires certification (LegitScript
          for pharmacy-related advertising). Weight loss claims face
          additional scrutiny.
        </LI>
      </UL>

      <H2 id="what-a-compliant-glp1-program-looks-like">
        What a compliant GLP-1 program page looks like
      </H2>
      <OL>
        <LI>
          <Strong>Landing hero:</Strong> &ldquo;Medically supervised weight
          loss program featuring GLP-1 therapy.&rdquo; No brand names, no
          outcome numbers, no guarantees.
        </LI>
        <LI>
          <Strong>Program description:</Strong> Consultation process, BMI/
          medical-history screening, prescription basis, follow-up cadence.
        </LI>
        <LI>
          <Strong>What GLP-1 is:</Strong> Educational content on the drug
          class. Disclose clearly if you use compounded semaglutide.
        </LI>
        <LI>
          <Strong>Who it&rsquo;s for:</Strong> &ldquo;A physician consultation
          determines whether GLP-1 therapy is appropriate for you.&rdquo; Not
          &ldquo;suitable for anyone who wants to lose weight.&rdquo;
        </LI>
        <LI>
          <Strong>Expected outcomes section:</Strong> Cite clinical-trial
          ranges with population and timeframe qualifiers. Individual-
          variation disclosure prominent.
        </LI>
        <LI>
          <Strong>Risks:</Strong> Standard side-effect profile. Honest risk
          disclosure is both legally protective and trust-building.
        </LI>
        <LI>
          <Strong>Testimonials (if any):</Strong> Subjective-experience
          language, typical-experience disclosure, substantiation file.
        </LI>
        <LI>
          <Strong>Pricing:</Strong> Disclose compounded vs branded. Don&rsquo;t
          position compounded as a &ldquo;deal&rdquo; on the branded drug.
        </LI>
      </OL>

      <Callout variant="success" title="GLP-1 rules are in the scanner">
        <span>
          RegenCompliance includes GLP-1-specific rules covering brand-name
          misuse, compounded-product claims, off-label language, outcome-
          guarantee triggers, and typical-experience disclosure failures on
          weight-loss testimonials. Pre-publish scanning catches these before
          they&rsquo;re platform-rejected or regulator-reviewed.{" "}
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
          "GLP-1 marketing is the fastest-growing FDA enforcement category; five distinct regulatory layers apply simultaneously.",
          "Never use brand names (Ozempic, Wegovy, Mounjaro, Zepbound) in marketing for products you don't dispense, or to describe compounded versions.",
          "Compounded semaglutide is not FDA-approved semaglutide. Market the two separately, with explicit disclosure.",
          "Off-label marketing to the general public is tightly restricted even when off-label prescribing is legal. Route clinical decisions to the physician consultation.",
          "Before-and-after weight loss photos require time-frame disclosure, typical-experience disclosure, consent documentation, and diet/exercise qualifier.",
        ]}
      />
    </>
  )
}
