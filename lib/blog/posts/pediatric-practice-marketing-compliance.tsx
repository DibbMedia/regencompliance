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
  slug: "pediatric-practice-marketing-compliance",
  title:
    "Pediatric Practice Marketing Compliance: Advertising to Parents, FTC Rules for Children-Focused Content, and COPPA Considerations",
  description:
    "Pediatric practice marketing is advertising to parents about services for their children. FTC rules on marketing affecting children, COPPA considerations for online content, and specific vaccination-related claim rules all apply.",
  excerpt:
    "Pediatric marketing combines advertising-to-parents considerations with specific rules around children-focused content and COPPA. Here's the framework for pediatric practices, dental, orthodontic, and subspecialty pediatric services.",
  date: "2026-04-22",
  readingMinutes: 7,
  keywords: [
    "pediatric practice marketing compliance",
    "pediatric dental advertising rules",
    "COPPA healthcare marketing",
    "children healthcare marketing FTC",
    "pediatric marketing ethics",
  ],
  tags: ["Pediatric", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Pediatric practice marketing is fundamentally marketing to
        parents about services for their children. This creates
        specific considerations: FTC heightened scrutiny on marketing
        affecting children, COPPA rules for online content targeting
        children, specific vaccination-related claim rules, and
        sensitivity considerations in imagery and testimonial
        practices. This post covers pediatric practice, pediatric
        dental, and pediatric subspecialty marketing.
      </Lead>

      <H2 id="ftc-considerations">FTC considerations for pediatric-adjacent marketing</H2>
      <P>
        The FTC applies heightened scrutiny to marketing that
        affects children or their parents. For pediatric practices,
        this generally means:
      </P>
      <UL>
        <LI>
          Marketing targeting parents about services for children
          is standard healthcare marketing under general FTC rules.
        </LI>
        <LI>
          Content directly targeting children is separate -
          with more restrictive rules.
        </LI>
        <LI>
          Outcome claims about children&rsquo;s health should be
          particularly well-substantiated.
        </LI>
        <LI>
          Scare-based marketing (&ldquo;your child could be at
          risk&rdquo;) faces heightened scrutiny.
        </LI>
      </UL>

      <H2 id="coppa-considerations">COPPA considerations</H2>
      <P>
        The Children&rsquo;s Online Privacy Protection Act (COPPA)
        applies to online services directed at children under 13.
        For pediatric practices, COPPA considerations typically
        arise around:
      </P>
      <UL>
        <LI>
          Patient portal access for minors.
        </LI>
        <LI>
          Online games or interactive content on practice websites
          targeted at children.
        </LI>
        <LI>
          Social media accounts directed at children.
        </LI>
        <LI>
          Data collection from children (quizzes, forms, promotional
          interactions).
        </LI>
      </UL>
      <P>
        Most practice websites are directed at parents rather than
        children, which affects COPPA applicability. But
        practice-operated content that children directly interact
        with triggers COPPA considerations.
      </P>

      <H2 id="claim-patterns">Pediatric-specific claim patterns</H2>

      <H3>Pattern 1: Vaccination-related claims</H3>
      <P>
        Vaccination-related marketing has specific considerations.
        Practices taking positions on vaccine timing, alternative
        schedules, or vaccine skepticism face both FTC substantiation
        concerns and state medical board scope-of-practice issues.
        Compliant vaccination marketing follows ACIP-aligned guidance
        or clearly represents the practice&rsquo;s evidence-based
        approach.
      </P>

      <H3>Pattern 2: Alternative therapies for pediatric conditions</H3>
      <P>
        Alternative therapy marketing for pediatric conditions
        (autism, ADHD, allergies, chronic ear infections) has drawn
        specific FTC attention. Substantiation and disease-claim
        considerations apply particularly strictly.
      </P>

      <H3>Pattern 3: Outcome photography and testimonials</H3>
      <P>
        Children&rsquo;s photos in marketing require not only
        parental authorization but specific additional considerations:
      </P>
      <UL>
        <LI>
          Age-appropriate permission (older children may have input
          even when parents authorize).
        </LI>
        <LI>
          Privacy considerations that extend beyond HIPAA.
        </LI>
        <LI>
          Permanence of online presence - content the child
          can&rsquo;t consent to remove later.
        </LI>
      </UL>

      <H3>Pattern 4: Treatment guarantee claims</H3>
      <P>
        &ldquo;Guaranteed pain-free pediatric dental visits,&rdquo;
        &ldquo;guaranteed outcomes for [condition]&rdquo; -
        pediatric guarantee language faces standard FTC rules plus
        specific sensitivity considerations around vulnerable
        patient populations.
      </P>

      <H3>Pattern 5: Early intervention and developmental claims</H3>
      <P>
        Early intervention marketing (speech therapy, developmental
        therapy, behavioral intervention for children) needs
        substantiation for specific outcome claims. Research on
        specific interventions varies in strength; marketing should
        match the evidence.
      </P>

      <H2 id="pediatric-dental">Pediatric dental specifics</H2>
      <P>
        Pediatric dentistry is an ADA-recognized specialty.
        Compliance considerations:
      </P>
      <UL>
        <LI>
          &ldquo;Pediatric dentist&rdquo; is an appropriate
          credential claim for dentists with pediatric dental
          residency; general dentists treating children should use
          different framing.
        </LI>
        <LI>
          Sedation dentistry for children has specific state rules
          and insurance considerations.
        </LI>
        <LI>
          Marketing pain management, sedation, and behavioral
          management should reflect the actual clinical
          practice.
        </LI>
      </UL>

      <H2 id="compliant-framework">Compliant pediatric marketing framework</H2>
      <UL>
        <LI>
          <Strong>Parent-directed framing.</Strong> Market to parents
          about services for their children; avoid direct
          child-targeted promotional content.
        </LI>
        <LI>
          <Strong>Evidence-based claim framing.</Strong> Specific
          outcome claims for children&rsquo;s health need particularly
          strong substantiation.
        </LI>
        <LI>
          <Strong>Conservative imagery practices.</Strong> Parental
          authorization plus age-appropriate permission for
          child imagery; minimal identifying information where
          possible.
        </LI>
        <LI>
          <Strong>Clear service-and-team representation.</Strong>
          Who will see the child, what qualifications, what the
          experience will be like.
        </LI>
        <LI>
          <Strong>Vaccine and alternative-therapy caution.</Strong>
          These subcategories warrant specific counsel review.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I use pediatric patients&rsquo; photos in marketing?</H3>
      <P>
        With documented parental HIPAA authorization and appropriate
        additional considerations for the child&rsquo;s privacy.
        Some practices have specific policies limiting child imagery
        in marketing out of privacy concerns beyond legal
        requirements.
      </P>

      <H3>What about pediatric testimonials from parents?</H3>
      <P>
        Parent testimonials about children&rsquo;s care are typical
        healthcare testimonials subject to FTC Endorsement Guide
        rules plus HIPAA considerations. Outcome framing should be
        appropriately modest.
      </P>

      <H3>Can I market alternative autism therapies?</H3>
      <P>
        With particular care. The FTC has specifically pursued
        marketing of autism treatments lacking substantiation.
        Any marketing in this space should involve healthcare
        regulatory counsel.
      </P>

      <H3>What about &ldquo;no shots&rdquo; or vaccine-hesitancy-friendly marketing?</H3>
      <P>
        Positioning specifically around vaccine hesitancy creates
        both FTC substantiation concerns and state medical board
        standard-of-care considerations. Marketing approaches should
        accurately represent your clinical position without
        misleading parents about evidence base.
      </P>

      <H3>Are there specific rules for pediatric dental sedation marketing?</H3>
      <P>
        Yes. State rules on who can provide sedation, what
        disclosures are required, and what outcome claims can be
        made vary significantly. Check state-specific rules.
      </P>

      <H3>How do I handle marketing to teens specifically?</H3>
      <P>
        Teens have more agency than younger children. COPPA
        applies to under-13; teen-directed marketing has its own
        considerations. Privacy and mental health content targeting
        teens faces heightened platform policy scrutiny.
      </P>

      <KeyTakeaways
        items={[
          "Pediatric practice marketing is marketing to parents about services for children - with heightened FTC scrutiny on children-affecting content.",
          "COPPA applies to online services directed at children under 13; most practice websites target parents but child-interactive content triggers COPPA.",
          "Children's imagery requires parental HIPAA authorization plus additional privacy considerations for the child's long-term interests.",
          "Alternative therapy marketing for pediatric conditions (autism, ADHD) faces particular FTC substantiation scrutiny.",
          "Vaccine and vaccine-adjacent marketing has both substantiation and state medical board considerations.",
        ]}
      />
    </>
  )
}
