import Link from "next/link"
import type { BlogPostMeta } from "@/lib/blog/types"
import {
  H2,
  P,
  Lead,
  UL,
  LI,
  Strong,
  Em,
  Callout,
  BeforeAfter,
  KeyTakeaways,
} from "@/components/blog/prose"

export const meta: BlogPostMeta = {
  slug: "ketamine-clinic-marketing-compliance-guide",
  title:
    "Ketamine Clinic Marketing Compliance Guide: IV Ketamine for Depression Without Triggering an FDA Letter",
  description:
    "A practical, claim-by-claim ketamine clinic marketing compliance guide focused on off-label IV ketamine for depression. Covers the FDA October 2023 communication, Spravato vs racemic ketamine framing, REMS context, and the language patterns that survive a regulator review.",
  excerpt:
    "Most ketamine clinic marketing problems are not exotic - they are six or seven repeated phrases that the FDA October 2023 communication and 2024 enforcement actions have already singled out. This guide focuses on the IV ketamine for depression use case and rewrites the patterns that get clinics in trouble.",
  date: "2026-05-19",
  readingMinutes: 9,
  keywords: [
    "ketamine clinic marketing compliance guide",
    "IV ketamine depression marketing",
    "off-label ketamine advertising rules",
    "Spravato vs ketamine compliance",
    "ketamine REMS marketing",
  ],
  tags: ["Ketamine", "Mental health", "Off-label", "Specialty playbook"],
  author: { name: "RegenCompliance Editorial", role: "FDA/FTC compliance desk" },
  heroLabel: "Modality playbook",
}

export default function Body() {
  return (
    <>
      <Lead>
        Ketamine clinic marketing for depression sits in a narrow,
        well-mapped regulatory corridor. The FDA issued an October 2023
        public communication specifically about compounded ketamine
        products marketed for psychiatric disorders. The FTC has separate
        substantiation rules for outcome and testimonial language. State
        medical boards and the DEA are watching prescribing behavior. The
        good news: the patterns regulators care about are repetitive, and
        you can rewrite around them without losing the marketing message.
      </Lead>

      <P>
        This guide focuses tightly on the IV racemic-ketamine for
        depression use case - the dominant ketamine clinic offering -
        and walks through five compliance pitfalls and the
        rewrites that work in 2026. It is the practical companion to our
        broader{" "}
        <Link
          href="/blog/ketamine-clinic-marketing-compliance"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          ketamine clinic marketing compliance overview
        </Link>{" "}
        and is meant to be read with your live website open in another
        tab.
      </P>

      <Callout variant="warn" title="The October 2023 FDA communication">
        The FDA publicly stated that compounded ketamine products
        marketed for psychiatric disorders are not FDA-approved and that
        certain marketing patterns - safety overstatement, at-home
        use without supervision, equivalence to FDA-approved esketamine
        - create patient risk. That communication is the
        benchmark agency staff are reading current ketamine clinic
        marketing against.
      </Callout>

      <H2 id="pitfall-1-equivalence">Pitfall 1: Conflating racemic ketamine with Spravato</H2>
      <P>
        Spravato (esketamine), the intranasal product from Janssen, is
        FDA-approved for treatment-resistant depression and major
        depressive disorder with acute suicidal ideation, under a
        Risk Evaluation and Mitigation Strategy (REMS) program. Racemic
        ketamine, the molecule used in most IV ketamine clinics, is
        FDA-approved as an anesthetic - not as a psychiatric
        therapy. They are not the same product, not the same legal
        status, and not the same risk profile.
      </P>
      <BeforeAfter
        bad="We offer the same proven depression treatment that the FDA approved in 2019 - delivered in a more comfortable IV format."
        good="Esketamine (Spravato) is FDA-approved for certain forms of depression under a REMS program; the IV ketamine our clinic provides is an off-label use of an FDA-approved anesthetic, prescribed at the clinician's discretion and not subject to the same FDA approval or REMS."
        reason="The bad version implies the IV product carries the FDA approval that actually belongs to a different, intranasal, manufactured drug. That is the equivalence pattern called out in the FDA October 2023 communication."
      />

      <H2 id="pitfall-2-cure">Pitfall 2: Disease cure and outcome guarantee language</H2>
      <P>
        Depression, PTSD, anxiety, and chronic pain are diagnosable
        medical conditions. Claiming to <Em>cure</Em>, <Em>treat</Em>, or{" "}
        <Em>reverse</Em> them with ketamine triggers FDA disease-claim
        rules on top of FTC substantiation requirements. The phrase
        treatment-resistant depression is particularly sharp because it
        is the labeled indication for Spravato but not for racemic
        ketamine.
      </P>
      <BeforeAfter
        bad="Cure your treatment-resistant depression in 6 sessions - guaranteed results or your money back."
        good="Some patients with depression that has not responded to first-line therapies report meaningful symptom relief during a course of IV ketamine. Response rates and durability vary; our clinical team will discuss the published literature and the limits of the evidence during your consultation."
        reason="The bad version cures a labeled diagnosis (disease claim), uses a Spravato-coded indication phrase, and adds a money-back outcome guarantee. The compliant version describes the same offer using subjective-report language and acknowledges variability."
      />

      <H2 id="pitfall-3-safety">Pitfall 3: Safety overstatement</H2>
      <P>
        Ketamine has a defined adverse-event profile: dissociation,
        elevated blood pressure, nausea, lower-urinary-tract effects at
        long-term high dose, and abuse-liability concerns appropriate to
        a Schedule III controlled substance. Marketing that calls IV
        ketamine safe, side-effect-free, or non-addictive is
        contradicted by the labeling and by clinical literature, and is
        a pattern the FDA specifically flagged.
      </P>
      <BeforeAfter
        bad="Ketamine therapy is safe, non-addictive, and has no significant side effects."
        good="Ketamine is a Schedule III controlled substance with a known side-effect profile that includes transient dissociation, increases in blood pressure and heart rate, nausea, and abuse potential. Our protocols include monitoring during and after each infusion."
        reason="The safe-and-side-effect-free framing is one of the recurring patterns in FDA and state-board action against compounded-ketamine marketing. Honest risk disclosure also builds trust with the patient population you want."
      />

      <H2 id="pitfall-4-at-home">Pitfall 4: At-home and unsupervised-use framing</H2>
      <P>
        The FDA October 2023 communication was, in part, a response to
        the rapid growth of mailed and at-home compounded ketamine
        offerings that the agency considered to pose unacceptable
        patient risk. If your clinic ships compounded oral or
        sublingual ketamine for unsupervised home use, the marketing
        cannot present that as a casual or low-friction service.
      </P>
      <BeforeAfter
        bad="Get prescription ketamine delivered to your door - take it whenever you need a reset."
        good="At-home oral ketamine is provided only after in-clinic clinical evaluation, by patient-specific prescription where the prescriber has determined supervised in-clinic delivery is not required for this patient. Compounded ketamine is not FDA-approved for any psychiatric indication."
        reason="A whenever-you-need-a-reset frame is consumer-product language for a Schedule III controlled substance, and reads exactly like the marketing the FDA called out as creating patient risk."
      />

      <H2 id="pitfall-5-testimonials">Pitfall 5: Transformational testimonial copy</H2>
      <P>
        Patient testimonials in mental-health marketing are subject to
        the FTC Endorsement Guides, including the 2023 update that
        tightened material-connection and typical-experience disclosure
        requirements. Dramatic single-patient outcomes presented as
        representative outcomes - without typical-experience
        disclosure and without substantiation - are the exact
        pattern the FTC has actioned in adjacent depression-related
        marketing.
      </P>
      <BeforeAfter
        bad="I had failed every antidepressant for 15 years. After 3 ketamine sessions I am finally free. (typical patient story)"
        good="One patient described meaningful improvement in mood and function after a course of IV ketamine; clinical response rates in published racemic-ketamine literature vary and many patients do not experience this degree of change. Individual outcomes are not predictive of yours."
        reason="The bad version uses a single dramatic outcome as a typical-experience claim. The FTC Endorsement Guides require either typical-experience evidence or clear disclosure that the result is atypical."
      />

      <H2 id="do-dont">Do and don&rsquo;t at a glance</H2>
      <UL>
        <LI>
          <Strong>Do</Strong> distinguish FDA-approved Spravato from
          off-label racemic-ketamine in plain language.
        </LI>
        <LI>
          <Strong>Do</Strong> disclose the controlled-substance status,
          the side-effect profile, and the off-label nature of the use.
        </LI>
        <LI>
          <Strong>Do</Strong> frame patient outcomes as variable and
          individual, with typical-experience disclosure on testimonials.
        </LI>
        <LI>
          <Strong>Don&rsquo;t</Strong> use the labeled Spravato indication
          phrase treatment-resistant depression to describe what your
          IV ketamine program treats.
        </LI>
        <LI>
          <Strong>Don&rsquo;t</Strong> use safe, no-side-effects, or
          non-addictive language for a Schedule III controlled
          substance.
        </LI>
        <LI>
          <Strong>Don&rsquo;t</Strong> market at-home or unsupervised
          ketamine as a low-friction wellness product.
        </LI>
      </UL>

      <Callout variant="success" title="Ketamine rules in the scanner">
        <span>
          RegenCompliance scans ketamine clinic copy for the five
          patterns above plus the FTC Endorsement Guides 2023 updates
          relevant to mental-health testimonials and the platform-policy
          flags that get ketamine campaigns rejected at Google and Meta.{" "}
          <Link
            href="/apply"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            Apply for the founder beta
          </Link>{" "}
          or see all{" "}
          <Link
            href="/coverage"
            className="text-[#55E039] font-semibold hover:underline underline-offset-2"
          >
            modalities we cover
          </Link>
          .
        </span>
      </Callout>

      <H2 id="adjacent">Adjacent reading</H2>
      <P>
        Ketamine clinics frequently operate alongside IV nutrient and
        NAD+ programs. The marketing-language patterns are different but
        the substantiation framework is shared. See our note on the FDA
        position around{" "}
        <Link
          href="/blog/nad-iv-therapy-marketing-fda-position"
          className="text-[#55E039] font-semibold hover:underline underline-offset-2"
        >
          NAD+ IV therapy marketing
        </Link>{" "}
        for the parallel.
      </P>

      <KeyTakeaways
        items={[
          "Racemic IV ketamine is an off-label use of an FDA-approved anesthetic; it is not the same product as FDA-approved Spravato and should never be marketed as if it were.",
          "The FDA October 2023 public communication is the current enforcement benchmark; safety overstatement, at-home framing, and equivalence claims are the specific patterns called out.",
          "Cures depression, treatment-resistant depression, safe, no side effects, and non-addictive are five high-risk phrases to remove from ketamine clinic marketing.",
          "Patient testimonials in this category fall under the FTC Endorsement Guides 2023 update; typical-experience disclosure and material-connection disclosure are not optional.",
          "Disclose the controlled-substance status, the off-label use, and the side-effect profile in lead-level copy, not in 10-point footnotes.",
        ]}
      />
    </>
  )
}
