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
