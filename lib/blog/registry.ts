import type { BlogPostModule } from "./types"
import FdaWarningLettersBody, {
  meta as fdaWarningLettersMeta,
} from "./posts/fda-warning-letters-2026"
import FtcSettlementBody, {
  meta as ftcSettlementMeta,
} from "./posts/ftc-stem-cell-settlement"
import StructureFunctionBody, {
  meta as structureFunctionMeta,
} from "./posts/structure-function-vs-disease-claims"
import BannedWordsBody, {
  meta as bannedWordsMeta,
} from "./posts/banned-words-healthcare-marketing-2026"
import AuditFrameworkBody, {
  meta as auditFrameworkMeta,
} from "./posts/healthcare-website-compliance-audit-framework"
import MedSpaBody, {
  meta as medSpaMeta,
} from "./posts/med-spa-marketing-compliance-risk"
import StemCellBody, {
  meta as stemCellMeta,
} from "./posts/stem-cell-marketing-costly-phrases"
import Glp1Body, {
  meta as glp1Meta,
} from "./posts/glp-1-semaglutide-marketing-compliance"
import BeforeAfterBody, {
  meta as beforeAfterMeta,
} from "./posts/before-after-photos-compliance"
import TestimonialBody, {
  meta as testimonialMeta,
} from "./posts/healthcare-testimonial-compliance"
import InstagramTiktokBody, {
  meta as instagramTiktokMeta,
} from "./posts/instagram-tiktok-healthcare-ads-compliance"
import DentalBody, {
  meta as dentalMeta,
} from "./posts/dental-longevity-claims-compliance"
import WellbeingBody, {
  meta as wellbeingMeta,
} from "./posts/wellbeing-corporation-ftc-settlement-deep-dive"
import HctPCampaignBody, {
  meta as hctPCampaignMeta,
} from "./posts/fda-hct-p-warning-letter-campaign"
import JennyCraigBody, {
  meta as jennyCraigMeta,
} from "./posts/jenny-craig-ftc-weight-loss-precedent"
import PomWonderfulBody, {
  meta as pomWonderfulMeta,
} from "./posts/pom-wonderful-ftc-substantiation-standard"
import BotoxBody, {
  meta as botoxMeta,
} from "./posts/botox-advertising-compliance"
import OzempicBody, {
  meta as ozempicMeta,
} from "./posts/ozempic-wegovy-brand-name-advertising"
import FdaApprovedVsClearedBody, {
  meta as fdaApprovedVsClearedMeta,
} from "./posts/fda-approved-vs-fda-cleared-aesthetic-devices"
import NadPlusBody, {
  meta as nadPlusMeta,
} from "./posts/nad-plus-marketing-compliance"
import MetaAdsBody, {
  meta as metaAdsMeta,
} from "./posts/meta-ads-healthcare-compliance-policy"
import GoogleAdsBody, {
  meta as googleAdsMeta,
} from "./posts/google-ads-healthcare-advertising-policy"
import WarningLetterResponseBody, {
  meta as warningLetterResponseMeta,
} from "./posts/how-to-respond-to-fda-warning-letter"
import SocialMediaAuditBody, {
  meta as socialMediaAuditMeta,
} from "./posts/healthcare-social-media-compliance-audit"
import ExosomeBody, {
  meta as exosomeMeta,
} from "./posts/exosome-marketing-compliance"
import PrpBody, {
  meta as prpMeta,
} from "./posts/prp-injection-marketing-compliance"
import BodyContouringBody, {
  meta as bodyContouringMeta,
} from "./posts/body-contouring-marketing-compliance"
import HrtBody, {
  meta as hrtMeta,
} from "./posts/hormone-replacement-therapy-marketing-compliance"
import KetamineBody, {
  meta as ketamineMeta,
} from "./posts/ketamine-clinic-marketing-compliance"
import PeptideBody, {
  meta as peptideMeta,
} from "./posts/peptide-therapy-marketing-compliance"
import HairRestorationBody, {
  meta as hairRestorationMeta,
} from "./posts/hair-restoration-marketing-compliance"
import TrainingBody, {
  meta as trainingMeta,
} from "./posts/healthcare-marketing-compliance-training"
import StyleGuideBody, {
  meta as styleGuideMeta,
} from "./posts/healthcare-marketing-style-guide"
import PrePublishBody, {
  meta as prePublishMeta,
} from "./posts/pre-publish-compliance-checklist"
import NegativeReviewsBody, {
  meta as negativeReviewsMeta,
} from "./posts/responding-to-negative-reviews-hipaa-ftc"
import AboutPageBody, {
  meta as aboutPageMeta,
} from "./posts/healthcare-about-page-compliance"
import EndorsementGuides2023Body, {
  meta as endorsementGuides2023Meta,
} from "./posts/ftc-endorsement-guides-2023-update"
import HipaaMarketingBody, {
  meta as hipaaMarketingMeta,
} from "./posts/hipaa-marketing-rule-healthcare-practices"
import StateBoardsBody, {
  meta as stateBoardsMeta,
} from "./posts/state-medical-board-advertising-rules-overview"
import RegenSciencesBody, {
  meta as regenSciencesMeta,
} from "./posts/regenerative-sciences-v-fda-case-study"
import StateAgBody, {
  meta as stateAgMeta,
} from "./posts/state-ag-healthcare-enforcement-2024-2026"
import EnforcementTrends2026Body, {
  meta as enforcementTrends2026Meta,
} from "./posts/2026-healthcare-enforcement-trends"
import KimeraBody, {
  meta as kimeraMeta,
} from "./posts/kimera-labs-fda-enforcement-analysis"
import MedSpaEnforcementBody, {
  meta as medSpaEnforcementMeta,
} from "./posts/ftc-med-spa-enforcement-patterns-2024-2026"

export const POSTS: BlogPostModule[] = [
  { meta: fdaWarningLettersMeta, Body: FdaWarningLettersBody },
  { meta: ftcSettlementMeta, Body: FtcSettlementBody },
  { meta: structureFunctionMeta, Body: StructureFunctionBody },
  { meta: bannedWordsMeta, Body: BannedWordsBody },
  { meta: auditFrameworkMeta, Body: AuditFrameworkBody },
  { meta: medSpaMeta, Body: MedSpaBody },
  { meta: stemCellMeta, Body: StemCellBody },
  { meta: glp1Meta, Body: Glp1Body },
  { meta: beforeAfterMeta, Body: BeforeAfterBody },
  { meta: testimonialMeta, Body: TestimonialBody },
  { meta: instagramTiktokMeta, Body: InstagramTiktokBody },
  { meta: dentalMeta, Body: DentalBody },
  { meta: wellbeingMeta, Body: WellbeingBody },
  { meta: hctPCampaignMeta, Body: HctPCampaignBody },
  { meta: jennyCraigMeta, Body: JennyCraigBody },
  { meta: pomWonderfulMeta, Body: PomWonderfulBody },
  { meta: botoxMeta, Body: BotoxBody },
  { meta: ozempicMeta, Body: OzempicBody },
  { meta: fdaApprovedVsClearedMeta, Body: FdaApprovedVsClearedBody },
  { meta: nadPlusMeta, Body: NadPlusBody },
  { meta: metaAdsMeta, Body: MetaAdsBody },
  { meta: googleAdsMeta, Body: GoogleAdsBody },
  { meta: warningLetterResponseMeta, Body: WarningLetterResponseBody },
  { meta: socialMediaAuditMeta, Body: SocialMediaAuditBody },
  { meta: exosomeMeta, Body: ExosomeBody },
  { meta: prpMeta, Body: PrpBody },
  { meta: bodyContouringMeta, Body: BodyContouringBody },
  { meta: hrtMeta, Body: HrtBody },
  { meta: ketamineMeta, Body: KetamineBody },
  { meta: peptideMeta, Body: PeptideBody },
  { meta: hairRestorationMeta, Body: HairRestorationBody },
  { meta: trainingMeta, Body: TrainingBody },
  { meta: styleGuideMeta, Body: StyleGuideBody },
  { meta: prePublishMeta, Body: PrePublishBody },
  { meta: negativeReviewsMeta, Body: NegativeReviewsBody },
  { meta: aboutPageMeta, Body: AboutPageBody },
  { meta: endorsementGuides2023Meta, Body: EndorsementGuides2023Body },
  { meta: hipaaMarketingMeta, Body: HipaaMarketingBody },
  { meta: stateBoardsMeta, Body: StateBoardsBody },
  { meta: regenSciencesMeta, Body: RegenSciencesBody },
  { meta: stateAgMeta, Body: StateAgBody },
  { meta: enforcementTrends2026Meta, Body: EnforcementTrends2026Body },
  { meta: kimeraMeta, Body: KimeraBody },
  { meta: medSpaEnforcementMeta, Body: MedSpaEnforcementBody },
]

export const POSTS_SORTED = [...POSTS].sort(
  (a, b) => +new Date(b.meta.date) - +new Date(a.meta.date),
)

export function getPostBySlug(slug: string): BlogPostModule | undefined {
  return POSTS.find((p) => p.meta.slug === slug)
}

export function getRelated(slug: string, limit = 3) {
  return POSTS_SORTED.filter((p) => p.meta.slug !== slug)
    .slice(0, limit)
    .map((p) => ({
      slug: p.meta.slug,
      title: p.meta.title,
      excerpt: p.meta.excerpt,
    }))
}
