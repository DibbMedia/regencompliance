# Welcome email sequence — drafts

Ready to drop into Resend (or any ESP) when the email layer lands. Each email has a subject line, preview text, and body. Markdown-friendly. Replace `{{first_name}}`, `{{clinic_name}}`, `{{dashboard_url}}` at send time.

---

## Email 1 — Immediate (sent within 60 seconds of Stripe webhook confirming active subscription)

**Subject:** Welcome, {{first_name}} &mdash; your first scan takes 30 seconds

**Preview text:** Your $297/mo founding rate is locked in for life. Here&rsquo;s how to run your first scan before lunch.

**From:** RegenCompliance &lt;seo@dibbmedia.com&gt;

---

Hi {{first_name}},

Welcome to RegenCompliance. Your $297/mo founding rate is locked in &mdash; that rate stays at $297/mo for life, even when we move to $497/mo for new customers.

**Step 1: Run your first scan.** Head to your dashboard at {{dashboard_url}} and either:

- Paste your homepage hero copy and click scan, or
- Enter your clinic&rsquo;s website URL and let us scan the page, or
- Click one of the three sample scans on your dashboard (pre-populated with real violating copy, useful for seeing the flagging style)

**Step 2: Ask for a rewrite.** When the scanner flags violations, hit &ldquo;Rewrite for Compliance&rdquo; and Claude Sonnet will produce a compliant alternative that preserves your voice.

**Step 3: Add your site for weekly monitoring.** Under **Dashboard → Sites**, add your clinic&rsquo;s domain. We&rsquo;ll re-scan every page weekly and flag any new issues as they appear.

Three things to know up front:
- **This is an educational compliance tool.** It catches the pattern-matchable violations cheaply so your attorney&rsquo;s time is spent on judgment calls. It does not replace final legal review.
- **Your content is never used to train AI.** Anthropic&rsquo;s no-training flag is set on every request.
- **If you hit any problem**, reply to this email directly &mdash; I read every one.

Onward,
Dibb
RegenCompliance

---

## Email 2 — Day 2 (if no scans completed yet)

**Subject:** Have you run a scan yet, {{first_name}}?

**Preview text:** The average first scan on a healthcare practice website finds 12&ndash;25 compliance violations.

---

Hi {{first_name}},

Quick check-in. Your RegenCompliance account is live but I don&rsquo;t see any scans yet.

The thing I hear most from new customers is &ldquo;I was shocked at what was sitting on my homepage.&rdquo; Across all the clinics that have run first scans, the average first scan finds 12&ndash;25 violations. Some find more.

**The 30-second test:**
1. Open {{dashboard_url}}
2. Click **Scanner**
3. Click **Scan URL**, paste your homepage URL
4. Hit scan

You&rsquo;ll have your first compliance report in under a minute. If you see anything that surprises you, you&rsquo;re getting value from the tool immediately.

If you hit a problem &mdash; or if you&rsquo;d like me to run a demo scan on your site and walk you through the results &mdash; just reply to this email.

Dibb

---

## Email 3 — Day 5 (if first scan completed but no rewrite used yet)

**Subject:** One click from compliant copy

**Preview text:** Your scanner found flagged content. The rewrite is one click away.

---

Hi {{first_name}},

You&rsquo;ve run your first scan and the scanner flagged some content &mdash; that&rsquo;s normal and expected. The next step is where the tool earns its keep.

**The rewrite feature:** open any scan from your **History**, find a flagged phrase, and hit **Rewrite for Compliance**. Claude Sonnet will regenerate the content under a compliance-aware prompt, preserving your brand voice while removing the flagged language.

A few tips:
- Rewrites work on the full scanned content, not one phrase at a time. So you get back a single paragraph ready to paste back into your site or post.
- If the rewrite doesn&rsquo;t match your voice, you can manually edit it or run it again &mdash; each rewrite is independently generated.
- Keep the original in your audit trail. Our export includes both the original flagged content and the compliant rewrite, which is useful if a regulator ever asks for documentation.

When you&rsquo;re ready to go live with a rewrite, just paste it into your CMS. That&rsquo;s the workflow.

Dibb

---

## Email 4 — Day 14 (if no site monitoring set up)

**Subject:** The pages you haven&rsquo;t scanned yet

**Preview text:** Weekly automated scans of every page on your site &mdash; set up once, runs forever.

---

Hi {{first_name}},

Most of our customers run ad-hoc scans on new content and forget about the 40 pages of old content sitting on their site. Those old pages are the ones that trigger warning letters &mdash; they were written under different rules and never got revisited.

**Fix that once:** go to **Dashboard → Sites**, add your domain, and we&rsquo;ll crawl every page and re-scan them all weekly. New violations show up in your notifications, you review them in the scanner, and you fix what needs fixing.

Setup takes 90 seconds. Weekly scans are unlimited at your plan. The cost of the site you never audited finding a warning letter is $50K&ndash;$150K. The cost of setting this up is 90 seconds.

Dibb

---

## Email 5 — Day 30 (renewal awareness + case reinforcement)

**Subject:** You&rsquo;ve had RegenCompliance for 30 days

**Preview text:** Quick stats, what&rsquo;s coming next, and the money-back guarantee reminder.

---

Hi {{first_name}},

You&rsquo;ve had RegenCompliance for 30 days. Quick stats from your account:

- **Scans run:** {{scan_count}}
- **Violations caught:** {{total_flags}}
- **Average compliance score:** {{avg_score}}
- **Rewrites generated:** {{rewrite_count}}

If you&rsquo;re getting value, keep going. Your founding rate is locked at $297/mo for life.

If you&rsquo;re not, today is the last day of the 30-day money-back guarantee. Reply to this email and I&rsquo;ll process a full refund &mdash; no forms, no retention scripts, no questions asked.

I&rsquo;d rather hear why the tool didn&rsquo;t land for you than lose the feedback. Your reply matters.

Dibb

---

## Transactional templates (non-sequence)

### Password reset

**Subject:** Reset your RegenCompliance password

Your password reset link: {{reset_url}}

This link expires in 60 minutes. If you didn&rsquo;t request it, ignore this email &mdash; your password stays unchanged.

### Failed payment retry

**Subject:** Your RegenCompliance payment didn&rsquo;t go through

Hi {{first_name}},

We tried to process your monthly payment and it was declined. To keep your access uninterrupted, update your payment method at {{billing_portal_url}}.

If the card is just expired, Stripe will auto-retry the next day. If it&rsquo;s something else, log in and update to avoid a service interruption on day 7.

Any questions, reply directly.

Dibb

### Team invite

**Subject:** {{inviter_name}} invited you to {{clinic_name}} on RegenCompliance

{{inviter_name}} added you as a team member on {{clinic_name}}&rsquo;s RegenCompliance account.

Accept your invite: {{accept_url}}

This gives you access to the compliance scanner, AI rewrites, and the full scan history for your clinic. This link expires in 7 days.

### Monthly digest

**Subject:** {{clinic_name}} compliance monthly &mdash; {{month}}

Hi team,

Quick roll-up of last month:

- **Scans:** {{scan_count}} ({{scan_delta_pct}}% vs previous month)
- **Average score:** {{avg_score}} ({{score_delta}} points vs previous month)
- **Violations caught:** {{flag_count}}
- **Most common violation:** {{top_flag}}
- **Monitored sites drift:** {{sites_with_new_flags}} site(s) saw new issues

Full trend data: {{dashboard_trends_url}}

---

## Activation triggers

These trigger sends from Resend. Event model the app needs to fire:

| Trigger | Event name | Fire from |
| --- | --- | --- |
| Email 1 | `subscription.activated` | Stripe webhook handler, after idempotent check |
| Email 2 | `user.no_scans_day_2` | Daily cron job checking `scans` table |
| Email 3 | `user.scan_without_rewrite_day_5` | Daily cron |
| Email 4 | `user.no_site_added_day_14` | Daily cron |
| Email 5 | `user.day_30_check_in` | Daily cron, gated on subscription age |
| Password reset | `auth.password_reset_requested` | Supabase auth hook |
| Failed payment | `subscription.payment_failed` | Stripe webhook |
| Team invite | `team.member_invited` | /api/team/invite handler |
| Monthly digest | `cron.monthly_digest` | First of the month cron |

## Compliance notes for the email content itself

Ironically, the emails themselves have to be compliant. These drafts already follow the rules:

- No &ldquo;cures&rdquo; / &ldquo;heals&rdquo; language (educational tool positioning).
- No guarantees beyond the commercial 30-day money-back (bounded).
- No patient-outcome claims or testimonials.
- Zero PHI references.
- Attorney-replacement disclosure in Email 1 (&ldquo;does not replace final legal review&rdquo;).

If edits are made, run them through the scanner before scheduling.
