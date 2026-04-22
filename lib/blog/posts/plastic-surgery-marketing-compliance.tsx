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
  slug: "plastic-surgery-marketing-compliance",
  title:
    "Plastic Surgery Marketing Compliance: Board Certification, Before/After Rules, and the Specific Enforcement Patterns",
  description:
    "Plastic surgery marketing is a mature, high-enforcement category. Board-certified rules, before/after imagery standards, medical tourism, and package pricing all draw specific compliance attention.",
  excerpt:
    "Plastic surgery marketing has some of the most developed enforcement case law in healthcare. Here's the specific compliance framework - board certification rules, before/after standards, and medical tourism considerations.",
  date: "2026-04-22",
  readingMinutes: 9,
  keywords: [
    "plastic surgery marketing compliance",
    "plastic surgeon advertising rules",
    "cosmetic surgery marketing",
    "board certified surgeon marketing",
    "plastic surgery before after rules",
  ],
  tags: ["Plastic surgery", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Specialty playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Plastic surgery marketing is a mature, high-enforcement
        category with specific compliance rules that have developed
        through decades of state medical board action, FTC cases,
        and private litigation. Board-certification rules are more
        strictly enforced here than in most specialties.
        Before/after imagery standards apply with particular rigor.
        Medical tourism, package pricing, and social media
        transformation content all draw specific enforcement
        attention.
      </Lead>

      <H2 id="board-certification">Board-certification rules</H2>
      <P>
        &ldquo;Board-certified plastic surgeon&rdquo; is a defined
        term. Under most state medical board rules, it requires
        certification by the American Board of Plastic Surgery (ABPS,
        an ABMS member board) or equivalent ABMS recognition. The
        following are common marketing patterns that create issues:
      </P>

      <H3>Issue 1: Non-ABMS certification presented as equivalent</H3>
      <BeforeAfter
        bad="Dr. Smith is a board-certified cosmetic surgeon."
        good="Dr. Smith is certified by the American Board of Cosmetic Surgery (not an ABMS member board). Dr. Smith's general medical training and board certification history is [specific accurate description]."
        reason="Some non-ABMS boards (American Board of Cosmetic Surgery, for instance) don't carry the same recognition as ABMS boards. State medical boards have specifically disciplined physicians for implying ABMS equivalence."
      />

      <H3>Issue 2: General surgery board with cosmetic practice</H3>
      <P>
        Physicians certified by other ABMS boards (general surgery,
        dermatology, otolaryngology) performing cosmetic procedures
        can market accurately with their specific certification.
        &ldquo;Board-certified plastic surgeon&rdquo; language is
        reserved for ABPS certification.
      </P>

      <H3>Issue 3: Implied specialty from unrelated training</H3>
      <P>
        Fellowship training, observational experience, or
        continuing education courses don&rsquo;t create specialty
        board certification. Marketing that implies specialty
        standing from these is a state-board-level issue.
      </P>

      <H2 id="before-after">Before/after imagery standards</H2>
      <P>
        Plastic surgery before/after is where enforcement case law
        is most developed. Key requirements:
      </P>
      <UL>
        <LI>
          <Strong>Patient authorization.</Strong> HIPAA-compliant
          marketing authorization specific to the imagery use.
        </LI>
        <LI>
          <Strong>Typical-experience framing.</Strong> Disclosure of
          what typical outcomes look like, not just peak outcomes.
        </LI>
        <LI>
          <Strong>Time post-procedure.</Strong> When the &ldquo;after&rdquo;
          was taken relative to the procedure.
        </LI>
        <LI>
          <Strong>Procedure specifics.</Strong> What procedure was
          performed, key parameters.
        </LI>
        <LI>
          <Strong>Consistent imagery conditions.</Strong> Before/after
          with substantially different lighting, pose, makeup, or
          photography technique that affects perceived outcome can
          cross into deceptive territory.
        </LI>
        <LI>
          <Strong>No enhancement or alteration.</Strong> Digital
          modification of before/after imagery to emphasize outcome
          is a specific enforcement category.
        </LI>
      </UL>

      <H2 id="medical-tourism">Medical tourism considerations</H2>
      <P>
        Plastic surgery practices marketing to out-of-state or
        international patients face additional considerations:
      </P>
      <UL>
        <LI>
          <Strong>Licensure disclosure.</Strong> Clear statement of
          state licensure. Performing procedures on patients from
          states where the surgeon isn&rsquo;t licensed doesn&rsquo;t
          violate licensure (procedures are performed in the
          licensed state), but marketing to out-of-state patients
          should be accurate about the care model.
        </LI>
        <LI>
          <Strong>Post-op care arrangements.</Strong> Marketing that
          implies local post-op continuity when the patient is
          returning home creates misrepresentation concerns.
        </LI>
        <LI>
          <Strong>Complication management.</Strong> Marketing should
          address how complications discovered after the patient
          returns home are managed.
        </LI>
        <LI>
          <Strong>Consent and informed disclosure.</Strong> Medical
          tourism contexts heighten the importance of documented
          informed consent including the travel-related care
          considerations.
        </LI>
      </UL>

      <H2 id="package-pricing">Package pricing and financing</H2>
      <P>
        Plastic surgery package pricing marketing is a specific
        state AG focus. Common issues:
      </P>
      <UL>
        <LI>
          Advertised prices not including anesthesia, facility fees,
          or surgeon fees.
        </LI>
        <LI>
          Package pricing for multi-procedure bundles without
          adequate disclosure of what&rsquo;s included.
        </LI>
        <LI>
          Financing partnership marketing without clear disclosure
          of financing costs and terms.
        </LI>
        <LI>
          Limited-time pricing promotions without clear offer terms.
        </LI>
      </UL>

      <H2 id="social-media">Social media and transformation content</H2>
      <P>
        Plastic surgery is one of the most social-media-heavy
        marketing categories. Enforcement patterns specific to
        social:
      </P>
      <UL>
        <LI>
          Meta&rsquo;s before/after imagery restrictions apply
          particularly strictly to plastic surgery ads.
        </LI>
        <LI>
          TikTok transformation content faces both platform
          guidelines and FTC Endorsement Guides scrutiny.
        </LI>
        <LI>
          Reality TV and content creator patient marketing requires
          material-connection disclosure.
        </LI>
        <LI>
          Live-stream procedures (Instagram Live, YouTube Live) raise
          additional HIPAA and consent considerations.
        </LI>
      </UL>

      <H2 id="outcome-guarantees">Outcome guarantees and satisfaction</H2>
      <P>
        Some plastic surgery practices offer revision or touchup
        guarantees. Compliance considerations:
      </P>
      <UL>
        <LI>
          Specific narrowly-scoped warranties (e.g., &ldquo;revision
          within 6 months at no charge if specific outcome
          criteria are not met&rdquo;) can be structured
          compliantly.
        </LI>
        <LI>
          Broad outcome guarantees (&ldquo;guaranteed
          satisfaction&rdquo;) are unsubstantiable and
          exposure-heavy.
        </LI>
        <LI>
          Money-back guarantees face additional scrutiny; many
          states have specific rules on refund-based marketing for
          medical services.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Is the American Board of Cosmetic Surgery equivalent to the ABPS?</H3>
      <P>
        No. ABCS is not an ABMS member board; ABPS (American Board
        of Plastic Surgery) is. State medical boards treat the two
        differently in most jurisdictions. Marketing ABCS as
        equivalent has drawn specific state board discipline.
      </P>

      <H3>Can facial plastic surgeons (ENT-based) use &ldquo;facial plastic surgeon&rdquo;?</H3>
      <P>
        Yes, with accurate disclosure. Facial plastic surgeons
        certified by the American Board of Otolaryngology and with
        additional subspecialty training can accurately describe
        their training. Clarity about what board provides the
        certification matters.
      </P>

      <H3>What about &ldquo;celebrity plastic surgeon&rdquo; claims?</H3>
      <P>
        Depends on substantiation. If you have documented celebrity
        patients who authorize disclosure of the relationship, you
        can reference this with their authorization. Vague
        &ldquo;celebrity&rdquo; framing without specific
        verifiable basis is a superlative-claim issue.
      </P>

      <H3>How should I handle botched-surgery revision marketing?</H3>
      <P>
        Revision surgery marketing is an area where claims about
        &ldquo;fixing&rdquo; another surgeon&rsquo;s work create
        professional-conduct and defamation concerns. Focus on your
        expertise in revision work without disparaging previous
        providers.
      </P>

      <H3>Are there specific rules for medical spa services offered by plastic surgery practices?</H3>
      <P>
        Yes. Non-surgical services (injectables, lasers,
        body-contouring) within a plastic surgery practice face all
        the med spa compliance rules. Supervision, device FDA status,
        before/after imagery rules apply independently.
      </P>

      <H3>What documentation should plastic surgery practices maintain?</H3>
      <P>
        Board certification documentation, patient authorizations for
        imagery with specific scope and duration, substantiation
        files for any specific outcome or satisfaction claims,
        before/after-imagery-consistency documentation (lighting,
        pose standards), pricing-disclosure records.
      </P>

      <KeyTakeaways
        items={[
          "Board certification rules are strictly enforced - ABMS-equivalence claims without ABMS certification draw specific discipline.",
          "Before/after imagery rules are most developed in this specialty - typical-experience, time post-procedure, and consistent imagery conditions all matter.",
          "Medical tourism marketing requires specific disclosures about licensure, post-op care, and complication management.",
          "Package pricing without adequate disclosure is a state AG focus; outcome guarantees beyond narrow warranties create exposure.",
          "Social media transformation content faces platform policy layers on top of FTC Endorsement Guides requirements.",
        ]}
      />
    </>
  )
}
