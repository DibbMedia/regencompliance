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
  slug: "podcast-marketing-healthcare-rules",
  title:
    "Podcast Marketing for Healthcare Practices: Hosting, Guest Appearances, and Sponsorship Rules",
  description:
    "Healthcare podcast marketing - hosting your own show, guest appearances on others, and sponsored content - operates under FTC, FDA, and HIPAA rules. Here's the compliance framework.",
  excerpt:
    "Podcast marketing is long-form and conversational, which creates specific compliance challenges. Here's how practices can host, appear on, and sponsor podcasts compliantly.",
  date: "2026-04-22",
  readingMinutes: 6,
  keywords: [
    "healthcare podcast marketing",
    "physician podcast compliance",
    "medical podcast rules",
    "healthcare sponsored podcast",
    "physician podcast guest",
  ],
  tags: ["Platform", "Podcast"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Platform playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Podcast marketing has become an increasingly common healthcare
        practice channel - either hosting your own show,
        appearing as a guest on others&rsquo;, or sponsoring
        healthcare-adjacent podcasts. The long-form conversational
        format creates specific compliance challenges: disclosures
        need to fit the audio format, real-time conversations
        include unscripted claims, and edit-after-recording controls
        are limited compared to text content.
      </Lead>

      <H2 id="hosting">Hosting your own podcast</H2>
      <P>
        Healthcare practices hosting podcasts face several
        considerations:
      </P>
      <UL>
        <LI>
          Content you publish is your marketing - subject to
          standard FDA/FTC rules.
        </LI>
        <LI>
          Guest statements become your marketing when you publish
          them.
        </LI>
        <LI>
          Disclosure of practice ownership and material connections
          needs to be audio-clear.
        </LI>
        <LI>
          Patient stories on podcasts face HIPAA requirements plus
          FTC Endorsement Guide rules.
        </LI>
      </UL>

      <H2 id="guest-appearances">Guest appearances on other podcasts</H2>
      <P>
        Appearing on others&rsquo; podcasts is both marketing and
        thought leadership. Compliance considerations:
      </P>
      <UL>
        <LI>
          Statements you make are attributable to you and your
          practice.
        </LI>
        <LI>
          If appearing to promote specific services, standard
          marketing rules apply.
        </LI>
        <LI>
          Material connection to the host (if any compensation,
          promotion exchange, affiliate arrangements) needs
          disclosure.
        </LI>
        <LI>
          State medical board rules on public statements apply.
        </LI>
      </UL>

      <H2 id="sponsorship">Sponsoring healthcare-adjacent podcasts</H2>
      <P>
        Sponsored content on podcasts has specific rules:
      </P>
      <UL>
        <LI>
          Sponsored segments should be clearly identified as
          sponsored.
        </LI>
        <LI>
          Host-read endorsements require material-connection
          disclosure in the reading, not just in show notes.
        </LI>
        <LI>
          Specific claims in sponsored content need substantiation
          as in any other marketing.
        </LI>
        <LI>
          Patient-targeting sponsored content follows consumer
          marketing rules.
        </LI>
      </UL>

      <H2 id="disclosure-in-audio">Disclosure in audio format</H2>
      <P>
        Audio-format disclosure requires specific practices:
      </P>
      <UL>
        <LI>
          Verbal disclosure near the relevant content, not only
          at the end.
        </LI>
        <LI>
          Show notes with additional disclosure detail.
        </LI>
        <LI>
          Speaker identification and affiliations established
          early.
        </LI>
        <LI>
          Typical-experience disclosures for outcome claims.
        </LI>
      </UL>

      <H2 id="unscripted-risks">Unscripted conversation risks</H2>
      <P>
        Unlike text content, podcast conversations happen in
        real-time. Specific risks:
      </P>
      <UL>
        <LI>
          Unscripted claims about specific diseases or outcomes
          that would be caught in text review.
        </LI>
        <LI>
          Endorsement-like statements about specific products
          without disclosure.
        </LI>
        <LI>
          Testimonials from guests without proper HIPAA or FTC
          framing.
        </LI>
        <LI>
          Off-topic claims that could be cited in enforcement.
        </LI>
      </UL>
      <P>
        Mitigation: pre-recording prep for key guests, editable
        post-production, disclosures read verbatim at specific
        points.
      </P>

      <H2 id="patient-guests">Patient guests on podcasts</H2>
      <P>
        Patient guests face specific considerations:
      </P>
      <UL>
        <LI>
          HIPAA-compliant authorization for the specific podcast
          use.
        </LI>
        <LI>
          Appropriate framing of their experience (individual
          experience, not typical outcome claim).
        </LI>
        <LI>
          Material-connection disclosure if any compensation
          provided.
        </LI>
        <LI>
          Consideration that the podcast will be indefinitely
          available.
        </LI>
      </UL>

      <H2 id="physician-guests">Physician guests on your podcast</H2>
      <P>
        Physician guests bring their own considerations:
      </P>
      <UL>
        <LI>
          Product recommendations from physician guests that your
          practice promotes create material-connection
          considerations.
        </LI>
        <LI>
          Physicians discussing specific prescription products
          face prescription drug advertising rules.
        </LI>
        <LI>
          State medical board rules on physician public statements
          apply.
        </LI>
      </UL>

      <H2 id="compliant-framework">Compliant podcast marketing framework</H2>
      <UL>
        <LI>
          <Strong>Pre-recording prep for high-stakes content.</Strong>
          Talking points reviewed, specific disclosures noted.
        </LI>
        <LI>
          <Strong>Post-production compliance review.</Strong> Same
          standards as other marketing content.
        </LI>
        <LI>
          <Strong>Standard disclosure practices.</Strong> Verbal
          disclosure at relevant points, show notes supporting.
        </LI>
        <LI>
          <Strong>HIPAA discipline with patient guests.</Strong>
          Specific authorization, appropriate framing.
        </LI>
        <LI>
          <Strong>Material-connection transparency.</Strong>
          Practice ownership, paid relationships, affiliate
          arrangements.
        </LI>
      </UL>

      <H2 id="faqs">Frequently asked questions</H2>

      <H3>Can I edit out problematic statements before publishing?</H3>
      <P>
        Yes, and you should. Post-production editing to remove
        compliance-problematic statements is standard practice.
        Audio edits should maintain conversational coherence.
      </P>

      <H3>What about live podcasts and livestreamed content?</H3>
      <P>
        Live content removes post-production safety net. Specific
        risks are higher; pre-live preparation matters more.
      </P>

      <H3>How should I handle product mentions that aren&rsquo;t sponsorships?</H3>
      <P>
        Organic mentions of products without financial relationship
        don&rsquo;t require sponsor disclosure. If a financial
        relationship exists, disclose. If unclear, disclose to be
        safe.
      </P>

      <H3>Do state medical boards care about physician podcast appearances?</H3>
      <P>
        Some have rules about physician public communication,
        particularly around specialty claims, testimonials, and
        product endorsements. Same rules that apply to other
        public statements apply to podcasts.
      </P>

      <H3>What about transcripts?</H3>
      <P>
        Transcripts published with podcast episodes face the same
        compliance rules as any text marketing. If the audio
        content was compliant, the transcript typically is.
      </P>

      <H3>Can I use podcast content in other marketing?</H3>
      <P>
        Yes, with the same rules applying to the repurposed content.
        Quotes from podcast guests used in other marketing still
        need appropriate framing.
      </P>

      <KeyTakeaways
        items={[
          "Healthcare podcast content is marketing subject to FDA/FTC rules regardless of conversational format.",
          "Unscripted conversation increases risk; pre-recording prep and post-production editing mitigate.",
          "Audio-format disclosures require verbal statement at relevant points, not only in show notes.",
          "Patient guests need HIPAA-compliant authorization and appropriate outcome framing.",
          "Physician guests require state medical board consideration and material-connection disclosure for practice-related discussions.",
        ]}
      />
    </>
  )
}
