export interface ContentTemplate {
  id: string
  title: string
  category: "service" | "marketing" | "ads"
  description: string
  content: string
  notes: string
  wordCount: number
}

const SERVICE_TEMPLATES: ContentTemplate[] = [
  {
    id: "prp-therapy",
    title: "PRP Therapy Services",
    category: "service",
    description:
      "Compliant service page copy for Platelet-Rich Plasma (PRP) therapy offerings.",
    content: `[CLINIC NAME] - PRP Therapy Services

Platelet-Rich Plasma (PRP) Therapy

At [CLINIC NAME], we offer Platelet-Rich Plasma (PRP) therapy as part of our regenerative medicine services. PRP therapy is a procedure that uses a concentrated preparation of your own platelets to support the body's natural healing processes.

How PRP Therapy Works

PRP therapy involves drawing a small sample of your blood, which is then processed in a centrifuge to concentrate the platelets. This platelet-rich preparation is then applied to the treatment area. Platelets contain growth factors that play a role in tissue repair and regeneration.

Potential Applications

PRP therapy has been studied for a variety of applications, including:
- Musculoskeletal conditions such as joint discomfort and soft tissue concerns
- Hair restoration support
- Skin rejuvenation and aesthetic applications
- Post-surgical recovery support

What to Expect

During your consultation, our medical team will evaluate your health history and discuss whether PRP therapy may be appropriate for your individual situation. Treatment plans are customized based on your specific needs and goals.

Individual results may vary. The number of sessions recommended will depend on your condition and treatment goals. Our team will provide you with detailed information about the procedure, expected timeline, and any potential considerations.

Schedule a Consultation

Contact [CLINIC NAME] today to schedule a consultation and learn more about whether PRP therapy may be right for you.

IMPORTANT DISCLAIMERS:
- Individual results may vary and are not guaranteed.
- PRP therapy is not FDA-approved for all applications. Some uses are considered investigational.
- This information is for educational purposes only and does not constitute medical advice.
- A consultation with a qualified healthcare provider is necessary to determine if this treatment is appropriate for you.`,
    notes:
      'Replace [CLINIC NAME] with your clinic name. Customize the "Potential Applications" list based on services you actually offer. Do NOT add cure/treatment claims. Keep language educational.',
    wordCount: 0,
  },
  {
    id: "stem-cell-therapy",
    title: "Stem Cell Therapy Information",
    category: "service",
    description:
      "Educational, compliant content about stem cell therapy services.",
    content: `[CLINIC NAME] - Stem Cell Therapy Information

Understanding Stem Cell Therapy

[CLINIC NAME] provides information and services related to stem cell therapy as part of our regenerative medicine practice. Stem cell therapy is an evolving field of medicine that explores the potential of stem cells to support the body's natural repair mechanisms.

What Are Stem Cells?

Stem cells are undifferentiated cells that have the ability to develop into specialized cell types. They are found naturally in various tissues throughout the body. In regenerative medicine, stem cells are studied for their potential role in supporting tissue repair and regeneration.

Our Approach

At [CLINIC NAME], we follow evidence-based protocols and maintain compliance with all applicable regulatory guidelines. Our medical team stays current with the latest research and regulatory developments in regenerative medicine.

We offer consultations to help patients understand:
- What stem cell therapy involves
- Current research and evidence
- Potential benefits and limitations
- Whether this approach may be suitable for their situation

Important Regulatory Information

The FDA regulates stem cell products and therapies. Some stem cell treatments are FDA-approved for specific indications, while others remain investigational. We are committed to transparency about the regulatory status of any treatments we discuss or offer.

Patients should be aware that:
- Not all stem cell therapies are FDA-approved
- The science of stem cell therapy is still evolving
- Results vary by individual and are not guaranteed
- A thorough medical evaluation is required before any treatment recommendation

Schedule Your Consultation

We encourage patients to ask questions and make informed decisions about their healthcare. Contact [CLINIC NAME] to schedule an educational consultation.

DISCLAIMERS:
- This content is for informational and educational purposes only.
- Individual results vary and are not guaranteed.
- Stem cell therapy may not be FDA-approved for all advertised conditions.
- This information does not constitute medical advice, diagnosis, or treatment recommendations.
- Consult with a qualified healthcare provider regarding your specific medical condition.`,
    notes:
      "Replace [CLINIC NAME]. This template is intentionally educational in tone. Do NOT add claims about curing or treating specific diseases. The FDA closely monitors stem cell marketing claims.",
    wordCount: 0,
  },
  {
    id: "exosome-therapy",
    title: "Exosome Therapy Overview",
    category: "service",
    description:
      "Education-only content about exosome therapy (no treatment claims per FDA guidance).",
    content: `[CLINIC NAME] - Understanding Exosome Therapy

What Are Exosomes?

Exosomes are small extracellular vesicles naturally produced by cells in the body. They play a role in cell-to-cell communication and carry proteins, lipids, and genetic material between cells. Research into exosomes is an active and growing area of biomedical science.

Current State of Research

The scientific community is actively studying exosomes for their potential applications in various areas of medicine. Published research has explored their role in:
- Cellular communication and signaling
- Tissue repair and regeneration processes
- Immune system modulation

It is important to note that exosome-based therapies are currently in various stages of research and development. The FDA has issued guidance regarding the marketing and use of exosome products.

Regulatory Considerations

As of the latest FDA guidance:
- Exosome products are regulated as biological products
- There are currently NO FDA-approved exosome products for therapeutic use
- The FDA has warned against unapproved exosome products marketed for therapeutic purposes
- Patients should exercise caution regarding claims made about exosome treatments

Our Commitment to Education

At [CLINIC NAME], we believe in providing accurate, up-to-date information to help patients understand emerging areas of medicine. We follow all applicable regulations and are committed to transparent communication about the current state of evidence for any services we discuss.

We encourage patients to:
- Ask questions about the evidence behind any treatment
- Understand the difference between FDA-approved and investigational therapies
- Make informed decisions in consultation with qualified healthcare providers
- Report any adverse events to the FDA's MedWatch program

Learn More

Contact [CLINIC NAME] for an educational consultation where our medical team can discuss the latest research and help you understand your options.

DISCLAIMERS:
- This content is strictly for educational and informational purposes.
- There are currently no FDA-approved exosome products for clinical use.
- This information does not constitute medical advice or a treatment recommendation.
- Individual health decisions should be made in consultation with a qualified healthcare provider.
- [CLINIC NAME] follows all applicable FDA and FTC regulations.`,
    notes:
      "Replace [CLINIC NAME]. CRITICAL: Exosomes are under heavy FDA scrutiny. This template is education-only by design. Do NOT add treatment claims, cure claims, or before/after results for exosome therapy.",
    wordCount: 0,
  },
  {
    id: "peptide-therapy",
    title: "Peptide Therapy Information",
    category: "service",
    description:
      "Education-only content for peptide therapy services.",
    content: `[CLINIC NAME] - Peptide Therapy Information

Understanding Peptide Therapy

Peptides are short chains of amino acids that occur naturally in the body and play various roles in biological processes. Peptide therapy involves the use of specific peptides to support various physiological functions.

How Peptides Work

Peptides act as signaling molecules in the body, communicating with cells to influence various biological processes. Different peptides may target different systems and functions. Research continues to explore their potential applications in:
- Supporting metabolic function
- Promoting tissue repair processes
- Supporting immune function
- Anti-aging and wellness applications

Our Approach to Peptide Therapy

At [CLINIC NAME], we offer peptide therapy as part of a comprehensive, medically supervised wellness program. Our approach includes:

1. Comprehensive Evaluation - A thorough review of your health history, current concerns, and goals
2. Personalized Protocol - Customized peptide protocols based on your individual needs
3. Medical Supervision - All treatments are overseen by licensed healthcare providers
4. Ongoing Monitoring - Regular follow-up to assess progress and adjust protocols as needed

Regulatory Information

Peptide therapy is a regulated area of medicine. Some peptides are FDA-approved for specific indications, while others may be available through compounding pharmacies under physician supervision. We comply with all applicable state and federal regulations regarding peptide prescribing and administration.

Patients should understand that:
- Not all peptides are FDA-approved for all uses
- Results vary by individual
- Medical supervision is required
- Peptide therapy is not a substitute for a healthy lifestyle

Schedule a Consultation

Interested in learning more? Contact [CLINIC NAME] to schedule a consultation with our medical team.

DISCLAIMERS:
- Individual results may vary and are not guaranteed.
- Peptide therapy requires medical supervision and a valid prescription.
- This information is for educational purposes and does not constitute medical advice.
- Some peptides discussed may not be FDA-approved for all mentioned applications.
- Consult with a qualified healthcare provider before beginning any new treatment.`,
    notes:
      "Replace [CLINIC NAME]. Peptide regulations vary by state and specific peptide compound. Avoid naming specific peptides unless you confirm they are legal to prescribe in your state. The FDA has restricted certain peptides from compounding.",
    wordCount: 0,
  },
  {
    id: "iv-therapy-nad",
    title: "IV Therapy & NAD+",
    category: "service",
    description:
      "Wellness-framed content for IV therapy and NAD+ infusion services.",
    content: `[CLINIC NAME] - IV Therapy & NAD+ Services

Intravenous (IV) Wellness Therapy

IV therapy delivers vitamins, minerals, and other nutrients directly into the bloodstream, bypassing the digestive system. This method of delivery allows for higher concentrations of nutrients to be available to your cells compared to oral supplementation.

Our IV Therapy Menu

[CLINIC NAME] offers a variety of IV therapy formulations designed to support general wellness:

Hydration & Recovery - A balanced electrolyte and vitamin formulation to support hydration and recovery after physical activity or illness.

Immune Support - A vitamin C and zinc-based formulation designed to support immune system function during cold and flu season.

Energy & Vitality - A B-vitamin complex formulation to help support energy levels and metabolic function.

Beauty & Skin Health - An antioxidant-rich formulation with biotin and vitamin C to support skin, hair, and nail health from within.

NAD+ Infusion Therapy

NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme found in every cell of the body that plays a key role in cellular energy production and repair processes. NAD+ levels naturally decline with age.

NAD+ infusion therapy delivers this coenzyme directly into the bloodstream. Research is ongoing into the potential benefits of NAD+ supplementation for:
- Supporting cellular energy production
- Supporting healthy aging processes
- Cognitive function support
- Overall wellness and vitality

What to Expect

IV therapy sessions typically last 30-60 minutes, depending on the formulation. NAD+ infusions may take longer. All treatments are administered by trained medical professionals in a comfortable clinical setting.

Safety & Quality

All IV formulations are prepared using pharmaceutical-grade ingredients and administered under medical supervision. A brief health screening is conducted before your first treatment.

DISCLAIMERS:
- IV therapy is not intended to diagnose, treat, cure, or prevent any disease.
- Individual results may vary.
- These statements have not been evaluated by the FDA.
- IV therapy should complement, not replace, a balanced diet and healthy lifestyle.
- Consult with your primary healthcare provider before beginning IV therapy, especially if you have existing health conditions.`,
    notes:
      "Replace [CLINIC NAME]. Customize the IV menu based on your actual offerings. Keep language in the wellness/support framework. Do NOT claim IV therapy treats, cures, or prevents specific diseases.",
    wordCount: 0,
  },
  {
    id: "med-spa",
    title: "Med Spa Services",
    category: "service",
    description:
      "Compliant service page for Botox, fillers, laser, and aesthetic treatments.",
    content: `[CLINIC NAME] - Medical Spa Services

Aesthetic & Wellness Treatments

[CLINIC NAME] offers a full range of medical spa services performed by licensed, trained professionals. Our treatments are designed to help you look and feel your best while maintaining the highest standards of safety and care.

Injectable Treatments

Botulinum Toxin (Botox/Dysport) - FDA-approved injectable treatments that temporarily reduce the appearance of moderate to severe facial wrinkles, including frown lines, crow's feet, and forehead lines. Results typically last 3-4 months. Individual results may vary.

Dermal Fillers - FDA-approved hyaluronic acid-based fillers used to restore volume, smooth wrinkles, and enhance facial contours. Common treatment areas include lips, cheeks, nasolabial folds, and jawline. Results are immediate and can last 6-18 months depending on the product and treatment area.

Laser & Light Treatments

Laser Hair Removal - FDA-cleared laser technology for long-term hair reduction. Multiple sessions are typically required for optimal results. Effectiveness may vary based on skin type and hair color.

Skin Resurfacing - Laser treatments designed to address skin texture, tone, and the appearance of fine lines, scars, and sun damage. Downtime varies by treatment intensity.

IPL Photofacial - Intense Pulsed Light therapy to address the appearance of sun damage, redness, and uneven skin tone.

Skin Treatments

Chemical Peels - Professional-grade chemical exfoliation treatments customized to your skin type and concerns.

Microneedling - A collagen-induction therapy that uses fine needles to create micro-channels in the skin, supporting the body's natural skin renewal process.

Your Consultation

Every treatment plan begins with a thorough consultation. Our providers will assess your concerns, discuss your goals, and recommend a personalized treatment plan. We believe in honest, realistic expectations and transparent pricing.

DISCLAIMERS:
- Individual results may vary and are not guaranteed.
- All injectable treatments carry potential risks including bruising, swelling, and rare complications. These will be discussed during your consultation.
- FDA-approved/cleared status refers to the devices and products used, not all specific treatment applications.
- Photos on our website represent individual results and may not reflect the experience of all patients.`,
    notes:
      "Replace [CLINIC NAME]. Only list services you actually offer. For Botox/Dysport, use the generic term 'botulinum toxin' alongside brand names. Ensure your providers have appropriate credentials for each service listed.",
    wordCount: 0,
  },
  {
    id: "weight-loss",
    title: "Weight Loss Program",
    category: "service",
    description:
      "GLP-1, diet, and exercise framing for weight management services.",
    content: `[CLINIC NAME] - Medical Weight Management Program

A Comprehensive Approach to Weight Management

[CLINIC NAME] offers a medically supervised weight management program that combines evidence-based strategies to help you achieve and maintain a healthy weight. Our program is designed to address weight management from multiple angles, including nutrition, physical activity, behavioral support, and when appropriate, medication.

Our Program Includes

Medical Evaluation - A comprehensive health assessment including lab work, body composition analysis, and review of your medical history to identify factors that may affect your weight management journey.

Personalized Nutrition Planning - Working with our team, you'll receive a customized nutrition plan based on your metabolic profile, preferences, and lifestyle.

Physical Activity Guidance - Exercise recommendations tailored to your fitness level, physical abilities, and schedule.

Behavioral Support - Strategies for building sustainable habits, managing emotional eating, and maintaining motivation throughout your journey.

Medication Options (When Appropriate)

For patients who meet specific medical criteria, prescription medications may be incorporated into their weight management plan. These may include FDA-approved GLP-1 receptor agonist medications, which have been shown in clinical studies to support weight management when combined with diet and exercise modifications.

Medication is prescribed only after a thorough medical evaluation and is always used as part of a comprehensive program - not as a standalone solution. Our medical team will discuss:
- Whether medication is appropriate for your situation
- Expected outcomes based on clinical evidence
- Potential side effects and monitoring requirements
- The importance of lifestyle modifications alongside medication

Our Commitment

Weight management is a personal journey, and there is no one-size-fits-all solution. Our team is committed to providing compassionate, evidence-based care that respects your individual circumstances and goals.

DISCLAIMERS:
- Individual weight loss results vary based on starting point, adherence to the program, and other individual factors.
- Weight loss medications require a prescription and medical supervision.
- No specific weight loss amount is guaranteed.
- GLP-1 medications may have side effects; discuss these with your provider.
- This program is not appropriate for everyone. A medical evaluation is required.
- Results require commitment to dietary and lifestyle changes.`,
    notes:
      "Replace [CLINIC NAME]. Do NOT guarantee specific weight loss amounts (e.g., 'lose 30 lbs'). Avoid before/after photos without proper disclaimers. If mentioning specific GLP-1 brand names (Ozempic, Wegovy, etc.), ensure you are prescribing them for on-label indications.",
    wordCount: 0,
  },
  {
    id: "dental-implants",
    title: "Dental Implants & Cosmetic Dentistry",
    category: "service",
    description:
      "Compliant service page for dental implant and cosmetic dentistry claims.",
    content: `[CLINIC NAME] - Dental Implants & Cosmetic Dentistry

Restore Your Smile with Confidence

[CLINIC NAME] provides comprehensive dental implant and cosmetic dentistry services. Our team combines advanced technology with personalized care to help you achieve a healthy, beautiful smile.

Dental Implants

Dental implants are a well-established, FDA-cleared solution for replacing missing teeth. An implant consists of a titanium post that is surgically placed in the jawbone, where it serves as an anchor for a replacement tooth or bridge.

Benefits of dental implants may include:
- A natural-looking and natural-feeling replacement for missing teeth
- Preservation of jawbone structure
- No impact on adjacent healthy teeth
- Long-lasting results with proper care and maintenance

The implant process typically involves multiple appointments over several months to allow for proper healing and integration. Our team will provide a detailed treatment timeline during your consultation.

Cosmetic Dentistry Services

Teeth Whitening - Professional-grade whitening treatments that can lighten teeth by several shades. In-office and take-home options available.

Porcelain Veneers - Custom-made thin shells bonded to the front of teeth to improve appearance, addressing chips, gaps, discoloration, and minor alignment concerns.

Dental Bonding - A tooth-colored resin material applied to teeth to repair chips, close gaps, or change tooth shape.

Invisalign / Clear Aligners - FDA-cleared clear aligner therapy for straightening teeth without traditional braces. Treatment time varies by case complexity.

Your Consultation

We offer comprehensive consultations that include digital imaging, oral examination, and a detailed discussion of your treatment options. We believe in transparent communication about costs, timelines, and expected outcomes.

DISCLAIMERS:
- Individual results may vary. Outcomes depend on individual oral health, bone density, and adherence to post-treatment care.
- Dental implant surgery carries risks including infection, nerve damage, and implant failure. These will be discussed in detail during your consultation.
- Not all patients are candidates for dental implants. A thorough evaluation is required.
- Cosmetic results are subjective and may vary.
- Treatment timelines are estimates and may vary based on individual healing.`,
    notes:
      "Replace [CLINIC NAME]. Dental implants are FDA-cleared medical devices, so device claims are generally compliant. However, avoid guaranteeing specific outcomes. If showing before/after photos, include appropriate disclaimers.",
    wordCount: 0,
  },
  {
    id: "chiropractic",
    title: "Chiropractic Services",
    category: "service",
    description:
      "Scope-of-practice compliant content for chiropractic services.",
    content: `[CLINIC NAME] - Chiropractic Care

Evidence-Based Chiropractic Services

[CLINIC NAME] provides professional chiropractic care focused on musculoskeletal health and overall wellness. Our licensed chiropractors use evidence-based techniques to help patients manage discomfort and improve function.

Our Chiropractic Services

Spinal Adjustments - Manual and instrument-assisted spinal manipulation techniques to address joint restrictions and improve spinal mobility.

Soft Tissue Therapy - Techniques including myofascial release and therapeutic massage to address muscle tension and soft tissue concerns.

Corrective Exercises - Personalized exercise programs designed to strengthen supporting muscles and improve posture.

Ergonomic & Lifestyle Counseling - Guidance on workplace ergonomics, posture, and daily habits that may affect your musculoskeletal health.

Conditions We Commonly See

Patients visit our office for a variety of musculoskeletal concerns, including:
- Back and neck discomfort
- Headaches and migraines
- Joint stiffness and reduced range of motion
- Sports-related musculoskeletal concerns
- Posture-related discomfort
- Sciatica symptoms

Our Approach

We begin every patient relationship with a comprehensive evaluation, including health history review, physical examination, and when necessary, diagnostic imaging. Based on this evaluation, we develop a personalized care plan tailored to your specific needs and goals.

We believe in:
- Evidence-based treatment protocols
- Clear communication about your care plan and expected timeline
- Collaborative care with other healthcare providers when appropriate
- Empowering patients through education and self-care strategies

DISCLAIMERS:
- Chiropractic care is not a substitute for medical treatment.
- Individual results vary based on condition, severity, and adherence to the care plan.
- Some conditions may require referral to other healthcare providers.
- Chiropractic adjustments carry certain risks that will be discussed during your consultation.
- If you are experiencing a medical emergency, call 911.`,
    notes:
      "Replace [CLINIC NAME]. Stay within chiropractic scope of practice for your state. Avoid claiming to cure or treat diseases. Use 'discomfort' rather than 'pain' where appropriate. Do not claim to treat conditions outside chiropractic scope.",
    wordCount: 0,
  },
  {
    id: "dermatology",
    title: "Dermatology & Skin Care",
    category: "service",
    description:
      "Cosmetic vs medical framing for dermatology service pages.",
    content: `[CLINIC NAME] - Dermatology & Skin Care

Comprehensive Dermatology Services

[CLINIC NAME] offers both medical and cosmetic dermatology services, providing comprehensive skin care under the supervision of board-certified dermatologists.

Medical Dermatology

Our medical dermatology services address a wide range of skin conditions:

Skin Cancer Screening - Regular skin examinations to detect potentially concerning lesions. Early detection is important for effective treatment. We recommend annual full-body skin checks.

Acne Management - Comprehensive acne treatment plans including topical medications, oral medications when appropriate, and procedural treatments.

Eczema & Psoriasis - Management of chronic inflammatory skin conditions using evidence-based treatment protocols, including topical therapies, phototherapy, and biologic medications when appropriate.

Rash & Skin Condition Evaluation - Diagnosis and management of various skin conditions including rashes, infections, and other dermatologic concerns.

Cosmetic Dermatology

Our cosmetic services are designed to help you achieve your aesthetic goals:

Chemical Peels - Professional-grade peels customized to your skin type and concerns, addressing texture, tone, and the appearance of fine lines.

Laser Treatments - FDA-cleared laser technologies for hair removal, skin resurfacing, pigmentation concerns, and vascular lesions.

Injectable Treatments - Botox and dermal fillers administered by experienced providers for wrinkle reduction and facial rejuvenation.

Skincare Programs - Medical-grade skincare recommendations tailored to your unique skin type and goals.

Medical vs. Cosmetic: Understanding the Difference

Medical dermatology addresses skin health conditions and is typically covered by insurance. Cosmetic dermatology addresses aesthetic concerns and is generally an out-of-pocket expense. During your consultation, our team will help you understand which category your concerns fall into.

DISCLAIMERS:
- Individual results may vary for both medical and cosmetic treatments.
- Cosmetic procedures carry risks that will be discussed during your consultation.
- Insurance coverage varies by plan and condition.
- This information does not constitute medical advice. Please schedule a consultation for personalized recommendations.
- Some treatments may require multiple sessions for optimal results.`,
    notes:
      "Replace [CLINIC NAME]. Clearly distinguish between medical and cosmetic services. Medical claims should reference diagnosed conditions. Cosmetic claims should focus on appearance improvement, not medical outcomes.",
    wordCount: 0,
  },
]

const MARKETING_TEMPLATES: ContentTemplate[] = [
  {
    id: "testimonial-page",
    title: "Patient Testimonial Page",
    category: "marketing",
    description:
      "Compliant patient testimonial page with all required disclaimers.",
    content: `[CLINIC NAME] - Patient Testimonials

What Our Patients Say

We value the trust our patients place in us. Below are testimonials from patients who have chosen to share their experiences. We are grateful for their feedback.

---

"I had a great experience at [CLINIC NAME]. The staff was professional and made me feel comfortable throughout my visit. I appreciated the thorough consultation and clear explanation of my treatment options." - [Patient Name], [City, State]

---

"After researching several providers, I chose [CLINIC NAME] because of their transparent approach. They took the time to explain what to expect and were honest about realistic outcomes." - [Patient Name], [City, State]

---

"The team at [CLINIC NAME] was attentive and knowledgeable. I felt confident in their expertise and appreciated their patient-centered approach to care." - [Patient Name], [City, State]

---

"I've been visiting [CLINIC NAME] for [treatment type] and have been pleased with my experience. The staff is always professional, and I feel well-cared for at every visit." - [Patient Name], [City, State]

---

REQUIRED DISCLAIMERS (must appear on testimonial page):

* Individual results may vary. The testimonials on this page represent individual experiences and do not guarantee similar outcomes for all patients.

* These testimonials reflect the personal experiences of individual patients and are not intended to represent or guarantee that any patient will achieve the same or similar results.

* The testimonials displayed are given by real patients and are not representative of all patient experiences. Each patient's experience is unique and results depend on individual factors.

* No testimonial on this website should be construed as a claim or representation that our treatments can be used to diagnose, treat, cure, mitigate, or prevent any disease or medical condition. The information shared by patients describes their personal experience only.

* Some testimonials may have been edited for clarity or brevity while maintaining the accuracy of the patient's account.

* If you are considering treatment, we encourage you to schedule a consultation to discuss your individual situation, concerns, and goals with our medical team.`,
    notes:
      'Replace [CLINIC NAME], [Patient Name], and [City, State] with actual information. CRITICAL: All four disclaimer paragraphs are REQUIRED. Get written consent from patients before publishing testimonials. The FTC requires that testimonials reflect "typical" results or include clear disclaimers about atypical results.',
    wordCount: 0,
  },
  {
    id: "before-after",
    title: "Before & After Gallery",
    category: "marketing",
    description:
      "Compliant before-and-after photo gallery with required disclosure.",
    content: `[CLINIC NAME] - Before & After Gallery

Patient Results Gallery

Browse our gallery of before-and-after photos to see examples of the results our patients have experienced. These photos are shared with patient consent and are intended to provide a visual reference of potential outcomes.

[INSERT BEFORE & AFTER PHOTOS WITH THE FOLLOWING FORMAT FOR EACH:]

Patient: [Patient initials or number]
Treatment: [Treatment name]
Number of Sessions: [Number]
Timeframe: [Duration between before and after photos]
Notes: [Any relevant context about the patient's situation]

---

REQUIRED DISCLOSURES (must appear prominently on the page):

IMPORTANT NOTICE ABOUT BEFORE & AFTER PHOTOS:

1. Individual Results Vary - The results shown in these photographs represent individual patient outcomes and are not a guarantee of similar results. Each patient's anatomy, health condition, and treatment response are unique.

2. Patient Consent - All photographs are published with the written consent of the patients shown. Patient privacy is important to us.

3. Unaltered Photos - Our before-and-after photographs are taken under consistent lighting and positioning conditions. Photos have not been digitally altered to change the appearance of treatment results. [NOTE: Only include this statement if true.]

4. Typical vs. Exceptional Results - Some results shown may be exceptional and not representative of the typical patient experience. During your consultation, we will discuss realistic expectations for your specific situation.

5. Not Medical Advice - These photographs are provided for illustrative purposes only and do not constitute medical advice. A consultation with our medical team is necessary to determine if a particular treatment is appropriate for you.

6. Timing of Results - Results may develop over time. The timeframe noted for each set of photos indicates when the after photo was taken relative to the treatment date.

ADDITIONAL PLATFORM-SPECIFIC NOTES:
- If sharing before/after photos on social media, all disclaimers must also appear in the post.
- Some advertising platforms (Google, Meta) have specific policies about before/after images in paid advertisements. Check platform-specific guidelines before using these images in ads.
- HIPAA applies - ensure you have proper written authorization before publishing any patient photographs.`,
    notes:
      "Replace [CLINIC NAME] and fill in photo details. You MUST have signed photo release forms from every patient shown. Never digitally alter results photos. Include all 6 disclosure items. Check your state's specific regulations on before/after marketing.",
    wordCount: 0,
  },
  {
    id: "about-us",
    title: "About Us / Our Approach",
    category: "marketing",
    description:
      "Credentials and philosophy page template with compliant framing.",
    content: `[CLINIC NAME] - About Us

Our Mission

At [CLINIC NAME], we are committed to providing [specialty area] services that prioritize patient safety, education, and evidence-based care. Founded in [YEAR], our practice serves the [CITY/REGION] community with a focus on [specific focus area].

Our Team

[PROVIDER NAME], [CREDENTIALS]
[Title/Role]

[Provider Name] is a [licensed/board-certified] [specialty] with [X years] of experience in [specific area]. [He/She/They] received [his/her/their] [degree] from [Institution] and completed [residency/fellowship/training] at [Institution].

Professional memberships include:
- [Professional Association 1]
- [Professional Association 2]
- [Board Certification, if applicable]

[Repeat for additional providers]

Our Approach

We believe in:

Evidence-Based Care - Our treatment recommendations are grounded in current medical research and clinical evidence. We stay current with the latest developments in our field through continuing education and professional development.

Patient Education - We take the time to explain your condition, treatment options, and realistic expectations. We believe informed patients make better healthcare decisions.

Transparent Communication - We are upfront about costs, expected outcomes, and the limitations of any treatment. We will tell you what we can and cannot do.

Personalized Treatment Plans - Every patient is unique. We develop individualized treatment plans based on your specific health status, goals, and preferences.

Safety First - Patient safety is our highest priority. We follow all applicable regulations, maintain proper certifications, and adhere to strict safety protocols.

Our Facility

[CLINIC NAME] is located at [ADDRESS]. Our facility features [describe relevant features: modern equipment, comfortable environment, etc.]. We maintain all required licenses, certifications, and safety standards.

DISCLAIMERS:
- Board certifications and credentials listed are verified and current.
- Professional memberships do not imply endorsement of our practice by the listed organizations.
- The information on this page is for general informational purposes.`,
    notes:
      "Replace all [BRACKETED] items. Verify all credentials are current and accurate. Only list board certifications that providers actually hold. Do not exaggerate experience or training. Ensure license numbers are not publicly displayed unless required by your state.",
    wordCount: 0,
  },
  {
    id: "faq-page",
    title: "FAQ Page Template",
    category: "marketing",
    description:
      "Common patient questions with compliant answers.",
    content: `[CLINIC NAME] - Frequently Asked Questions

Frequently Asked Questions

General Questions

Q: What should I expect during my first visit?
A: Your first visit will include a comprehensive consultation where we review your health history, discuss your concerns and goals, and perform any necessary evaluations. Based on this assessment, our team will discuss potential treatment options and help you make an informed decision about your care.

Q: Do you accept insurance?
A: [Customize based on your practice]. For cosmetic/elective procedures that are not covered by insurance, we offer [payment options]. We are happy to provide detailed cost information before any treatment.

Q: How do I know which treatment is right for me?
A: The best treatment for your situation depends on many individual factors. During your consultation, our medical team will evaluate your specific needs and provide personalized recommendations. We encourage you to ask questions and take time to consider your options.

Treatment-Specific Questions

Q: Are your treatments FDA-approved?
A: We use FDA-approved and FDA-cleared products and devices where applicable. Some treatments may involve off-label use of approved products, which is a common and legal practice in medicine. We will clearly inform you about the regulatory status of any recommended treatment during your consultation.

Q: How long do results last?
A: Treatment longevity varies by procedure and individual factors. During your consultation, we will provide realistic timeframe expectations for your specific treatment. Individual results may vary.

Q: Are there any risks or side effects?
A: All medical procedures carry some degree of risk. We will provide you with detailed information about potential risks, side effects, and complications associated with any recommended treatment. Your safety is our top priority, and we want you to make a fully informed decision.

Q: How many treatments will I need?
A: The number of treatments varies by procedure and individual response. Some treatments achieve results in a single session, while others require a series of treatments. Your provider will recommend a treatment plan based on your specific goals and condition.

Q: Can I see before-and-after photos?
A: Yes, we maintain a gallery of before-and-after photos from consenting patients. These photos can be viewed [during your consultation / on our website]. Please remember that individual results vary, and photos represent individual outcomes.

Scheduling & Policies

Q: How do I schedule an appointment?
A: You can schedule an appointment by [calling our office at PHONE / booking online at URL / etc.]. We recommend scheduling consultations in advance.

Q: What is your cancellation policy?
A: We request [X hours/days] notice for cancellations or rescheduling. [Include any cancellation fee policy.]

Q: Do you offer virtual consultations?
A: [Customize based on your practice.]

DISCLAIMERS:
- The information provided in this FAQ is for general informational purposes only and does not constitute medical advice.
- Individual treatment plans, results, risks, and costs vary. Please schedule a consultation for information specific to your situation.
- This FAQ does not cover all possible questions or scenarios.`,
    notes:
      "Replace all [BRACKETED] items. Customize answers based on your specific practice, services, and policies. Add or remove questions relevant to your specialties. Ensure all answers remain truthful and do not overpromise results.",
    wordCount: 0,
  },
]

const ADS_TEMPLATES: ContentTemplate[] = [
  {
    id: "google-ads",
    title: "Google Ads Copy",
    category: "ads",
    description:
      "Platform-compliant healthcare ad text for Google Ads campaigns.",
    content: `GOOGLE ADS - COMPLIANT HEALTHCARE AD COPY TEMPLATES

Important: Google has strict Healthcare and Medicines advertising policies. Review Google's current policies before running healthcare ads.

---

SEARCH AD - General Practice Awareness

Headline 1 (30 chars): [Clinic Name] - [City] Clinic
Headline 2 (30 chars): Schedule Your Consultation
Headline 3 (30 chars): Evidence-Based Care
Description 1 (90 chars): Comprehensive [treatment type] services from licensed, experienced providers. Learn more.
Description 2 (90 chars): Personalized treatment plans tailored to your needs. Schedule your consultation today.

---

SEARCH AD - Specific Service

Headline 1 (30 chars): [Treatment] in [City]
Headline 2 (30 chars): Licensed Medical Providers
Headline 3 (30 chars): Book a Consultation Today
Description 1 (90 chars): Professional [treatment] services. Individualized care from our experienced medical team.
Description 2 (90 chars): Results vary by individual. Schedule a consultation to discuss your options and goals.

---

SEARCH AD - Med Spa / Cosmetic

Headline 1 (30 chars): [Clinic Name] Med Spa
Headline 2 (30 chars): Botox & Fillers - [City]
Headline 3 (30 chars): FDA-Approved Treatments
Description 1 (90 chars): Professional aesthetic treatments from licensed providers. Natural-looking results.
Description 2 (90 chars): Complimentary consultations available. Discover your personalized treatment plan today.

---

GOOGLE ADS COMPLIANCE CHECKLIST:
- Do NOT use superlatives ("best," "guaranteed," "#1")
- Do NOT promise specific results or outcomes
- Do NOT mention prescription drug names in ad copy (restricted)
- Do NOT use before/after imagery in display ads (restricted for some categories)
- Include relevant disclaimers on landing pages
- Ensure landing page matches ad claims
- Apply for Healthcare advertiser certification if required
- Use only FDA-approved/cleared terminology for devices and products
- Avoid urgency tactics for medical decisions ("Limited time," "Act now")
- Ensure ad extensions (callouts, sitelinks) are also compliant`,
    notes:
      "Replace [BRACKETED] items. Google healthcare ad policies change frequently - verify current policies before running campaigns. Some healthcare categories require Google advertiser certification. Character counts are guidelines for responsive search ads.",
    wordCount: 0,
  },
  {
    id: "social-media",
    title: "Facebook/Instagram Post",
    category: "ads",
    description:
      "Social media compliance templates for healthcare practices.",
    content: `SOCIAL MEDIA - COMPLIANT HEALTHCARE POST TEMPLATES

---

POST 1 - Educational Content

[CLINIC NAME]

Did you know? [Interesting fact about treatment/condition]

At [CLINIC NAME], we believe in empowering our patients with accurate health information. Understanding your options is the first step in making informed decisions about your care.

Have questions? We're here to help.

Schedule a consultation: [link]

#[CityName]Healthcare #[Specialty] #PatientEducation #HealthAwareness

---

POST 2 - Service Highlight

[CLINIC NAME]

Considering [treatment type]? Here's what you should know:

[Checkmark emoji] Performed by licensed, experienced providers
[Checkmark emoji] Personalized treatment plans
[Checkmark emoji] Thorough consultation before any treatment
[Checkmark emoji] Transparent pricing - no hidden fees

Every patient's situation is unique, and results vary by individual. The best way to know if [treatment] is right for you is to schedule a consultation with our team.

Link in bio to book.

* Individual results vary. Consult with a qualified healthcare provider.

---

POST 3 - Team/Culture

[CLINIC NAME]

Meet [Provider Name], [Credentials]!

[Provider Name] brings [X] years of experience in [specialty] to our team. [He/She/They] is passionate about [area of focus] and committed to providing personalized, evidence-based care.

Fun fact: [Personal detail - hobby, volunteer work, etc.]

Ready to schedule? Visit [link]

---

POST 4 - Patient Milestone (NO specific results)

[CLINIC NAME]

We love celebrating our patients! Thank you to everyone who trusts [CLINIC NAME] with their care.

Every patient journey is unique, and we are honored to be part of yours.

If you're interested in learning more about our services, visit [link] or call [phone].

* This post does not imply specific treatment results. Individual outcomes vary.

---

SOCIAL MEDIA COMPLIANCE CHECKLIST:
- Never share patient information without written HIPAA authorization
- All testimonials require patient consent AND disclaimers
- Avoid before/after photos in paid ads (platform restrictions)
- Do not claim to cure, treat, or prevent diseases in organic posts
- Include "Individual results vary" disclaimers with any results-related content
- Do not use patient photos/videos without written consent
- Disclose any paid partnerships or sponsored content
- Avoid commenting on specific medical conditions in post comments
- Meta (Facebook/Instagram) restricts targeting for health-related ads
- Monitor and moderate comments for medical advice requests - redirect to private consultation`,
    notes:
      "Replace all [BRACKETED] items. Customize hashtags for your market. Meta has specific ad targeting restrictions for healthcare - review current policies. Never respond to medical questions in public comments.",
    wordCount: 0,
  },
  {
    id: "email-newsletter",
    title: "Email Newsletter",
    category: "ads",
    description:
      "CAN-SPAM compliant health content email template.",
    content: `EMAIL NEWSLETTER - CAN-SPAM COMPLIANT TEMPLATE

---

SUBJECT LINE OPTIONS:
- "[Clinic Name] Monthly Update - [Month Year]"
- "Your [Month] Health & Wellness Update from [Clinic Name]"
- "What's New at [Clinic Name] - [Month Year]"

[Avoid: misleading subject lines, ALL CAPS, excessive punctuation, spam trigger words like "FREE," "ACT NOW," "LIMITED TIME"]

---

FROM: [Clinic Name] <[email]>
REPLY-TO: [email]

---

EMAIL BODY:

[CLINIC LOGO]

Hello [First Name],

Thank you for being a valued member of the [CLINIC NAME] community. Here's your monthly update with health information, practice news, and wellness tips.

---

HEALTH EDUCATION SPOTLIGHT

[Topic: e.g., "Understanding Seasonal Allergies"]

[2-3 paragraphs of educational content about a health topic relevant to your practice. Keep the tone informational and avoid making treatment claims. Include references to published research when possible.]

This information is provided for educational purposes and is not a substitute for professional medical advice. If you have concerns about [topic], we encourage you to schedule a consultation with a qualified healthcare provider.

---

PRACTICE NEWS

[Any updates about your practice - new providers, new services, expanded hours, community involvement, etc.]

---

WELLNESS TIP OF THE MONTH

[A simple, actionable wellness tip that is within your scope of practice and supported by evidence.]

---

SCHEDULE YOUR APPOINTMENT

Ready to take the next step? Contact us to schedule your consultation:

Phone: [PHONE]
Online: [BOOKING URL]
Location: [ADDRESS]

---

[FOOTER - REQUIRED ELEMENTS:]

[CLINIC NAME]
[PHYSICAL MAILING ADDRESS - required by CAN-SPAM]

You are receiving this email because you [opted in / are a patient / etc.].

If you no longer wish to receive these emails, you may [UNSUBSCRIBE LINK].

To update your email preferences, click here: [PREFERENCES LINK]

This email is intended for informational purposes only and does not constitute medical advice. Individual results from any treatment vary. Please consult with a qualified healthcare provider for personalized medical guidance.

Copyright [YEAR] [CLINIC NAME]. All rights reserved.

---

CAN-SPAM COMPLIANCE REQUIREMENTS:
1. Accurate "From" name and email address - do not disguise sender identity
2. Non-deceptive subject line - must relate to email content
3. Physical mailing address MUST be included in every email
4. Clear, conspicuous unsubscribe mechanism - must be honored within 10 business days
5. Identify the message as an advertisement if it is promotional
6. You cannot send emails to purchased lists without proper consent
7. Honor opt-out requests promptly - do not require login/payment to unsubscribe
8. Monitor what others are doing on your behalf (email marketing services)`,
    notes:
      "Replace all [BRACKETED] items. CAN-SPAM violations can result in penalties up to $50,120 per email. Ensure your email service provider handles unsubscribe processing. If you include health claims or promotions, all standard disclaimers apply.",
    wordCount: 0,
  },
]

// Calculate word counts
function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}

function withWordCounts(templates: ContentTemplate[]): ContentTemplate[] {
  return templates.map((t) => ({ ...t, wordCount: countWords(t.content) }))
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  ...withWordCounts(SERVICE_TEMPLATES),
  ...withWordCounts(MARKETING_TEMPLATES),
  ...withWordCounts(ADS_TEMPLATES),
]

export const TEMPLATE_CATEGORIES = [
  { value: "all", label: "All Templates" },
  { value: "service", label: "Service Pages" },
  { value: "marketing", label: "Marketing Materials" },
  { value: "ads", label: "Ads & Social" },
] as const

export type TemplateCategory = ContentTemplate["category"]
