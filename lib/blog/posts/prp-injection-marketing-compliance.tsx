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
  BeforeAfter,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "prp-injection-marketing-compliance",
  title:
    "PRP Injection Marketing Compliance: What Orthopedics, Sports Medicine, and Hair Restoration Practices Keep Getting Wrong",
  description:
    "Platelet-rich plasma (PRP) marketing has its own compliance pattern — different from stem cell marketing, with specific off-label issues, FDA-cleared device vs biological-product distinctions, and indication-specific enforcement considerations.",
  excerpt:
    "PRP marketing looks simpler than stem cell marketing but carries a distinct compliance pattern. Here's what orthopedic, sports medicine, hair restoration, and aesthetic practices need to know about marketing PRP compliantly.",
  date: "2026-04-22",
  readingMinutes: 9,
  keywords: [
    "PRP marketing compliance",
    "platelet-rich plasma advertising",
    "PRP injection FDA rules",
    "PRP hair restoration marketing",
    "PRP sports medicine compliance",
  ],
  tags: ["Regen", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Platelet-rich plasma (PRP) is probably the most widely-offered
        regenerative treatment in the US. Orthopedic practices,
        sports medicine clinics, hair restoration practices, med
        spas, and aesthetic dermatology all use it. The marketing
        around PRP is typically less aggressive than stem cell or
        exosome marketing &mdash; but it has its own specific
        compliance pattern that practices regularly miss. This is the
        full breakdown for PRP marketing.
      </Lead>

      <H2 id="regulatory-status">The regulatory status of PRP</H2>
      <P>
        PRP preparation involves concentrating a patient&rsquo;s own
        platelets through centrifugation. The regulatory picture has
        several layers:
      </P>

      <UL>
        <LI>
          <Strong>The centrifuge/device.</Strong> FDA-cleared centrifuge
          systems are used to prepare PRP. These are FDA-cleared
          (510(k)) for PRP preparation generally, not FDA-approved
          for specific therapeutic indications.
        </LI>
        <LI>
          <Strong>The PRP preparation itself.</Strong> Considered an
          HCT/P under FDA rules. When prepared in a closed, same-day
          autologous context, typically operates under the 361
          pathway.
        </LI>
        <LI>
          <Strong>The therapeutic claim.</Strong> Marketing claims
          about specific therapeutic outcomes are subject to FTC
          substantiation and FDA disease-claim rules regardless of
          the 361 status of the preparation.
        </LI>
      </UL>

      <H2 id="problem-patterns">The specific problem patterns</H2>

      <H3>Pattern 1: &ldquo;FDA-approved PRP therapy&rdquo;</H3>
      <BeforeAfter
        bad="Our FDA-approved PRP therapy for joint pain."
        good="Our PRP preparation is made using FDA-cleared centrifuge systems. PRP itself operates under the HCT/P framework; we discuss candidacy at consultation."
        reason="PRP is not FDA-approved. The centrifuge device may be FDA-cleared. Conflating the two is one of the most common compliance issues in PRP marketing."
      />

      <H3>Pattern 2: Disease-specific treatment claims</H3>
      <BeforeAfter
        bad="PRP cures arthritis and heals torn ligaments."
        good="PRP injections are offered for a range of musculoskeletal concerns; clinical appropriateness is determined at consultation."
        reason="'Cures arthritis' is a disease-treatment claim subject to FDA drug-claim rules. 'Heals torn ligaments' similarly claims therapeutic action. Compliant alternatives describe the service without specific therapeutic outcomes."
      />

      <H3>Pattern 3: Hair-regrowth specifics</H3>
      <BeforeAfter
        bad="PRP hair restoration — regrow your hair guaranteed, or your money back."
        good="PRP-based hair restoration treatments are one option for patients experiencing hair thinning; individual results vary based on cause and candidacy, and we discuss expected outcomes at consultation."
        reason="Guarantee language is an FTC enforcement staple. Hair-regrowth specifics require substantiation. Candidacy-forward framing converts well and is compliant."
      />

      <H3>Pattern 4: Athletic performance claims</H3>
      <BeforeAfter
        bad="PRP helps professional athletes recover faster — get your edge."
        good="Some patients, including active individuals, report improved comfort and function after PRP treatment as part of their recovery plan; outcomes vary by individual."
        reason="Performance-claim marketing runs into FTC substantiation rules. Celebrity/athlete name-drops without disclosure layer on additional issues."
      />

      <H3>Pattern 5: &ldquo;Natural healing&rdquo; and biology claims</H3>
      <BeforeAfter
        bad="PRP uses your body's natural healing factors to repair damaged tissue."
        good="PRP concentrates platelets from your own blood, which contain signaling molecules involved in the body's normal tissue response."
        reason="'Natural healing' and 'repair damaged tissue' are therapeutic claims. Describing what PRP is (concentrated platelets, containing signaling molecules) without claiming what it does therapeutically is the compliant alternative."
      />

      <H2 id="specialty-specific">Specialty-specific considerations</H2>

      <H3>Orthopedic and sports medicine</H3>
      <P>
        The most common marketing mistake: specific condition claims
        (arthritis, tendonitis, rotator cuff, ACL, meniscus,
        plantar fasciitis). These are disease-specific and trigger
        FDA drug-claim rules. Compliant orthopedic PRP marketing
        describes the service without condition-specific therapeutic
        claims.
      </P>

      <H3>Hair restoration</H3>
      <P>
        PRP hair restoration is the fastest-growing PRP category.
        Common marketing issues: guarantee language, specific
        hair-count/density outcome claims, before/after without
        typical-experience disclosure, celebrity endorsements without
        material-connection disclosure. Compliant hair-restoration
        marketing is candidacy-forward and outcome-framed as
        individual variation.
      </P>

      <H3>Aesthetic (vampire facial, skin rejuvenation)</H3>
      <P>
        Aesthetic PRP marketing has its own specific issues:
        before/after imagery, anti-aging claims, and
        &ldquo;vampire&rdquo; branding issues (some states restrict
        marketing with that term). The aesthetic PRP marketing surface
        often overlaps with med spa marketing rules generally.
      </P>

      <H3>Erectile dysfunction / sexual wellness PRP</H3>
      <P>
        PRP for ED or sexual wellness is one of the more enforcement-
        risky PRP applications. Disease-specific claims (ED is a
        diagnosable condition) trigger FDA rules. Marketing for this
        indication should be particularly restrained and specifically
        reviewed by counsel.
      </P>

      <H3>Dental PRP/PRF</H3>
      <P>
        PRP and platelet-rich fibrin (PRF) in dental contexts
        (implants, periodontal) are common but less marketed directly
        to consumers. Compliance considerations focus on substantiation
        of specific outcome claims when discussed.
      </P>

      <H2 id="compliant-marketing">Compliant PRP marketing framework</H2>

      <H3>Lead with candidacy, not outcomes</H3>
      <P>
        &ldquo;We offer PRP injections as part of our musculoskeletal
        care; candidacy and expected outcomes are discussed at
        consultation.&rdquo; This signals the service without making
        specific outcome claims.
      </P>

      <H3>Describe the preparation honestly</H3>
      <P>
        &ldquo;Prepared in-office from your own blood using FDA-cleared
        centrifuge systems. Your PRP is typically injected same-day
        under sterile technique.&rdquo; Specific, factual, compliant.
      </P>

      <H3>Frame results as individual</H3>
      <P>
        &ldquo;Patient experiences with PRP vary significantly by
        cause, severity, and individual response. We discuss realistic
        expectations during every consultation.&rdquo; Sets the
        expectation correctly without underselling the service.
      </P>

      <H3>Cite published evidence where available</H3>
      <P>
        For PRP applications with meaningful published clinical
        evidence (certain orthopedic uses have stronger evidence than
        others), cite specifically: &ldquo;A systematic review of PRP
        in [specific indication] (citation) reported [specific
        finding]. Individual results depend on many factors.&rdquo;
      </P>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Is PRP marketing safer than stem cell marketing?</H3>
      <P>
        Generally yes, but not because PRP is inherently lower-risk
        &mdash; because most PRP marketing is less aggressive.
        Aggressive PRP marketing with disease-treatment claims
        carries the same exposure as equivalent stem cell marketing.
      </P>

      <H3>Does my PRP centrifuge being FDA-cleared protect me?</H3>
      <P>
        The centrifuge clearance does not cover therapeutic claims
        about what the PRP will do after injection. Those claims need
        their own substantiation. The centrifuge clearance applies to
        the device, not the treatment outcome.
      </P>

      <H3>Can I show PRP before/after hair images?</H3>
      <P>
        Yes, with FTC-compliant framing &mdash; typical-experience
        disclosure, individual-variation language, and avoidance of
        outcome guarantees. The same framing rules that apply to
        weight-loss or aesthetic before/after apply here.
      </P>

      <H3>What about combining PRP with stem cells or exosomes?</H3>
      <P>
        Combination marketing adds the compliance complexity of each
        component. Claims about combination-protocol outcomes need
        substantiation covering the combination &mdash; citations to
        single-component studies do not substantiate
        combination-specific claims.
      </P>

      <H3>Is cosmetic PRP (vampire facial) different?</H3>
      <P>
        Same compliance framework; different terminology. The term
        &ldquo;vampire facial&rdquo; itself is trademarked in some
        contexts &mdash; verify usage rights before marketing with
        that specific name. State medical boards in some jurisdictions
        have reviewed infection-control and supervision issues around
        PRP facials specifically.
      </P>

      <H3>What documentation should I keep for PRP marketing?</H3>
      <P>
        Maintain substantiation files for any efficacy claim, keep
        centrifuge device documentation, retain patient authorization
        for any testimonial or imagery used, and log marketing-review
        decisions as you would for any healthcare marketing.
      </P>

      <KeyTakeaways
        items={[
          "PRP is not FDA-approved — the centrifuge may be FDA-cleared, but the preparation operates under HCT/P rules and the therapeutic claims are separate.",
          "Disease-specific claims (arthritis, tendonitis, ED) trigger FDA drug-claim rules regardless of the 361 status.",
          "Candidacy-forward marketing (vs outcome-forward) is both compliant and effective for PRP services.",
          "Hair restoration and sexual wellness PRP are higher-enforcement subcategories and warrant extra restraint.",
          "Combination treatments need combination-specific substantiation; citing individual-component studies is not sufficient.",
        ]}
      />
    </>
  )
}
