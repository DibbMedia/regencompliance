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
  slug: "sleep-dentistry-marketing-compliance",
  title:
    "Sleep Dentistry Marketing Compliance: Oral Appliance Therapy, OSA Claims, and the Medical-Dental Boundary",
  description:
    "Sleep dentistry marketing operates at the boundary of dental and medical practice. Claims about sleep apnea treatment, oral appliance efficacy, and scope-of-practice representation all draw specific attention.",
  excerpt:
    "Sleep dentistry is a growing service line that crosses the dental-medical boundary in ways regulators watch carefully. Here's the compliance framework for oral appliance therapy, OSA marketing, and sleep-related services.",
  date: "2026-04-22",
  readingMinutes: 8,
  keywords: [
    "sleep dentistry marketing compliance",
    "oral appliance therapy advertising",
    "sleep apnea dental marketing",
    "OSA dental treatment rules",
    "dental sleep medicine compliance",
  ],
  tags: ["Dental", "Sleep medicine", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Sleep dentistry &mdash; the provision of oral appliance
        therapy and related services for sleep-disordered breathing
        &mdash; operates at the boundary of dental and medical
        practice. Marketing this service category requires
        navigating dental scope-of-practice rules, medical diagnosis
        considerations, FDA device considerations, and the specific
        rules around obstructive sleep apnea (OSA) claims. This post
        covers the compliance framework.
      </Lead>

      <H2 id="scope-of-practice">The scope-of-practice boundary</H2>
      <P>
        Dentists provide dental treatment. Sleep apnea is a medical
        condition diagnosed by physicians. Oral appliance therapy
        is a dental intervention for a medical diagnosis. Marketing
        has to navigate this boundary:
      </P>
      <UL>
        <LI>
          Dentists generally cannot diagnose sleep apnea.
        </LI>
        <LI>
          Dentists can provide oral appliance therapy under
          appropriate medical diagnosis and referral.
        </LI>
        <LI>
          Marketing that implies the dentist diagnoses or primarily
          manages OSA crosses scope-of-practice lines.
        </LI>
      </UL>

      <H2 id="claim-patterns">Problematic claim patterns</H2>

      <H3>Pattern 1: Direct OSA treatment claims</H3>
      <P>
        &ldquo;Cure your sleep apnea with our oral appliance&rdquo;
        is a disease-treatment claim plus a scope-of-practice issue.
        Oral appliance therapy addresses a medical condition
        (diagnosed by a physician) through a dental intervention.
      </P>
      <P>
        Compliant framing: &ldquo;Oral appliance therapy for
        patients with diagnosed sleep apnea, coordinated with your
        sleep physician as part of your overall treatment plan.&rdquo;
      </P>

      <H3>Pattern 2: Diagnosis-implying marketing</H3>
      <P>
        &ldquo;Do you snore? You might have sleep apnea. We can
        help.&rdquo; This implies the dentist diagnoses. Compliant
        alternative: &ldquo;Patients with diagnosed sleep apnea
        often benefit from oral appliance therapy as one treatment
        option.&rdquo;
      </P>

      <H3>Pattern 3: CPAP-alternative superiority</H3>
      <P>
        &ldquo;Better than CPAP &mdash; no masks, no noise, no
        hassle.&rdquo; Comparative claims between treatment modalities
        require head-to-head substantiation. For appropriate
        candidates both treatments have roles; for many OSA
        patients CPAP is the first-line recommended treatment.
      </P>

      <H3>Pattern 4: Outcome certainty claims</H3>
      <P>
        &ldquo;Stop snoring tonight!&rdquo; &ldquo;Get back to
        restful sleep immediately!&rdquo; Oral appliance outcomes
        vary significantly by individual anatomy and OSA severity.
        Certainty claims are unsubstantiable.
      </P>

      <H3>Pattern 5: Airway-focused pediatric marketing</H3>
      <P>
        Pediatric airway marketing (children&rsquo;s breathing
        patterns, myofunctional therapy, jaw development) is a
        growing service line with specific scope-of-practice and
        FTC substantiation concerns. Specific outcome claims for
        pediatric airway intervention need evidence backing.
      </P>

      <H2 id="fda-device">FDA device considerations</H2>
      <P>
        Oral appliances for sleep apnea are FDA-regulated devices.
        Marketing considerations:
      </P>
      <UL>
        <LI>
          Specific appliances have specific FDA clearances for
          specific indications (snoring, mild-moderate OSA, severe
          OSA with specific criteria).
        </LI>
        <LI>
          Marketing within cleared indications is generally fine;
          marketing beyond is off-label device marketing.
        </LI>
        <LI>
          FDA-cleared (most appliances) vs FDA-approved distinction
          applies.
        </LI>
      </UL>

      <H2 id="medical-coordination">Medical coordination marketing</H2>
      <P>
        Compliant sleep dentistry marketing typically emphasizes
        medical coordination:
      </P>
      <UL>
        <LI>
          &ldquo;We work with sleep physicians and primary care
          providers as part of your comprehensive sleep apnea
          care.&rdquo;
        </LI>
        <LI>
          &ldquo;Oral appliance therapy requires a physician
          diagnosis of sleep apnea and typically a sleep
          study.&rdquo;
        </LI>
        <LI>
          &ldquo;We coordinate with your medical team to support the
          treatment plan they&rsquo;ve recommended.&rdquo;
        </LI>
      </UL>
      <P>
        This framing positions the practice as dental-scope service
        providing a valuable component of comprehensive medical
        care, which is both clinically accurate and
        compliance-safer.
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can dentists offer sleep apnea screening?</H3>
      <P>
        Screening (identifying patients who may benefit from medical
        evaluation) is different from diagnosis. Many dentists use
        screening tools to identify referral candidates. Marketing
        should accurately describe this as screening and referral
        rather than diagnosis.
      </P>

      <H3>What about home sleep testing from a dental office?</H3>
      <P>
        Home sleep test provision has specific state and federal
        rules. Some states allow dentists to order specific tests
        under specific circumstances; others don&rsquo;t. Marketing
        should accurately represent the regulatory status in your
        state.
      </P>

      <H3>Are there specific state dental board rules on sleep dentistry?</H3>
      <P>
        Yes. State dental boards have specific rules on scope of
        practice for sleep services. Some states require specific
        certifications or supervision for oral appliance provision.
        Check state-specific rules.
      </P>

      <H3>How do I market airway orthodontics?</H3>
      <P>
        Airway orthodontics is an emerging specialty area with
        specific enforcement considerations. Marketing should
        accurately describe the interventions and avoid specific
        outcome claims without substantiation.
      </P>

      <H3>Can I advertise direct-to-consumer appliances like mandibular advancement devices?</H3>
      <P>
        FDA considers most custom MADs as prescription devices
        requiring physician involvement. OTC versions exist but
        carry different marketing rules. Practice-provided custom
        MADs follow the general sleep dentistry framework.
      </P>

      <H3>What documentation should sleep dentistry practices maintain?</H3>
      <P>
        Physician referral and diagnosis documentation, oral
        appliance FDA clearance documentation, informed consent
        including potential side effects (TMJ changes, tooth
        movement), outcome tracking, and coordination-with-physician
        records.
      </P>

      <KeyTakeaways
        items={[
          "Sleep dentistry operates at the dental-medical boundary — dentists provide oral appliance therapy, physicians diagnose sleep apnea.",
          "Marketing that implies dentist diagnosis of sleep apnea crosses scope-of-practice lines and can produce state dental board attention.",
          "CPAP-alternative superiority claims and OSA-cure claims are substantiation-exposure areas.",
          "Medical-coordination framing is both clinically accurate and compliance-safer than standalone sleep apnea treatment marketing.",
          "Pediatric airway and orthodontic sleep services add specific substantiation and scope considerations.",
        ]}
      />
    </>
  )
}
