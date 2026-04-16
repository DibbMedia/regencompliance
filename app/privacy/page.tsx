import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — RegenCompliance",
  description: "Privacy Policy for RegenCompliance, the FDA/FTC compliance scanner for healthcare practices.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">LEGAL</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
            Your privacy matters. This policy explains what data we collect, how we use it, and your rights as a user of RegenCompliance.
          </p>
          <p className="mt-4 text-sm text-white/40">Last Updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-8 lg:p-12 space-y-12">

            {/* 1 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">1. Introduction</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                Dibb Enterprises LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operating as RegenCompliance, provides an FDA/FTC compliance scanning platform for healthcare practices at{" "}
                <span className="text-[#55E039]">compliance.regenportal.com</span>. This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you use our website and services (collectively, the &quot;Service&quot;). By using the Service, you agree to the practices described in this policy.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">2. Information We Collect</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">We collect the following categories of information:</p>
              <div className="space-y-4">
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                  <h3 className="text-sm font-extrabold text-white mb-2">Account Information</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Email address, password (hashed), clinic name, and treatment types offered. This information is collected during account registration and is required to provide the Service.</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                  <h3 className="text-sm font-extrabold text-white mb-2">Scan Content</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Marketing text you submit for compliance scanning, along with scan results, compliance scores, flagged violations, and AI-generated rewrites. This content is stored as part of your audit trail.</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                  <h3 className="text-sm font-extrabold text-white mb-2">Billing Information</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Payment details are collected and processed by Stripe. We do not store your full credit card number, CVC, or other sensitive payment details on our servers. We receive only a payment confirmation, last four digits of your card, and billing address from Stripe.</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                  <h3 className="text-sm font-extrabold text-white mb-2">Usage Data</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Information about how you interact with the Service, including pages visited, features used, scan frequency, and timestamps. This data helps us improve the platform.</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                  <h3 className="text-sm font-extrabold text-white mb-2">Support Communications</h3>
                  <p className="text-sm text-white/60 leading-relaxed">If you contact us for support, we collect the content of your support tickets, including any attachments or screenshots you provide, along with your email address and communication history. This data is used solely to resolve your support request.</p>
                </div>
              </div>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">3. Information We Do NOT Collect</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                RegenCompliance is a marketing compliance tool. We do <strong className="text-white">not</strong> collect, access, process, or store any of the following:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Protected Health Information (PHI) as defined by HIPAA",
                  "Patient data, medical records, or clinical records",
                  "Treatment histories or patient outcomes",
                  "Any data from your EMR, practice management software, or patient databases",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-[#55E039] mt-0.5 shrink-0">&#x2715;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl bg-red-500/5 border border-red-500/15 p-5">
                <p className="text-sm font-extrabold text-red-400 mb-2">HIPAA DISCLAIMER</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  RegenCompliance is <strong className="text-white">NOT</strong> HIPAA compliant and is not designed or intended to process, store, or transmit Protected Health Information (PHI). You must <strong className="text-white">not</strong> submit any content containing patient names, medical records, treatment histories, health conditions tied to identifiable individuals, or any other PHI through the Service. The Service is designed exclusively for analyzing marketing and advertising content. If you inadvertently submit PHI, contact us immediately at{" "}
                  <a href="mailto:support@regencompliance.com" className="text-[#55E039] hover:underline">support@regencompliance.com</a>{" "}
                  so we can delete it from our systems.
                </p>
              </div>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">4. How We Use Your Information</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">We use the information we collect for the following purposes:</p>
              <ul className="space-y-2">
                {[
                  "Providing and operating the Service, including running compliance scans, generating rewrites, and maintaining your audit trail",
                  "Processing payments and managing your subscription through Stripe",
                  "Improving our compliance rules database and scanning accuracy based on aggregated, anonymized scan patterns",
                  "Communicating with you about your account, service updates, and new features",
                  "Responding to support requests and providing customer service",
                  "Enforcing our Terms of Service and protecting against misuse",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-[#55E039] mt-0.5 shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">5. Third-Party Services</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">We use the following third-party service providers to operate the platform:</p>
              <div className="space-y-4">
                {[
                  {
                    name: "Supabase",
                    role: "Database and Authentication",
                    detail: "Stores your account data, scan history, and compliance records. Handles user authentication and session management. Data is encrypted at rest.",
                  },
                  {
                    name: "Stripe",
                    role: "Payment Processing",
                    detail: "Processes all subscription payments and billing. Stripe is PCI-DSS Level 1 certified. We never store your full payment details on our servers.",
                  },
                  {
                    name: "Anthropic (Claude API)",
                    role: "AI Analysis",
                    detail: "Scan content you submit is sent to the Anthropic Claude API for compliance analysis and rewrite generation. Anthropic processes this data according to their API data usage policy and does not use API inputs to train their models.",
                  },
                  {
                    name: "Vercel",
                    role: "Hosting and Deployment",
                    detail: "Hosts the RegenCompliance web application. Vercel provides edge network delivery and serverless function execution for the Service.",
                  },
                ].map((service) => (
                  <div key={service.name} className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-extrabold text-white">{service.name}</h3>
                      <span className="text-xs text-[#55E039]/70">— {service.role}</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{service.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">6. Cookies</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">We use a minimal number of cookies to operate the Service:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 pr-4 text-white/40 font-medium">Cookie</th>
                      <th className="text-left py-3 pr-4 text-white/40 font-medium">Purpose</th>
                      <th className="text-left py-3 text-white/40 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/60">
                    <tr className="border-b border-white/[0.05]">
                      <td className="py-3 pr-4 font-mono text-xs text-[#55E039]/70">regen_demo</td>
                      <td className="py-3 pr-4">Demo session tracking for free compliance scans</td>
                      <td className="py-3">90 days</td>
                    </tr>
                    <tr className="border-b border-white/[0.05]">
                      <td className="py-3 pr-4 font-mono text-xs text-[#55E039]/70">sb-*</td>
                      <td className="py-3 pr-4">Supabase authentication and session management</td>
                      <td className="py-3">Session / persistent</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-xs text-[#55E039]/70">cookie_consent</td>
                      <td className="py-3 pr-4">Records your cookie consent preference</td>
                      <td className="py-3">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                We do not use third-party advertising cookies, tracking pixels, or analytics cookies that share data with external parties.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">7. Data Retention</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                Your scan history, compliance reports, and account data are retained for the duration of your active subscription. If you cancel your account, we retain your data for 30 days to allow for reactivation. After 30 days, your scan history, account data, and all associated records are permanently deleted from our systems. Anonymized, aggregated data that cannot be linked back to your account may be retained indefinitely for the purpose of improving our compliance rules.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">8. Your Rights Under GDPR</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA) or the United Kingdom, you have the following rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="space-y-2">
                {[
                  { right: "Right of Access", desc: "Request a copy of the personal data we hold about you" },
                  { right: "Right to Rectification", desc: "Request correction of inaccurate or incomplete personal data" },
                  { right: "Right to Erasure", desc: "Request deletion of your personal data" },
                  { right: "Right to Data Portability", desc: "Request your data in a structured, machine-readable format. You can also use our built-in data export feature in your account settings to download your scan history and compliance reports at any time" },
                  { right: "Right to Restriction", desc: "Request that we restrict processing of your personal data" },
                  { right: "Right to Object", desc: "Object to processing of your personal data for certain purposes" },
                ].map((item) => (
                  <li key={item.right} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-[#55E039] mt-0.5 shrink-0">&bull;</span>
                    <span><strong className="text-white">{item.right}:</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:support@regencompliance.com" className="text-[#55E039] hover:underline">support@regencompliance.com</a>.
                We will respond within 30 days.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">9. Your Rights Under CCPA</h2>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="space-y-2">
                {[
                  { right: "Right to Know", desc: "Request disclosure of the categories and specific pieces of personal information we have collected about you" },
                  { right: "Right to Delete", desc: "Request deletion of personal information we have collected from you" },
                  { right: "Right to Opt-Out of Sale", desc: "We do not sell your personal information to third parties. There is nothing to opt out of" },
                  { right: "Right to Non-Discrimination", desc: "We will not discriminate against you for exercising any of your CCPA rights" },
                ].map((item) => (
                  <li key={item.right} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-[#55E039] mt-0.5 shrink-0">&bull;</span>
                    <span><strong className="text-white">{item.right}:</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
                To exercise your CCPA rights, contact us at{" "}
                <a href="mailto:support@regencompliance.com" className="text-[#55E039] hover:underline">support@regencompliance.com</a>.
              </p>
            </div>

            {/* 10 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">10. Data Security</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                We take the security of your data seriously. All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security). Data stored in our database is encrypted at rest through Supabase&apos;s built-in encryption. Access to production systems is restricted to authorized personnel and protected by multi-factor authentication. While no system is 100% secure, we implement industry-standard security practices to protect your information.
              </p>
            </div>

            {/* 11 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">11. Children&apos;s Privacy</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                The Service is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information promptly. If you believe a child under 13 has provided us with personal information, please contact us at{" "}
                <a href="mailto:support@regencompliance.com" className="text-[#55E039] hover:underline">support@regencompliance.com</a>.
              </p>
            </div>

            {/* 12 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">12. Changes to This Policy</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will notify you by email and/or through an in-app notification at least 14 days before the changes take effect. The &quot;Effective Date&quot; at the top of this policy indicates when it was last updated. Your continued use of the Service after changes take effect constitutes acceptance of the revised policy.
              </p>
            </div>

            {/* 13 */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">13. Contact Us</h2>
              <p className="text-[15px] text-white/70 leading-relaxed">
                For any questions about this Privacy Policy, to exercise your data rights, or to submit a data-related request, contact us at:
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
