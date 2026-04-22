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
  slug: "state-medical-board-advertising-rules-overview",
  title:
    "State Medical Board Advertising Rules: The 50-State Overview Every Multi-State Practice Needs",
  description:
    "State medical boards layer specific physician advertising rules on top of federal FDA and FTC rules. Here's an overview of the patterns across states — supervision language, specialty claims, credentials, and the variations that matter.",
  excerpt:
    "Your FDA- and FTC-compliant ad can still violate state medical board rules. Here's the overview of state-level physician advertising regulations every multi-state or telehealth practice needs to understand.",
  date: "2026-04-22",
  readingMinutes: 10,
  keywords: [
    "state medical board advertising rules",
    "physician advertising rules by state",
    "medical board marketing compliance",
    "state physician marketing laws",
    "multi-state medical practice compliance",
  ],
  tags: ["State", "Foundational"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Foundational",
}

export default function Body() {
  return (
    <>
      <Lead>
        Federal FDA and FTC rules are nationwide. State medical board
        advertising rules are state-by-state &mdash; and they matter.
        An ad that clears FDA and FTC review can still violate a
        state medical board&rsquo;s physician advertising rules,
        which can result in license discipline independent of any
        federal action. For multi-state, telehealth, and multi-location
        practices, the state-level rules are a separate compliance
        surface that needs its own review.
      </Lead>

      <H2 id="what-medical-boards-regulate">What state medical boards regulate</H2>
      <P>
        State medical boards typically have authority over several
        categories of physician advertising:
      </P>

      <UL>
        <LI>
          <Strong>Deceptive advertising.</Strong> General prohibition
          on false or misleading physician advertising, typically
          echoing but sometimes stricter than FTC rules.
        </LI>
        <LI>
          <Strong>Specialty claims.</Strong> What specialties physicians
          can claim, typically tied to ABMS certification or
          equivalent.
        </LI>
        <LI>
          <Strong>Board certification.</Strong> How &ldquo;board-
          certified&rdquo; language can be used.
        </LI>
        <LI>
          <Strong>Supervision representations.</Strong> How physicians
          can describe supervision of non-physician providers.
        </LI>
        <LI>
          <Strong>Telemedicine advertising.</Strong> Rules specific to
          marketing telemedicine services across state lines.
        </LI>
        <LI>
          <Strong>Corporate practice of medicine.</Strong> What
          non-physician entities can advertise as providing medical
          services.
        </LI>
        <LI>
          <Strong>Testimonials and endorsements.</Strong> Some states
          have physician-specific testimonial rules beyond FTC.
        </LI>
      </UL>

      <H2 id="patterns-across-states">The patterns across states</H2>

      <H3>The strictest states</H3>
      <P>
        A few states are notably stricter on physician advertising
        than the national baseline:
      </P>
      <UL>
        <LI>
          <Strong>California.</Strong> Medical Board of California
          rules under 16 CCR &sect;1353.5 are detailed and actively
          enforced. California also has Business &amp; Professions
          Code &sect;17500 state false-advertising authority.
        </LI>
        <LI>
          <Strong>Texas.</Strong> Texas Medical Board rules under 22
          TAC &sect;164 plus DTPA private enforcement.
        </LI>
        <LI>
          <Strong>New York.</Strong> OPMC rules on physician conduct
          plus Executive Law &sect;63(12) AG authority.
        </LI>
        <LI>
          <Strong>Florida.</Strong> F.A.C. 64B8-11 plus active state
          AG attention under FDUTPA.
        </LI>
      </UL>

      <H3>Specialty-claim variations</H3>
      <P>
        States vary on what specialty terms physicians can use:
      </P>
      <UL>
        <LI>
          Some states require ABMS or AOA board certification for
          specialty-name usage.
        </LI>
        <LI>
          Some states allow specialty terms with disclosure of the
          specific certifying board.
        </LI>
        <LI>
          Some states (California, Texas, Florida) have specific
          rules on &ldquo;cosmetic surgeon&rdquo; or &ldquo;aesthetic
          surgeon&rdquo; claims by non-plastic-surgery-certified
          physicians.
        </LI>
      </UL>

      <H3>Supervision language variations</H3>
      <P>
        States differ on what supervision language is required when
        non-physicians (nurses, PAs, aestheticians) perform
        physician-supervised services:
      </P>
      <UL>
        <LI>
          Some require explicit supervision disclosure in marketing.
        </LI>
        <LI>
          Some allow general practice-level disclosure (&ldquo;under
          the supervision of our medical director&rdquo;) without
          per-ad disclosure.
        </LI>
        <LI>
          Some prohibit marketing language that implies independent
          practice where supervision is required.
        </LI>
      </UL>

      <H3>Telemedicine advertising rules</H3>
      <P>
        Telemedicine-specific advertising rules have grown
        significantly. Most states now have rules about:
      </P>
      <UL>
        <LI>
          State licensure of the prescribing provider.
        </LI>
        <LI>
          Marketing that minimizes the clinical evaluation step.
        </LI>
        <LI>
          Cross-border marketing to state residents by out-of-state
          providers.
        </LI>
        <LI>
          Specific controlled-substance telemedicine marketing
          restrictions.
        </LI>
      </UL>

      <H2 id="multi-state-compliance">Multi-state compliance strategy</H2>

      <H3>Know where you&rsquo;re marketing to</H3>
      <P>
        Identify the states where your marketing actually reaches
        prospective patients. For in-person practices, this is
        typically the practice&rsquo;s state plus contiguous states.
        For telehealth practices, this is potentially all 50 states
        depending on licensure and targeting.
      </P>

      <H3>Identify the strictest relevant state</H3>
      <P>
        Determine which state&rsquo;s rules are most restrictive for
        your specific marketing patterns. Typically meeting the
        strictest relevant state&rsquo;s rules covers your exposure
        across all states.
      </P>

      <H3>Build to the strictest standard</H3>
      <P>
        Write marketing copy, design landing pages, and structure
        testimonials to meet the strictest relevant state rules.
        This often costs less than creating state-specific variants.
      </P>

      <H3>Monitor state rule changes</H3>
      <P>
        State medical board rules update periodically. Subscribe to
        state medical society communications, track rule-making
        notices, and maintain awareness. Annual rule review is
        minimum; more frequent monitoring is better.
      </P>

      <H3>Consider state-specific legal counsel</H3>
      <P>
        For practices operating in several strict states, retain
        counsel licensed in those states. Multi-state healthcare
        regulatory counsel is an investment that pays for itself the
        first time a state-specific question arises.
      </P>

      <H2 id="state-specific-callouts">Specific state callouts worth knowing</H2>

      <H3>California supervision rules</H3>
      <P>
        California tightly regulates who can perform injectable and
        aesthetic treatments under what supervision. Marketing that
        implies nurse-injector independence has been a specific
        disciplinary pattern.
      </P>

      <H3>Texas DTPA exposure</H3>
      <P>
        Texas&rsquo;s Deceptive Trade Practices Act permits private
        plaintiffs to sue for treble damages. This creates a
        parallel enforcement vector beyond medical board action.
        Healthcare marketing that deceives consumers in Texas
        creates class-action exposure.
      </P>

      <H3>Florida Sherman Law</H3>
      <P>
        Florida&rsquo;s Sherman Food, Drug, and Cosmetic Law
        effectively extends FDA-style authority at state level. This
        creates parallel state exposure on patterns that also
        trigger federal FDA enforcement.
      </P>

      <H3>New York corporate practice</H3>
      <P>
        New York has unusually strict corporate-practice-of-medicine
        rules. Marketing by non-physician-owned entities (med spa
        corporate chains, telehealth platforms, franchise models)
        can trigger enforcement even when federally compliant.
      </P>

      <H3>Ohio CSPA</H3>
      <P>
        Ohio&rsquo;s Consumer Sales Practices Act provides broad AG
        authority and private class-action potential. Recent Ohio
        enforcement has focused on weight-loss clinic and
        compounded-medication marketing.
      </P>

      <H2 id="state-dental-boards">State dental and specialty board rules</H2>
      <P>
        Beyond state medical boards, state dental boards, state
        chiropractic boards, state podiatric boards, and others have
        their own advertising rules. Dental practices in particular
        face dental-board-specific specialty language rules
        (&ldquo;cosmetic dentist,&rdquo; &ldquo;implant dentist&rdquo;)
        separate from general healthcare advertising rules.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Does my state medical board enforce actively?</H3>
      <P>
        Varies. California, Texas, Florida, New York, Illinois, Ohio,
        and a few others have historically active enforcement.
        Others enforce primarily in response to specific complaints.
        Assume active enforcement; plan accordingly.
      </P>

      <H3>What triggers state medical board complaints?</H3>
      <P>
        Patient complaints, competitor complaints, state consumer-
        protection referrals, and proactive board reviews. Social
        media marketing is an increasingly common trigger because
        it&rsquo;s publicly visible and easy to screenshot for
        complaint submission.
      </P>

      <H3>How do state rules interact with federal rules?</H3>
      <P>
        Both apply independently. Federal FDA and FTC rules cover
        federal compliance; state rules add their own. The
        stricter standard in any given area is what applies.
      </P>

      <H3>Do I need separate compliance review for each state?</H3>
      <P>
        For multi-state practices, yes &mdash; either separate review
        per state or review against the strictest relevant standard.
        Telehealth practices specifically need to track state
        licensure and advertising rules across each state they
        market to.
      </P>

      <H3>What about &ldquo;reciprocity&rdquo; between state boards?</H3>
      <P>
        State medical boards don&rsquo;t have broad reciprocity on
        advertising rules. Each state applies its own rules
        independently. Being in good standing in one state doesn&rsquo;t
        shield against discipline in another.
      </P>

      <H3>Can a state medical board action affect federal licensure or status?</H3>
      <P>
        State medical board discipline is reported to the National
        Practitioner Data Bank and affects licensure in other states.
        It doesn&rsquo;t directly affect federal status but has broad
        collateral effects including insurance panel participation
        and hospital privileges.
      </P>

      <KeyTakeaways
        items={[
          "State medical boards layer advertising rules on top of federal FDA and FTC rules — both apply.",
          "California, Texas, Florida, New York are notably strict and actively enforce; other states vary.",
          "Supervision language, specialty claims, and 'board-certified' terminology are the most common state-board enforcement patterns.",
          "Multi-state and telehealth practices should build to the strictest relevant state standard rather than managing per-state variants.",
          "State medical board discipline affects licensure across states via NPDB reporting — state-level exposure carries broad professional consequences.",
        ]}
      />
    </>
  )
}
