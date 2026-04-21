import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import Link from "next/link"

export const metadata = {
  title: "Terms of Service — RegenCompliance",
  description: "Terms of Service for RegenCompliance, the FDA/FTC compliance scanner for healthcare practices.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">LEGAL</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
            Terms of Service
          </h1>
          <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
            Please read these terms carefully before using RegenCompliance. By accessing or using our Service, you agree to be bound by these terms.
          </p>
          <p className="mt-4 text-sm text-white/60">Last Updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-8 lg:p-12 space-y-12">

            {/* 1 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Dibb Enterprises LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operating as RegenCompliance. By creating an account, accessing, or using the RegenCompliance platform at compliance.regenportal.com (the &quot;Service&quot;), you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">2. Description of Service</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                RegenCompliance is an educational compliance scanning platform designed for healthcare practices. The Service analyzes user-submitted marketing text against a database of FDA and FTC compliance rules and generates compliance reports, scores, and AI-powered rewrite suggestions.
              </p>
              <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-5">
                <p className="text-sm font-extrabold text-red-400 mb-2">IMPORTANT DISCLAIMER</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  RegenCompliance is an educational tool. It is <strong className="text-white">NOT</strong> legal advice, does <strong className="text-white">NOT</strong> constitute legal counsel, and is <strong className="text-white">NOT</strong> a substitute for a qualified healthcare marketing attorney. Compliance determinations provided by the Service are informational in nature. You should always consult with qualified legal counsel before making final decisions about your marketing content.
                </p>
              </div>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">3. Account Registration and Responsibilities</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                To access the full features of the Service, you must create an account. When registering, you agree to:
              </p>
              <ul className="space-y-2">
                {[
                  "Provide accurate and complete information during registration",
                  "Keep your login credentials secure and confidential",
                  "Notify us immediately of any unauthorized access to your account",
                  "Accept responsibility for all activity that occurs under your account",
                  "Not share your account credentials with anyone outside your authorized team seats",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-[#55E039] mt-0.5 shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your team seats to authorized individuals only.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">4. Subscription and Billing</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                The Service is offered as a paid subscription. Current pricing options are:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                  <p className="text-sm font-extrabold text-white mb-1">Monthly Subscription</p>
                  <p className="text-2xl font-extrabold text-[#55E039]">$497<span className="text-sm text-white/40 font-medium">/mo</span></p>
                  <p className="text-xs text-white/40 mt-1">Cancel anytime. No long-term commitment.</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-[#55E039]/20 p-5">
                  <p className="text-sm font-extrabold text-white mb-1">Beta Founding Member</p>
                  <p className="text-2xl font-extrabold text-[#55E039]">$297<span className="text-sm text-white/40 font-medium">/mo</span></p>
                  <p className="text-xs text-white/40 mt-1">Limited to 25 spots. Rate locked in for life.</p>
                </div>
              </div>
              <p className="text-[15px] text-white/70 leading-relaxed">
                All payments are processed through Stripe. Subscriptions are billed in advance on a recurring monthly basis. You may cancel your subscription at any time from your account settings. Upon cancellation, your access continues through the end of your current billing period. Refunds are available within 30 days of initial purchase per our money-back guarantee.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">5. Beta Program Terms</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                The RegenCompliance Beta Program offers access to the platform at a locked-in monthly rate of $297/mo. This offer is limited to 25 founding member spots. Beta founding members receive access to all core compliance scanning features, including the scanner, AI rewriter, compliance library, and audit trail. The beta rate of $297/mo is locked in for life and will never increase, even when the standard rate rises to $497/mo. &quot;Locked-in for life&quot; means the rate remains $297/mo for as long as the subscription remains active and the RegenCompliance platform is commercially available, subject to fair use. Fair use means reasonable personal or single-clinic use; we reserve the right to impose rate limits or usage caps if usage significantly exceeds normal patterns (for example, automated bulk scanning via scripts). Beta features and availability are subject to change. We reserve the right to discontinue the beta program at any time, but existing founding members will retain their locked-in rate.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">6. Acceptable Use</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                You agree not to use the Service for any of the following purposes:
              </p>
              <ul className="space-y-2">
                {[
                  "Scraping, crawling, or automated data extraction from the platform",
                  "Reverse engineering, decompiling, or attempting to extract the source code of the Service",
                  "Sharing your account credentials or allowing unauthorized third parties to access the Service through your account",
                  "Using the Service to build a competing product or service",
                  "Submitting content containing Protected Health Information (PHI), patient data, or any personally identifiable health information — the Service is NOT HIPAA compliant",
                  "Submitting content that is illegal, abusive, or violates third-party rights",
                  "Attempting to bypass security measures, rate limits, or access restrictions",
                  "Reselling, sublicensing, or redistributing access to the Service",
                  "Using the Service in a manner that disrupts or degrades performance for other users",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-[#55E039] mt-0.5 shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                Violation of these acceptable use terms may result in immediate account suspension or termination without refund.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">7. Intellectual Property</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                <strong className="text-white">Our Property:</strong> The RegenCompliance platform, including its design, code, compliance rules database, algorithms, branding, and documentation, is the exclusive property of Dibb Enterprises LLC. All rights are reserved. You may not copy, modify, distribute, or create derivative works based on our platform without prior written consent.
              </p>
              <p className="text-[15px] text-white/70 leading-relaxed">
                <strong className="text-white">Your Content:</strong> You retain full ownership of the marketing content you submit for scanning. By submitting content to the Service, you grant us a limited, non-exclusive license to process your content solely for the purpose of providing the compliance scanning service. We do not claim ownership of your content, and we do not use your content for any purpose other than delivering the Service.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">8. Disclaimer of Warranties</h2>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <p className="text-sm text-white/60 leading-relaxed uppercase">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY.
                </p>
              </div>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                We do not warrant that the Service will be uninterrupted, error-free, or completely secure. Compliance determinations provided by the Service are educational in nature and should not be relied upon as legal advice. We do not guarantee that following our recommendations will prevent regulatory action. The regulatory landscape changes constantly, and while we update our rules daily, there may be emerging enforcement trends not yet reflected in our database.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DIBB ENTERPRISES LLC AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
              </p>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE SERVICE EXCEED THE TOTAL AMOUNT YOU PAID TO US DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
              </p>
            </div>

            {/* 10 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">10. Indemnification</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Dibb Enterprises LLC, its officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; (d) your marketing content or any content you submit through the Service; or (e) any third-party claim arising from your marketing activities, regardless of whether such content was scanned through the Service.
              </p>
            </div>

            {/* 11 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">11. Termination</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                <strong className="text-white">By You:</strong> You may cancel your subscription and close your account at any time from your account settings. Your access continues through the end of your current billing period. After cancellation, your data is retained for 30 days and then permanently deleted.
              </p>
              <p className="text-[15px] text-white/70 leading-relaxed">
                <strong className="text-white">By Us:</strong> We reserve the right to suspend or terminate your account immediately, without prior notice, if you violate these Terms, engage in fraudulent activity, or use the Service in a manner that threatens the security or integrity of the platform. In the case of termination for cause, no refund will be provided for the remaining subscription period.
              </p>
            </div>

            {/* 12 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">12. Data Handling</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="text-[#55E039] hover:underline">Privacy Policy</Link>,
                which describes how we collect, use, and protect your personal information. By using the Service, you consent to the data practices described in the Privacy Policy.
              </p>
            </div>

            {/* 13 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">13. Governing Law</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any legal action or proceeding relating to these Terms shall be brought exclusively in the federal or state courts located in the State of Delaware, and you consent to the personal jurisdiction of such courts.
              </p>
            </div>

            {/* 14 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">14. Dispute Resolution</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association (AAA). The arbitration shall be conducted in the State of Delaware. The arbitrator&apos;s decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
              </p>
              <p className="text-[15px] text-white/70 leading-relaxed">
                <strong className="text-white">Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You waive any right to participate in a class action lawsuit or class-wide arbitration against Dibb Enterprises LLC.
              </p>
            </div>

            {/* 15 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">15. Changes to These Terms</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                We may update these Terms from time to time. When we make material changes, we will notify you by email and/or through an in-app notification at least 14 days before the changes take effect. Your continued use of the Service after the updated Terms become effective constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Service and cancel your account.
              </p>
            </div>

            {/* 16 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">16. Severability</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining provisions of these Terms remain in full force and effect.
              </p>
            </div>

            {/* 17 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">17. Contact Us</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                For any questions about these Terms of Service, contact us at:
              </p>
              <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <p className="text-sm text-white font-bold">Dibb Enterprises LLC</p>
                <p className="text-sm text-white/60 mt-1">Operating as RegenCompliance</p>
                <p className="text-sm text-white/60 mt-1">
                  Email:{" "}
                  <a href="mailto:support@regencompliance.com" className="text-[#55E039] hover:underline">support@regencompliance.com</a>
                </p>
                <p className="text-sm text-white/60 mt-1">
                  Website:{" "}
                  <a href="https://compliance.regenportal.com" className="text-[#55E039] hover:underline">compliance.regenportal.com</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
