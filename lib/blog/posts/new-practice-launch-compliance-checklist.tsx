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
  slug: "new-practice-launch-compliance-checklist",
  title:
    "New Healthcare Practice Launch Compliance Checklist: Everything You Should Set Up Before Opening Day",
  description:
    "Launching a new healthcare practice means setting up compliance infrastructure from scratch. Here's the comprehensive checklist covering FDA/FTC marketing compliance, HIPAA, state requirements, and platform setup.",
  excerpt:
    "Launching a new practice? Here's the complete compliance infrastructure checklist to build before opening day - marketing, HIPAA, state requirements, platform accounts, and ongoing process.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "new practice launch compliance",
    "healthcare practice opening checklist",
    "new med spa launch compliance",
    "healthcare startup compliance",
    "practice launch legal requirements",
  ],
  tags: ["Tactical", "Launch"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Tactical playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Launching a new healthcare practice means building
        compliance infrastructure from scratch - and
        doing it before marketing starts rather than retrofitting
        later. Marketing compliance decisions at launch ripple
        forward for the life of the practice. This checklist covers
        the specific compliance setup for a new launch across
        marketing, HIPAA, state requirements, and ongoing
        processes.
      </Lead>

      <H2 id="pre-launch">Pre-launch: 60-90 days before opening</H2>

      <H3>Legal entity and licensure</H3>
      <UL>
        <LI>
          Business entity formed in the state of operation.
        </LI>
        <LI>
          Professional entity requirements met (PC, PLLC as
          state requires).
        </LI>
        <LI>
          State licensure verified (medical, dental, specialty
          licenses as applicable).
        </LI>
        <LI>
          Multi-state licensure established if serving out-of-state
          patients.
        </LI>
        <LI>
          DEA registration if prescribing controlled substances.
        </LI>
      </UL>

      <H3>Insurance</H3>
      <UL>
        <LI>
          Professional malpractice insurance.
        </LI>
        <LI>
          General liability.
        </LI>
        <LI>
          Cyber liability (HIPAA-relevant).
        </LI>
        <LI>
          Advertising liability (for marketing).
        </LI>
        <LI>
          Management liability (D&amp;O for corporate entities).
        </LI>
      </UL>

      <H3>Healthcare regulatory counsel</H3>
      <UL>
        <LI>
          Relationship established with healthcare regulatory
          attorney.
        </LI>
        <LI>
          Specific familiarity with your specialty and state.
        </LI>
        <LI>
          Available for compliance questions as they arise.
        </LI>
      </UL>

      <H2 id="marketing-infrastructure">Marketing infrastructure</H2>

      <H3>Brand and positioning</H3>
      <UL>
        <LI>
          Practice name verification (state business name,
          trademark considerations).
        </LI>
        <LI>
          Brand positioning matches actual credentialing and scope.
        </LI>
        <LI>
          Specialty-claim language reviewed for accuracy.
        </LI>
      </UL>

      <H3>Website foundation</H3>
      <UL>
        <LI>
          Services pages accurately describe offered services.
        </LI>
        <LI>
          Provider bios accurate to credentialing.
        </LI>
        <LI>
          About page compliant (see About page compliance post).
        </LI>
        <LI>
          Privacy policy and terms of service.
        </LI>
        <LI>
          HIPAA Notice of Privacy Practices available.
        </LI>
        <LI>
          Accessibility (ADA) considerations.
        </LI>
      </UL>

      <H3>Compliance program</H3>
      <UL>
        <LI>
          Written style guide for marketing.
        </LI>
        <LI>
          Pre-publish review process established.
        </LI>
        <LI>
          Compliance software selected and set up.
        </LI>
        <LI>
          Staff trained on compliance basics before publishing
          content.
        </LI>
        <LI>
          Documentation practices established.
        </LI>
      </UL>

      <H3>Platform accounts</H3>
      <UL>
        <LI>
          Google Business Profile set up with accurate information.
        </LI>
        <LI>
          Google Ads account (with LegitScript certification if
          required for category).
        </LI>
        <LI>
          Meta Business Manager established.
        </LI>
        <LI>
          Healthcare-appropriate social media accounts created.
        </LI>
        <LI>
          Directory listings (Healthgrades, Yelp, specialty
          directories) with accurate information.
        </LI>
      </UL>

      <H2 id="hipaa-infrastructure">HIPAA infrastructure</H2>

      <H3>Documentation</H3>
      <UL>
        <LI>
          Notice of Privacy Practices.
        </LI>
        <LI>
          Patient intake forms compliant with current framework.
        </LI>
        <LI>
          Marketing authorization forms separate from treatment
          consent.
        </LI>
        <LI>
          Photo authorization forms if using patient imagery.
        </LI>
        <LI>
          Communication preference forms.
        </LI>
      </UL>

      <H3>Operational HIPAA</H3>
      <UL>
        <LI>
          Business Associate Agreements with all vendors handling
          PHI.
        </LI>
        <LI>
          Email marketing platform HIPAA-compliant with BAA.
        </LI>
        <LI>
          Text messaging platform HIPAA-compliant if used.
        </LI>
        <LI>
          EHR/practice management HIPAA-compliant with BAA.
        </LI>
        <LI>
          Website forms HIPAA-appropriate for any PHI collected.
        </LI>
        <LI>
          Staff HIPAA training documented.
        </LI>
      </UL>

      <H2 id="state-specific">State-specific requirements</H2>

      <H3>Advertising</H3>
      <UL>
        <LI>
          State medical board advertising rules reviewed.
        </LI>
        <LI>
          State-specific disclosures included in marketing.
        </LI>
        <LI>
          Specialty-claim terminology compliant with state
          rules.
        </LI>
        <LI>
          Telehealth advertising compliant if offering
          cross-state services.
        </LI>
      </UL>

      <H3>Scope of practice</H3>
      <UL>
        <LI>
          Services offered within authorized scope.
        </LI>
        <LI>
          Supervision arrangements documented where required.
        </LI>
        <LI>
          Non-physician provider scope-of-practice compliant.
        </LI>
      </UL>

      <H3>Privacy</H3>
      <UL>
        <LI>
          State privacy law compliance (California CMIA, New York
          SHIELD, etc.).
        </LI>
        <LI>
          State-specific breach notification procedures.
        </LI>
      </UL>

      <H2 id="specific-categories">Category-specific considerations</H2>

      <H3>Med spa / aesthetic</H3>
      <UL>
        <LI>
          Medical director agreement and supervision structure.
        </LI>
        <LI>
          Nurse injector licensing and supervision.
        </LI>
        <LI>
          Device FDA clearance documentation.
        </LI>
        <LI>
          Before/after photography policies.
        </LI>
      </UL>

      <H3>Telehealth</H3>
      <UL>
        <LI>
          Multi-state licensure plan.
        </LI>
        <LI>
          Telehealth platform HIPAA compliance.
        </LI>
        <LI>
          State-specific telehealth rules.
        </LI>
        <LI>
          Controlled substance prescribing considerations.
        </LI>
      </UL>

      <H3>Regenerative medicine</H3>
      <UL>
        <LI>
          HCT/P pathway analysis with counsel.
        </LI>
        <LI>
          Supplier vetting and documentation.
        </LI>
        <LI>
          Marketing language matched to pathway.
        </LI>
      </UL>

      <H3>Addiction treatment</H3>
      <UL>
        <LI>
          LegitScript certification.
        </LI>
        <LI>
          EKRA compliance for compensation structures.
        </LI>
        <LI>
          State patient brokering law compliance.
        </LI>
      </UL>

      <H2 id="ongoing-process">Ongoing process setup</H2>
      <OL>
        <LI>
          <Strong>Pre-publish review workflow.</Strong> Every piece
          of content passes compliance review before publishing.
        </LI>
        <LI>
          <Strong>Quarterly compliance audit.</Strong> Review of
          all live marketing surfaces against current rules.
        </LI>
        <LI>
          <Strong>Staff training refresh.</Strong> Annual baseline
          training, triggered updates for specific changes.
        </LI>
        <LI>
          <Strong>Regulatory monitoring.</Strong> Someone tracks
          FDA/FTC/state enforcement in the practice&rsquo;s
          specialty.
        </LI>
        <LI>
          <Strong>Incident response plan.</Strong> Clear process if
          compliance issues emerge or regulatory contact occurs.
        </LI>
      </OL>

      <H2 id="90-day-review">30/60/90 day review</H2>
      <P>
        Even with a thorough launch setup, the first 90 days
        typically reveal gaps. Schedule reviews at 30, 60, and 90
        days to audit:
      </P>
      <UL>
        <LI>
          What&rsquo;s been published since launch.
        </LI>
        <LI>
          Whether the compliance workflow is actually being
          followed.
        </LI>
        <LI>
          Gaps between planned and actual operations.
        </LI>
        <LI>
          Emerging issues that need attention.
        </LI>
      </UL>

      <BQ>
        Launching right is dramatically cheaper than retrofitting.
        Practices that set up compliance infrastructure at launch
        spend a fraction of what practices that tried to bolt it
        on later do - and they avoid the compliance issues
        that typically emerge from retrofitting.
      </BQ>

      <KeyTakeaways
        items={[
          "Launch is the cheapest time to build compliance infrastructure - retrofitting is dramatically more expensive.",
          "Legal entity, licensure, insurance, and counsel relationships should be established 60-90 days before opening.",
          "HIPAA infrastructure (documentation, BAAs, training, forms) needs to be operational before seeing patients.",
          "Compliance program (style guide, review process, software, training) needs to be operational before marketing launches.",
          "30/60/90 day reviews catch gaps between planned and actual compliance operations.",
        ]}
      />
    </>
  )
}
