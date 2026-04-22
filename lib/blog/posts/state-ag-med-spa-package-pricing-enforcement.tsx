import type { BlogPostMeta } from "@/lib/blog/types"
import {
  H2,
  H3,
  P,
  Lead,
  UL,
  LI,
  Strong,
  Em,
  BQ,
  Callout,
  KeyTakeaways,
  BeforeAfter,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "state-ag-med-spa-package-pricing-enforcement",
  title:
    "State AG Med Spa Package Pricing Enforcement: The Pattern Drawing Consumer Protection Cases",
  description:
    "State AGs have pursued med spas and aesthetic practices over package pricing marketing that misrepresents total treatment costs. Here's the specific pattern and how to structure package marketing compliantly.",
  excerpt:
    "Package pricing that doesn't reflect actual total cost has become a growing state AG focus. Here's the specific enforcement pattern and what med spa practices need to fix.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "med spa package pricing enforcement",
    "state AG med spa",
    "aesthetic package pricing compliance",
    "med spa bait pricing",
    "consumer protection med spa",
  ],
  tags: ["Case study", "Med spa", "State AG"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Case study",
}

export default function Body() {
  return (
    <>
      <Lead>
        State attorneys general have been increasingly active on
        med spa and aesthetic practice marketing, with package
        pricing disclosure emerging as a specific focus. Multiple
        state AGs have pursued consumer protection cases where
        advertised package pricing didn&rsquo;t reflect typical
        total treatment costs. This post covers the specific
        pattern and how to structure package marketing compliantly.
      </Lead>

      <H2 id="pattern">The enforcement pattern</H2>
      <P>
        The recurring pattern across state AG actions:
      </P>
      <UL>
        <LI>
          Med spa advertises specific package price
          (&ldquo;CoolSculpting package $999&rdquo;).
        </LI>
        <LI>
          Typical total treatment for meaningful outcomes
          substantially exceeds the advertised package price.
        </LI>
        <LI>
          Consumers purchase based on the advertised price and
          later discover actual total cost.
        </LI>
        <LI>
          Complaints accumulate; state AG investigates; consumer-
          protection action follows.
        </LI>
      </UL>

      <H2 id="specific-issues">Specific issues state AGs have cited</H2>

      <H3>Issue 1: Package excluded typical necessary add-ons</H3>
      <P>
        Package pricing that excludes items typically needed for
        the marketed outcome &mdash; anesthesia, follow-up
        appointments, touch-up treatments, product add-ons. If a
        meaningful percentage of patients require the excluded
        items, excluding them from advertised pricing creates
        deception exposure.
      </P>

      <H3>Issue 2: Single-area vs full-area pricing</H3>
      <P>
        CoolSculpting and similar treatments often require
        multiple cycles to treat one body area effectively. Package
        pricing based on single cycle while typical treatment is
        multi-cycle creates an actual-cost gap.
      </P>

      <H3>Issue 3: Introductory vs maintenance pricing</H3>
      <P>
        Introductory package pricing that doesn&rsquo;t disclose
        typical maintenance requirements creates expectations gap.
        Injectables, laser treatments, and body contouring often
        require maintenance; advertising the introductory package
        without that context is incomplete.
      </P>

      <H3>Issue 4: Number-of-treatments disclosure</H3>
      <P>
        &ldquo;Treatment package starting at $X&rdquo; where the
        starting number is for a minimal protocol but typical
        effective protocol requires more treatments.
      </P>

      <H3>Issue 5: Financing presentation</H3>
      <P>
        Presenting monthly financing payments prominently while
        de-emphasizing total cost. &ldquo;$99/month&rdquo; is not
        the same as $4,752 total. State AGs have cited this
        presentation.
      </P>

      <H2 id="compliant-framing">Compliant package pricing framing</H2>

      <H3>Clear total-cost disclosure</H3>
      <BeforeAfter
        bad="CoolSculpting package $999!"
        good="CoolSculpting cycle $999 per area per cycle. Typical full-outcome treatment for the [body area] involves [typical number of] cycles; your treatment plan and total cost is determined at consultation based on your individual case."
        reason="Single-cycle pricing without disclosing typical total-treatment context creates expectations gap. The compliant version preserves the entry-point pricing while setting realistic expectations."
      />

      <H3>Clear what's-included disclosure</H3>
      <BeforeAfter
        bad="Full Brazilian butt lift package $4,999"
        good="Brazilian butt lift package $4,999 includes surgeon fee, anesthesia, and facility fee for [specific procedure scope]. Additional costs may apply for [list typical add-ons]. Detailed pricing is discussed at consultation."
        reason="Package pricing should clearly identify what's included and what might be additional. Vague bundling creates exposure."
      />

      <H3>Financing transparency</H3>
      <BeforeAfter
        bad="Start for just $99/month!"
        good="Financing available through [partner]; 36-month payment plans start at $99/month for qualified applicants, with total cost of $4,752. Specific terms depend on your financing approval."
        reason="Monthly-payment marketing without total-cost disclosure has drawn specific state AG attention."
      />

      <H2 id="specialty-specifics">Specialty specifics</H2>

      <H3>CoolSculpting and body contouring</H3>
      <P>
        State AG actions have specifically addressed CoolSculpting
        package pricing practices. Multi-cycle reality, treated-
        area pricing, and typical-protocol disclosure have all
        been cited.
      </P>

      <H3>Injectable packages</H3>
      <P>
        Injectable package pricing (Botox units, filler syringes)
        has its own issues &mdash; per-unit pricing can be clear
        but doesn&rsquo;t always communicate what patients actually
        purchase. Package marketing (&ldquo;Botox package 40
        units&rdquo;) should reflect typical treatment needs.
      </P>

      <H3>Laser packages</H3>
      <P>
        Laser treatment packages (hair removal, IPL, fractional
        resurfacing) typically require multiple sessions for
        outcomes. Marketing based on single-session pricing without
        multi-session context creates similar issues.
      </P>

      <H3>Surgical package pricing</H3>
      <P>
        Aesthetic surgery package pricing has specific issues
        around surgeon fee vs total cost (anesthesia, facility,
        garments, follow-up). State AGs have pursued this pattern.
      </P>

      <H2 id="protection-practices">Practice-level protection</H2>
      <UL>
        <LI>
          <Strong>Disclose typical full-treatment protocol.</Strong>
          For services typically requiring multiple sessions or
          add-ons.
        </LI>
        <LI>
          <Strong>Include typical total cost context with
          entry-point pricing.</Strong> Both advertised price and
          what typical patients actually spend.
        </LI>
      <LI>
          <Strong>Clear breakdown of what package includes.</Strong>
          Surgeon, anesthesia, facility, follow-up, add-ons.
        </LI>
        <LI>
          <Strong>Financing presentation with total cost.</Strong>
          Monthly payment plus total cost, not just monthly.
        </LI>
        <LI>
          <Strong>Document disclosure practices.</Strong>
          Package pricing disclosures documented as part of
          marketing compliance records.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I advertise promotional pricing at all?</H3>
      <P>
        Yes &mdash; with appropriate context. &ldquo;Starting
        at&rdquo; pricing with disclosure of typical actual costs
        is different from bait pricing.
      </P>

      <H3>What about &ldquo;first treatment free&rdquo; promotions?</H3>
      <P>
        Free-first marketing needs clear disclosure of what the
        actual treatment plan looks like and what subsequent
        treatments cost. First-free marketing without that context
        creates expectations gap.
      </P>

      <H3>How should I handle package vs per-session pricing?</H3>
      <P>
        Disclose both. Per-session pricing lets patients understand
        unit cost; package pricing typically offers some discount
        and should clearly state the package scope.
      </P>

      <H3>Does state AG enforcement affect FTC exposure?</H3>
      <P>
        State and federal enforcement are independent. Patterns
        drawing state AG attention often draw FTC attention too.
      </P>

      <H3>What about subscription/membership pricing?</H3>
      <P>
        Subscription models need clear disclosure of
        auto-renewal, cancellation mechanics, and total cost
        over typical membership periods.
      </P>

      <H3>Are there state AGs particularly active on this?</H3>
      <P>
        California, Texas, Florida, New York, and several others
        have active consumer protection enforcement in this area.
        State-specific rules and enforcement priorities vary.
      </P>

      <KeyTakeaways
        items={[
          "State AG med spa enforcement increasingly focuses on package pricing that misrepresents total treatment costs.",
          "Single-cycle or single-session pricing without multi-session context creates consumer expectations gaps.",
          "Monthly financing payment marketing without total-cost disclosure has drawn specific enforcement.",
          "Typical add-ons (anesthesia, follow-up, maintenance) should be disclosed alongside package pricing.",
          "Clear breakdown of what's included and what might be additional preserves promotional marketing while avoiding enforcement exposure.",
        ]}
      />
    </>
  )
}
