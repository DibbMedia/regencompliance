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
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "telehealth-marketing-compliance-overview",
  title:
    "Telehealth Marketing Compliance: State Licensure, Prescribing Rules, and the Cross-Border Framework Every Telehealth Practice Needs",
  description:
    "Telehealth practices face state-by-state licensure rules, specific prescribing restrictions, controlled-substance considerations, and cross-border marketing compliance. Here's the framework for telehealth marketing.",
  excerpt:
    "Telehealth is one of the fastest-growing healthcare categories and one of the most regulatorily complex for marketing. Here's the full overview of the rules that apply across the category.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "telehealth marketing compliance",
    "telehealth state licensure marketing",
    "cross-state telehealth advertising",
    "Ryan Haight Act telehealth",
    "telehealth prescribing compliance",
  ],
  tags: ["Telehealth", "Foundational"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Foundational",
}

export default function Body() {
  return (
    <>
      <Lead>
        Telehealth has grown from a niche delivery mode to a
        dominant healthcare category in several specialties -
        mental health, weight loss, primary care, hormone therapy,
        dermatology. The marketing compliance framework for
        telehealth combines standard healthcare marketing rules with
        telehealth-specific considerations: state-by-state licensure,
        Ryan Haight Act prescribing rules, cross-border marketing
        rules, and specific state AG enforcement patterns. This post
        covers the framework.
      </Lead>

      <H2 id="state-licensure">State licensure and marketing</H2>
      <P>
        Telehealth practices must be licensed in the states where
        their patients are located. For marketing:
      </P>
      <UL>
        <LI>
          Marketing to patients in a state where the practice&rsquo;s
          providers aren&rsquo;t licensed is a consumer-protection
          issue and potentially a licensure violation.
        </LI>
        <LI>
          Marketing should accurately represent in which states
          services are available.
        </LI>
        <LI>
          &ldquo;Available nationwide&rdquo; marketing is misleading
          if the practice isn&rsquo;t licensed everywhere.
        </LI>
        <LI>
          State AGs have pursued telehealth practices for marketing
          to their state residents without appropriate licensure.
        </LI>
      </UL>

      <H2 id="ryan-haight">Ryan Haight Act and controlled substances</H2>
      <P>
        The Ryan Haight Online Pharmacy Consumer Protection Act
        restricts online prescribing of controlled substances.
        Telehealth controlled-substance prescribing has been in
        regulatory flux, with DEA issuing multiple guidance updates.
        Marketing considerations:
      </P>
      <UL>
        <LI>
          Telehealth prescribing of Schedule II-V controlled
          substances (including ADHD medications, benzodiazepines,
          buprenorphine for OUD, testosterone, ketamine) faces
          specific Ryan Haight considerations.
        </LI>
        <LI>
          Marketing that implies easy access to controlled
          substances through telehealth has drawn DEA and state
          board attention.
        </LI>
        <LI>
          Current DEA rules and flexibilities change; marketing
          should reflect current framework.
        </LI>
      </UL>

      <H2 id="common-problem-patterns">Common telehealth marketing patterns that draw enforcement</H2>

      <H3>Pattern 1: &ldquo;Skip the doctor visit&rdquo; framing</H3>
      <P>
        Marketing that minimizes the clinical evaluation step has
        drawn state medical board and state AG attention. Compliant
        marketing frames the telehealth visit as a legitimate
        medical encounter, not as an alternative to medical care.
      </P>

      <H3>Pattern 2: &ldquo;24-hour script&rdquo; speed marketing</H3>
      <P>
        Speed-of-prescription marketing has been specifically
        criticized for implying inadequate clinical evaluation.
        State medical boards have cited this language pattern in
        enforcement.
      </P>

      <H3>Pattern 3: Asynchronous vs synchronous misrepresentation</H3>
      <P>
        Asynchronous (store-and-forward) and synchronous (real-time
        video) telehealth have different regulatory status in
        different states. Marketing should accurately represent the
        actual service model.
      </P>

      <H3>Pattern 4: Licensure status implications</H3>
      <P>
        Marketing that implies broader licensure than actually held
        (e.g., &ldquo;our doctors can treat you anywhere&rdquo;
        when they&rsquo;re licensed in specific states) creates
        consumer-protection exposure.
      </P>

      <H3>Pattern 5: Specialty-implying language</H3>
      <P>
        Telehealth specialty marketing (&ldquo;our dermatologists,&rdquo;
        &ldquo;our psychiatrists&rdquo;) should accurately reflect
        actual specialist credentialing, not general practitioner
        services marketed under specialist framing.
      </P>

      <H2 id="state-specific-focus">State-specific enforcement focus</H2>
      <P>
        Several states have been particularly active on telehealth
        marketing:
      </P>
      <UL>
        <LI>
          <Strong>Texas.</Strong> Texas Medical Board on telehealth
          prescribing practices; Texas AG under DTPA.
        </LI>
        <LI>
          <Strong>California.</Strong> Medical Board of California
          on supervision and prescribing; AG under B&amp;P 17500.
        </LI>
        <LI>
          <Strong>New York.</Strong> OPMC on prescribing and
          corporate practice; AG under Executive Law 63(12).
        </LI>
        <LI>
          <Strong>Florida.</Strong> Florida Board of Medicine plus
          FDUTPA enforcement.
        </LI>
      </UL>

      <H2 id="category-specific">Category-specific telehealth marketing</H2>

      <H3>Mental health telehealth</H3>
      <P>
        See mental health practice marketing compliance post. Add
        telehealth-specific licensure, HIPAA sensitivity, and
        Ryan Haight considerations for psychiatric prescribing.
      </P>

      <H3>Weight loss / GLP-1 telehealth</H3>
      <P>
        See weight loss clinic marketing compliance post. Compounded
        GLP-1 marketing plus telehealth prescribing considerations
        stack.
      </P>

      <H3>Dermatology telehealth</H3>
      <P>
        See dermatology marketing compliance post. Add
        store-and-forward vs synchronous rules, state-specific
        teledermatology rules.
      </P>

      <H3>Hormone therapy telehealth</H3>
      <P>
        See hormone therapy marketing compliance post. Add
        Ryan Haight considerations for testosterone prescribing,
        state-specific rules on telehealth hormone prescribing.
      </P>

      <H3>Primary care telehealth</H3>
      <P>
        Standard primary care rules plus telehealth framework.
        Marketing should accurately represent the scope of services
        available through telehealth vs in-person.
      </P>

      <H2 id="compliant-framework">Compliant telehealth marketing framework</H2>
      <UL>
        <LI>
          <Strong>Accurate licensure representation.</Strong>
          Specific states where services are available, specific
          service limitations, specific provider credentialing.
        </LI>
        <LI>
          <Strong>Clinical evaluation emphasis.</Strong> Frame
          telehealth visits as legitimate medical encounters with
          appropriate evaluation, not as convenience shortcuts.
        </LI>
        <LI>
          <Strong>Clear service model description.</Strong>
          Synchronous vs asynchronous, what&rsquo;s included, what
          requires in-person referral.
        </LI>
        <LI>
          <Strong>Specific pricing disclosure.</Strong> What&rsquo;s
          included in quoted pricing, what&rsquo;s additional.
        </LI>
        <LI>
          <Strong>Conservative prescribing marketing.</Strong>
          Especially for controlled substances; avoid speed-focused
          framing.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I market telehealth services to patients in states where I'm not licensed?</H3>
      <P>
        Generally no. State AGs have pursued practices that
        marketed to state residents without appropriate licensure.
        Geographic targeting of marketing should match your
        licensure.
      </P>

      <H3>How do I handle multi-state telehealth practice marketing?</H3>
      <P>
        List specific states where services are available. If
        services vary by state (some services in some states, all
        in others), accurately represent that variation.
      </P>

      <H3>What are current Ryan Haight Act rules?</H3>
      <P>
        This is in active regulatory flux. DEA has issued multiple
        guidance updates. Current rules should be verified with
        healthcare regulatory counsel familiar with telehealth
        controlled-substance prescribing.
      </P>

      <H3>Are there specific rules on telehealth asynchronous care marketing?</H3>
      <P>
        Yes, varying by state. Some states require synchronous
        evaluation for prescribing; some allow asynchronous. Marketing
        should accurately reflect the allowed service model in each
        state served.
      </P>

      <H3>What about HIPAA considerations specific to telehealth?</H3>
      <P>
        Platform selection (HIPAA-compliant telehealth platforms),
        patient communication channels, and data security
        considerations all affect HIPAA posture. Marketing that
        makes security claims should reflect actual practices.
      </P>

      <H3>How do I stay current on telehealth rule changes?</H3>
      <P>
        Subscribe to state medical board updates, monitor DEA
        guidance, track state-specific telehealth rule changes.
        Healthcare regulatory counsel with telehealth expertise is
        essential for practices in this category.
      </P>

      <KeyTakeaways
        items={[
          "Telehealth marketing must reflect state-by-state licensure accurately - marketing to state residents where providers aren't licensed is an enforcement pattern.",
          "Ryan Haight Act restrictions on online controlled-substance prescribing are in active flux; marketing should reflect current rules.",
          "'Skip the doctor visit' and speed-focused framing has drawn specific state medical board enforcement.",
          "Telehealth marketing varies significantly by category - mental health, weight loss, hormone therapy, and dermatology each have specific considerations.",
          "Texas, California, New York, and Florida have been notably active on telehealth marketing enforcement.",
        ]}
      />
    </>
  )
}
