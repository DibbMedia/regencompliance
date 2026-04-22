import type { StateMeta } from "./types"

export const STATES: StateMeta[] = [
  {
    slug: "california",
    state: "California",
    abbreviation: "CA",
    title: "California Healthcare Marketing Compliance Rules — FDA, FTC, MBC & AG",
    description:
      "California has the most active state-level enforcement environment for healthcare marketing. Medical Board of California advertising rules, state AG consumer protection, and specialty board actions — with a focus on med spas, telehealth, and aesthetic practices.",
    heroTagline:
      "California healthcare marketing sits under the strictest state-level enforcement environment in the country — Medical Board of California rules, Business & Professions Code §17500 false advertising authority, and active AG consumer protection.",
    intro:
      "California is the single most-enforced state for healthcare marketing. The Medical Board of California (MBC) has its own detailed advertising rules in 16 CCR §1353.5; the Attorney General's office uses B&P §17200 and §17500 authority extensively against healthcare practices; and the state's Sherman Food, Drug, and Cosmetic Law mirrors federal FDA authority at state level. Practices marketing in California face a genuinely distinct and heavier regulatory surface than most states, and marketing written to 'meet federal rules' often still fails California-specific standards.",
    medicalBoardName: "Medical Board of California (MBC)",
    medicalBoardFocus:
      "The MBC actively enforces 16 CCR §1353.5 — which covers deceptive advertising by licensed physicians. Specialty-claim misuse ('cosmetic surgeon' by non-ABMS-certified physicians), supervision misrepresentation (particularly for med spa injectors), and outcome guarantee language are the most common bases for discipline. California also has specific rules on how physicians can advertise 'board-certified' status — requiring disclosure of the specific certifying board.",
    stateAgFocus:
      "The California AG uses Business & Professions Code §17500 (false advertising) and §17200 (unfair competition) extensively. Recent enforcement has focused on telehealth prescribing advertising (particularly for weight loss and hormones), package pricing disclosure in aesthetic practices, and medical device marketing that misrepresents FDA clearance status. California is also the origin of many multi-state healthcare marketing settlements.",
    focusAreas: [
      {
        title: "Med spa supervision language",
        body: "California tightly regulates who can perform injectables and under what supervision. Marketing language implying nurse-injector independence ('book directly with your injector,' 'our expert injectors') has been cited by both MBC and DCA in multiple actions. Compliant framing requires explicit physician/NP/PA supervision disclosure.",
      },
      {
        title: "Telehealth prescribing advertising",
        body: "Telehealth practices marketing in California must meet California telehealth standards regardless of where the prescribing provider is based. Marketing that minimizes evaluation steps ('script in 24 hours,' 'skip the doctor visit') has drawn direct AG attention.",
      },
      {
        title: "Medical device clearance language",
        body: "California enforces the FDA-approved vs FDA-cleared distinction at state level via the Sherman Law. Aesthetic devices marketed as 'FDA-approved' when only cleared are exposed both federally and under California's parallel authority.",
      },
      {
        title: "Before/after photo disclosure",
        body: "While the FTC Endorsement Guides apply federally, California's §17500 authority provides additional state-level exposure on before/after marketing without typical-experience disclosure.",
      },
    ],
    watchItems: [
      {
        pattern: "'Book directly with [nurse injector name]' language on med spa sites",
        why: "MBC treats implied nurse independence as supervision misrepresentation even if supervision is in fact in place.",
      },
      {
        pattern: "'FDA-approved' applied to FDA-cleared aesthetic devices",
        why: "Triggers both federal FDA misbranding and California Sherman Law violations — double exposure.",
      },
      {
        pattern: "Telehealth prescriber location not disclosed",
        why: "California AG has pursued telehealth practices for not clearly disclosing where the prescribing provider is actually located.",
      },
      {
        pattern: "Package pricing advertising without clear add-on disclosure",
        why: "California AG active enforcement area — particularly in aesthetic surgery and fertility practices.",
      },
      {
        pattern: "Patient testimonials with outcome specificity and no typical-experience disclosure",
        why: "§17500 provides state-level authority to pursue patterns federal FTC may not get to first.",
      },
    ],
    specialtyCallouts: [
      "Med spas — highest-enforcement specialty in California for supervision and injectable marketing.",
      "Weight loss / telehealth — growing state AG focus on cross-border prescribing.",
      "Aesthetic surgery — package pricing disclosure and 'board-certified' language specifically targeted.",
      "Dental — 'cosmetic dentist' misuse is active MBC-adjacent area (Dental Board of California handles dental).",
      "Regen medicine — Sherman Law creates state-level exposure in addition to federal CBER issues.",
    ],
    disclaimer:
      "This summary reflects general patterns in California healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a California-licensed healthcare marketing attorney.",
    keywords: [
      "California healthcare marketing rules",
      "California medical board advertising",
      "16 CCR 1353.5",
      "Business and Professions Code 17500",
      "California med spa marketing",
      "California telehealth marketing rules",
    ],
  },
  {
    slug: "texas",
    state: "Texas",
    abbreviation: "TX",
    title: "Texas Healthcare Marketing Compliance Rules — TMB, AG, and Federal Overlap",
    description:
      "Texas Medical Board advertising rules, Texas Deceptive Trade Practices Act enforcement, and the specific supervision requirements that define Texas med spa and weight loss marketing compliance.",
    heroTagline:
      "Texas has an active Medical Board with specific rules for medical advertising, and the DTPA gives consumers and the state AG independent enforcement authority over deceptive healthcare marketing.",
    intro:
      "Texas healthcare marketing is shaped by the Texas Medical Board (TMB), the Texas Deceptive Trade Practices Act (DTPA), and the Texas AG's consumer protection authority. The TMB has specific advertising rules in 22 TAC §164 that cover physician-advertising conduct, specialty claim requirements, and supervision disclosures. The DTPA is unusual in permitting private plaintiffs to bring claims in addition to AG actions — creating multiple enforcement vectors for the same marketing conduct.",
    medicalBoardName: "Texas Medical Board (TMB)",
    medicalBoardFocus:
      "The TMB's advertising rules under 22 TAC §164 cover deceptive advertising, specialty claim language, and supervision representation. Texas has specific rules on 'board-certified' language, on how cosmetic and aesthetic specialties can be claimed by physicians, and on the supervision requirements for nurse injectors and non-physician providers in aesthetic practices. Texas has been particularly active on telehealth prescribing rules as the state has grown as a telehealth hub.",
    stateAgFocus:
      "The Texas AG uses DTPA authority against healthcare marketing that deceives consumers. Recent enforcement has targeted weight-loss clinic advertising, compounded medication marketing, and telehealth prescribing practices. DTPA's treble-damages provision for knowing violations creates significant exposure for practices with documented-knowledge-of-deception fact patterns.",
    focusAreas: [
      {
        title: "Supervision requirements for nurse injectors",
        body: "Texas has specific rules on the supervision relationship between physicians and nurses performing medical aesthetic services. Marketing that implies independent injector practice has been TMB-disciplined.",
      },
      {
        title: "Weight-loss and GLP-1 telehealth marketing",
        body: "Texas is one of the largest telehealth GLP-1 markets. The Texas AG has been active on marketing that minimizes clinical evaluation or misrepresents the availability of specific medications.",
      },
      {
        title: "Compounded medication advertising",
        body: "Texas has specific rules on compounding pharmacy advertising, and the AG has pursued cases on cross-state marketing by compounding-pharmacy-affiliated clinics.",
      },
      {
        title: "DTPA private enforcement",
        body: "Unlike most state consumer-protection laws, the DTPA permits private plaintiffs to sue — including class actions. Healthcare marketing that deceives consumers creates exposure to private lawsuits in addition to AG or Medical Board action.",
      },
    ],
    watchItems: [
      {
        pattern: "'Board-certified' without specific board disclosure",
        why: "22 TAC §164 requires specific certifying-board disclosure when 'board-certified' language is used.",
      },
      {
        pattern: "'Our expert injectors' / 'book with your injector' without supervision language",
        why: "TMB treats implied independence as a disciplinary-level supervision misrepresentation.",
      },
      {
        pattern: "Compounded GLP-1 marketed as equivalent to Ozempic/Wegovy",
        why: "Texas AG has specifically pursued this pattern under DTPA.",
      },
      {
        pattern: "Guarantee language on weight-loss outcomes",
        why: "DTPA class-action exposure in addition to AG action.",
      },
      {
        pattern: "Telehealth marketing that omits evaluation requirements",
        why: "TMB has begun enforcement on marketing that undersells the clinical evaluation step.",
      },
    ],
    specialtyCallouts: [
      "Med spas — supervision language is the primary TMB enforcement pattern.",
      "Weight loss / telehealth GLP-1 — Texas AG has prioritized this specialty under DTPA.",
      "Dental — the Texas State Board of Dental Examiners enforces its own advertising rules separately.",
      "Regen medicine — Texas has been a growth market with corresponding enforcement interest.",
      "Aesthetic surgery — 'board-certified' language is actively enforced.",
    ],
    disclaimer:
      "This summary reflects general patterns in Texas healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Texas-licensed healthcare marketing attorney.",
    keywords: [
      "Texas healthcare marketing rules",
      "Texas Medical Board advertising",
      "22 TAC 164",
      "Texas DTPA healthcare",
      "Texas med spa marketing",
      "Texas telehealth marketing",
    ],
  },
  {
    slug: "florida",
    state: "Florida",
    abbreviation: "FL",
    title: "Florida Healthcare Marketing Compliance Rules — FL Medical Board and AG",
    description:
      "Florida Board of Medicine advertising rules under F.A.C. 64B8, the Florida Deceptive and Unfair Trade Practices Act (FDUTPA), and specific enforcement patterns in med spa, weight loss, and regenerative medicine marketing.",
    heroTagline:
      "Florida's regulatory environment is defined by the Board of Medicine, FDUTPA, and an AG office that has been active on healthcare marketing — particularly in the fast-growing med spa, weight-loss, and regen categories.",
    intro:
      "Florida is a healthcare practice destination — particularly for regen medicine, aesthetic surgery, and concierge medicine — and the regulatory environment reflects that. The Florida Board of Medicine (FBM) enforces specific advertising rules under F.A.C. 64B8, which include physician qualification disclosure, specialty claim rules, and deceptive-advertising prohibitions. FDUTPA provides state-AG and private enforcement over deceptive practices. Florida has been a particularly active jurisdiction for enforcement against stem cell and regenerative medicine marketing, given the volume of such practices in the state.",
    medicalBoardName: "Florida Board of Medicine (FBM)",
    medicalBoardFocus:
      "The FBM enforces F.A.C. 64B8-11 and related advertising rules. Specific focus areas include the 'board-certified' rule (requires ABMS or equivalent), specialty-claim accuracy, and supervision requirements in aesthetic practices. The FBM has also been active on cosmetic surgery marketing specifically — including handling of complications and the marketing of medical tourism.",
    stateAgFocus:
      "FDUTPA gives the Florida AG consumer-protection authority over deceptive healthcare marketing. Recent enforcement has included stem cell clinic marketing, telehealth weight-loss advertising, and aesthetic practice package pricing. FDUTPA also permits private action, creating parallel class-action exposure.",
    focusAreas: [
      {
        title: "Stem cell / regenerative medicine marketing",
        body: "Florida has a high concentration of regen medicine practices, and the state AG has taken parallel state action on marketing that has also drawn FDA federal enforcement. Marketing claims about disease treatment, FDA approval, and outcome guarantees are the primary triggers.",
      },
      {
        title: "Medical tourism marketing",
        body: "Florida is a medical-tourism market, particularly for aesthetic surgery. Marketing to out-of-state and international patients requires disclosure of Florida-specific licensure, supervision arrangements for post-op care, and complications handling.",
      },
      {
        title: "Weight loss and GLP-1 advertising",
        body: "Florida's telehealth-friendly environment has produced substantial weight-loss practice growth — and corresponding state AG attention to marketing that minimizes clinical evaluation or misrepresents medication options.",
      },
      {
        title: "'Board-certified' enforcement",
        body: "Florida Board of Medicine enforces specific rules on 'board-certified' language — requiring ABMS or Florida-recognized equivalent certification. Non-ABMS board certification claims must be qualified.",
      },
    ],
    watchItems: [
      {
        pattern: "Stem cell marketing with disease-treatment claims",
        why: "Florida has parallel state-level enforcement on patterns that also trigger FDA action.",
      },
      {
        pattern: "Aesthetic surgery marketing without clear Florida-licensure disclosure",
        why: "Medical tourism context makes licensure disclosure a state-specific concern.",
      },
      {
        pattern: "'Board-certified' without ABMS-or-equivalent qualifier",
        why: "FBM specifically enforces this pattern.",
      },
      {
        pattern: "Compounded GLP-1 marketed as brand-name equivalent",
        why: "Florida AG has initiated enforcement on this pattern under FDUTPA.",
      },
      {
        pattern: "Outcome guarantees in aesthetic marketing",
        why: "Common FDUTPA private-action and AG-action basis.",
      },
    ],
    specialtyCallouts: [
      "Regen medicine — Florida has particularly active state-level enforcement due to practice volume.",
      "Aesthetic surgery — 'board-certified' and medical-tourism disclosure are active focus areas.",
      "Weight loss / telehealth — AG activity under FDUTPA has grown.",
      "Med spas — FBM supervision enforcement is in line with other heavily-enforced states.",
      "Dental — Florida Board of Dentistry has separate advertising rules.",
    ],
    disclaimer:
      "This summary reflects general patterns in Florida healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Florida-licensed healthcare marketing attorney.",
    keywords: [
      "Florida healthcare marketing rules",
      "Florida Board of Medicine advertising",
      "FDUTPA healthcare",
      "Florida stem cell marketing rules",
      "Florida med spa compliance",
      "Florida telehealth marketing",
    ],
  },
  {
    slug: "new-york",
    state: "New York",
    abbreviation: "NY",
    title: "New York Healthcare Marketing Compliance Rules — OPMC and AG",
    description:
      "New York's Office of Professional Medical Conduct (OPMC) rules on physician advertising, Executive Law §63(12) AG authority, and specific enforcement patterns in aesthetic, weight loss, and corporate practice of medicine contexts.",
    heroTagline:
      "New York's healthcare marketing environment is defined by OPMC, an aggressive AG office, and the state's particularly strict corporate-practice-of-medicine rules — each of which shapes how practices can advertise.",
    intro:
      "New York has one of the most distinctive healthcare marketing regulatory environments in the country. The Office of Professional Medical Conduct (OPMC) enforces physician conduct rules that include specific advertising prohibitions. Executive Law §63(12) gives the AG broad authority over persistent fraud, which has been used in healthcare marketing contexts. And New York's particularly strict interpretation of corporate-practice-of-medicine rules shapes how non-physician-owned entities can advertise healthcare services.",
    medicalBoardName: "New York Office of Professional Medical Conduct (OPMC)",
    medicalBoardFocus:
      "OPMC enforces Education Law §6530 prohibitions on deceptive advertising, specialty misrepresentation, and conduct-related marketing issues. New York has specific rules on how physicians can advertise — including rules on guarantees, superlative claims, and the use of patient testimonials. New York also has specific rules on the relationship between physicians and corporate service providers (including med spa corporate structures) that affect how advertising can be attributed and who is liable for violations.",
    stateAgFocus:
      "The NY AG uses Executive Law §63(12) for persistent-fraud enforcement and Consumer Protection Act authority for deceptive practices. Healthcare marketing enforcement has included cosmetic practice advertising, telehealth prescribing, and corporate-practice-of-medicine violations via marketing. The AG office has also been notably active on cross-border healthcare marketing — including marketing targeting New York residents by out-of-state providers.",
    focusAreas: [
      {
        title: "Corporate practice of medicine and marketing",
        body: "New York has particularly strict corporate-practice-of-medicine rules. Marketing that implies non-physician corporate entities provide medical services can trigger enforcement — including against corporate med spa chains, telehealth platforms, and franchise models.",
      },
      {
        title: "Cosmetic and aesthetic practice advertising",
        body: "New York OPMC has been active on aesthetic-practice marketing, particularly around 'board-certified' claims, specialty language by non-certified physicians, and supervision representations in med spa contexts.",
      },
      {
        title: "Cross-border telehealth marketing",
        body: "Telehealth practices advertising to New York residents must meet New York standards regardless of the provider's location. The AG has pursued advertising that targets New Yorkers by out-of-state providers who don't meet state requirements.",
      },
      {
        title: "Guarantee and superlative advertising",
        body: "New York OPMC rules specifically prohibit guarantees of medical outcomes and certain superlative claims. These are enforced more strictly than comparable rules in many other states.",
      },
    ],
    watchItems: [
      {
        pattern: "Non-physician-owned entity advertising medical services",
        why: "Corporate practice of medicine is strictly interpreted; marketing can serve as evidence of violation.",
      },
      {
        pattern: "Guarantee language in any medical advertising",
        why: "OPMC rules specifically prohibit outcome guarantees.",
      },
      {
        pattern: "Cross-border telehealth marketing",
        why: "NY AG has targeted marketing by out-of-state providers to NY residents.",
      },
      {
        pattern: "'Top doctor' / 'best surgeon' superlatives without recognized basis",
        why: "OPMC rules against unsubstantiated superlative claims are actively enforced.",
      },
      {
        pattern: "Specialty claims by non-ABMS-certified physicians",
        why: "OPMC enforces specific specialty-disclosure standards.",
      },
    ],
    specialtyCallouts: [
      "Aesthetic surgery — NY is particularly strict on 'best/top' superlatives and specialty claims.",
      "Med spas — corporate practice of medicine shapes what entities can advertise.",
      "Telehealth — cross-border advertising to NY residents is a focus area.",
      "Weight loss — intersection of telehealth and corporate-practice concerns.",
      "Regen medicine — AG enforcement has followed federal patterns.",
    ],
    disclaimer:
      "This summary reflects general patterns in New York healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a New York-licensed healthcare marketing attorney.",
    keywords: [
      "New York healthcare marketing rules",
      "OPMC advertising rules",
      "New York corporate practice of medicine",
      "Executive Law 63(12)",
      "NY med spa marketing",
      "NY telehealth advertising",
    ],
  },
  {
    slug: "illinois",
    state: "Illinois",
    abbreviation: "IL",
    title: "Illinois Healthcare Marketing Compliance Rules — IDFPR and AG",
    description:
      "Illinois Department of Financial and Professional Regulation (IDFPR) rules on physician advertising and the Illinois Consumer Fraud Act — with specific focus on med spa supervision, weight loss, and aesthetic practice marketing.",
    heroTagline:
      "Illinois healthcare marketing is governed by IDFPR licensing rules, the Consumer Fraud Act, and specific supervision requirements that shape aesthetic and weight loss practice marketing.",
    intro:
      "Illinois healthcare marketing compliance is shaped by the Illinois Department of Financial and Professional Regulation (IDFPR), which licenses and disciplines physicians, and the Illinois Consumer Fraud and Deceptive Business Practices Act (ICFA), which provides AG and private enforcement authority. Illinois has specific supervision rules for nurses performing aesthetic services and telehealth rules that affect how telehealth practices can market to Illinois residents.",
    medicalBoardName: "Illinois Department of Financial and Professional Regulation (IDFPR)",
    medicalBoardFocus:
      "IDFPR enforces the Medical Practice Act of 1987 and associated rules on advertising. Focus areas include specialty claims, supervision representations in aesthetic practice, and guarantee language. IDFPR can discipline both individual physicians and practice entities.",
    stateAgFocus:
      "The Illinois AG uses ICFA authority for healthcare marketing enforcement. Recent patterns include compounded medication marketing, telehealth prescribing advertising, and aesthetic practice package pricing. ICFA permits both AG and private action.",
    focusAreas: [
      {
        title: "Nurse injector supervision rules",
        body: "Illinois has specific rules on the supervision relationship between physicians and nurses in aesthetic practice. Marketing that implies independent nurse practice without required supervision is a common IDFPR focus.",
      },
      {
        title: "Telehealth advertising",
        body: "Illinois has adopted specific telehealth rules that affect how telehealth practices can advertise to Illinois residents. Providers must meet Illinois telehealth standards regardless of where they are based.",
      },
      {
        title: "Weight-loss and compounded medication marketing",
        body: "Illinois AG has been active on compounded-GLP-1 marketing and related weight-loss advertising practices.",
      },
      {
        title: "Consumer Fraud Act class actions",
        body: "ICFA permits private class actions with fee-shifting, creating exposure to class-action lawsuits in addition to AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse injector independence language",
        why: "IDFPR supervision enforcement is active on this pattern.",
      },
      {
        pattern: "Telehealth marketing without Illinois-licensure disclosure",
        why: "Illinois-specific telehealth rules apply to any provider marketing to Illinois patients.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence language",
        why: "IL AG enforcement under ICFA.",
      },
      {
        pattern: "Guarantee advertising",
        why: "IDFPR rules restrict guarantee claims; ICFA provides parallel consumer exposure.",
      },
      {
        pattern: "Package pricing without add-on disclosure",
        why: "ICFA class-action risk beyond AG action.",
      },
    ],
    specialtyCallouts: [
      "Med spas — supervision language is primary IDFPR focus.",
      "Weight loss / telehealth — AG has been active on ICFA enforcement.",
      "Aesthetic surgery — package pricing and 'board-certified' standards apply.",
      "Dental — Illinois Dental Practice Act applies separately.",
      "Regen medicine — federal patterns generally mirrored in state enforcement.",
    ],
    disclaimer:
      "This summary reflects general patterns in Illinois healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Illinois-licensed healthcare marketing attorney.",
    keywords: [
      "Illinois healthcare marketing rules",
      "IDFPR advertising",
      "Illinois Consumer Fraud Act healthcare",
      "Illinois med spa marketing",
      "Illinois telehealth rules",
    ],
  },
  {
    slug: "pennsylvania",
    state: "Pennsylvania",
    abbreviation: "PA",
    title: "Pennsylvania Healthcare Marketing Compliance Rules — State Board of Medicine and AG",
    description:
      "Pennsylvania State Board of Medicine advertising rules and UTPCPL enforcement against healthcare marketing deception — with focus areas specific to PA's aesthetic, weight loss, and telehealth sectors.",
    heroTagline:
      "Pennsylvania's regulatory environment is shaped by the State Board of Medicine, UTPCPL consumer protection authority, and specific supervision rules for aesthetic practices.",
    intro:
      "Pennsylvania healthcare marketing compliance operates under the Pennsylvania State Board of Medicine rules (49 Pa. Code Ch. 16), the Unfair Trade Practices and Consumer Protection Law (UTPCPL), and state-specific telehealth and supervision rules. The AG office has been active on compounded medication marketing and telehealth prescribing advertising.",
    medicalBoardName: "Pennsylvania State Board of Medicine",
    medicalBoardFocus:
      "49 Pa. Code Ch. 16 covers physician advertising rules including specialty claim requirements, testimonial handling, guarantee restrictions, and supervision representations. The Board enforces against both individual physicians and practice entities and has been particularly active on aesthetic-practice marketing.",
    stateAgFocus:
      "UTPCPL provides AG consumer-protection authority. The PA AG has been active on compounded medication marketing and telehealth prescribing practices. UTPCPL also permits private action with treble-damages potential.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "Pennsylvania enforces supervision requirements for non-physician injectors and aesthetic service providers. Marketing that implies independent practice has been a disciplinary focus.",
      },
      {
        title: "Compounded medication marketing",
        body: "PA has been active on compounded GLP-1 and related medication marketing, particularly around brand-equivalence language and prescribing representations.",
      },
      {
        title: "Telehealth prescribing advertising",
        body: "PA telehealth rules require specific standards that apply to providers marketing to PA residents. Marketing that minimizes clinical evaluation steps has drawn scrutiny.",
      },
      {
        title: "UTPCPL private enforcement",
        body: "UTPCPL permits private action with treble damages — creating exposure to class-action litigation beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Non-physician injector independence language",
        why: "Board of Medicine supervision enforcement is active on this pattern.",
      },
      {
        pattern: "Brand-equivalence claims for compounded medications",
        why: "PA AG has initiated enforcement under UTPCPL.",
      },
      {
        pattern: "Telehealth marketing to PA residents without compliance framing",
        why: "PA telehealth rules apply regardless of provider location.",
      },
      {
        pattern: "Guarantee language on medical outcomes",
        why: "49 Pa. Code restricts; UTPCPL private-action exposure parallel.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Board of Medicine specialty-claim enforcement.",
      },
    ],
    specialtyCallouts: [
      "Med spas — supervision enforcement is primary focus.",
      "Weight loss / telehealth — PA AG activity under UTPCPL.",
      "Aesthetic surgery — guarantee and specialty rules apply.",
      "Dental — PA State Board of Dentistry rules separate.",
      "Compounding-pharmacy-affiliated clinics — growing enforcement area.",
    ],
    disclaimer:
      "This summary reflects general patterns in Pennsylvania healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Pennsylvania-licensed healthcare marketing attorney.",
    keywords: [
      "Pennsylvania healthcare marketing rules",
      "PA State Board of Medicine advertising",
      "49 Pa Code 16",
      "UTPCPL healthcare",
      "Pennsylvania telehealth marketing",
    ],
  },
  {
    slug: "ohio",
    state: "Ohio",
    abbreviation: "OH",
    title: "Ohio Healthcare Marketing Compliance Rules — SMBO and AG",
    description:
      "State Medical Board of Ohio (SMBO) advertising rules and Ohio Consumer Sales Practices Act enforcement — with specific focus areas in aesthetic practice, weight loss, and telehealth marketing.",
    heroTagline:
      "Ohio healthcare marketing rules are shaped by SMBO physician advertising regulations, CSPA consumer protection authority, and Ohio-specific supervision rules.",
    intro:
      "Ohio healthcare marketing compliance operates under State Medical Board of Ohio (SMBO) rules at OAC 4731-27, the Ohio Consumer Sales Practices Act (CSPA), and specific telehealth and supervision requirements. Ohio has been active on weight-loss clinic marketing and aesthetic-practice supervision representations.",
    medicalBoardName: "State Medical Board of Ohio (SMBO)",
    medicalBoardFocus:
      "OAC 4731-27 covers physician advertising rules including deceptive advertising prohibitions, specialty-claim requirements, and supervision representations. SMBO enforces against individual licensees and affiliated practice entities.",
    stateAgFocus:
      "Ohio CSPA provides AG consumer-protection authority and permits private action. Healthcare marketing enforcement has included weight-loss practice advertising and medication marketing. CSPA's treble-damages provision creates substantial exposure in appropriate cases.",
    focusAreas: [
      {
        title: "Nurse and non-physician practice supervision",
        body: "Ohio supervision requirements for aesthetic and medical service providers are enforced through SMBO and the Ohio Board of Nursing jointly. Marketing implying unsupervised practice is a focus.",
      },
      {
        title: "Weight-loss clinic marketing",
        body: "Ohio AG has been active on weight-loss practice advertising, particularly around compounded GLP-1 marketing and outcome-guarantee patterns.",
      },
      {
        title: "Telehealth marketing",
        body: "Ohio telehealth rules apply to any provider marketing to Ohio residents. SMBO has been active on telehealth practice advertising compliance.",
      },
      {
        title: "CSPA private enforcement",
        body: "CSPA permits class actions with statutory and treble damages, creating private-enforcement exposure.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence implications",
        why: "SMBO and Ohio Board of Nursing joint enforcement.",
      },
      {
        pattern: "Compounded-GLP-1 equivalence language",
        why: "Ohio AG CSPA activity.",
      },
      {
        pattern: "Specialty claims without proper certification",
        why: "SMBO specialty-claim enforcement.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "CSPA consumer-protection basis.",
      },
      {
        pattern: "Telehealth marketing without Ohio-specific framing",
        why: "Ohio telehealth rules apply to any provider marketing to Ohio residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas — SMBO and Board of Nursing supervision enforcement.",
      "Weight loss — Ohio AG CSPA activity on compounded-GLP-1.",
      "Aesthetic surgery — specialty claims and guarantee rules.",
      "Dental — Ohio State Dental Board separate rules.",
      "Regen medicine — federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Ohio healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Ohio-licensed healthcare marketing attorney.",
    keywords: [
      "Ohio healthcare marketing rules",
      "State Medical Board Ohio advertising",
      "OAC 4731-27",
      "Ohio CSPA healthcare",
      "Ohio telehealth marketing",
    ],
  },
  {
    slug: "georgia",
    state: "Georgia",
    abbreviation: "GA",
    title: "Georgia Healthcare Marketing Compliance Rules — GCMB and AG",
    description:
      "Georgia Composite Medical Board (GCMB) advertising rules and Fair Business Practices Act enforcement — with focus on aesthetic, weight loss, and regenerative medicine marketing.",
    heroTagline:
      "Georgia healthcare marketing is shaped by GCMB physician rules, the Fair Business Practices Act (FBPA), and growing enforcement attention on med spa and weight loss marketing.",
    intro:
      "Georgia healthcare marketing compliance operates under the Georgia Composite Medical Board (GCMB) rules and the Georgia Fair Business Practices Act (FBPA). Georgia has been an active state for aesthetic practice growth and has corresponding enforcement interest in aesthetic and weight-loss marketing.",
    medicalBoardName: "Georgia Composite Medical Board (GCMB)",
    medicalBoardFocus:
      "GCMB enforces advertising rules under Ga. Comp. R. & Regs. 360-3 and related provisions covering physician advertising, specialty claims, supervision representations, and testimonial rules. Enforcement has focused on cosmetic and aesthetic practice marketing.",
    stateAgFocus:
      "Georgia FBPA provides AG consumer-protection authority. Enforcement has included aesthetic practice pricing and package advertising, weight-loss marketing, and compounded medication advertising.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision and specialty claims",
        body: "GCMB has been active on supervision representations in med spa and aesthetic practice marketing, as well as specialty-claim accuracy.",
      },
      {
        title: "Compounded GLP-1 and weight-loss marketing",
        body: "Georgia's weight-loss clinic growth has drawn AG attention to compounded medication marketing and brand-equivalence language.",
      },
      {
        title: "Package pricing advertising",
        body: "FBPA enforcement has included aesthetic practice package pricing without adequate add-on disclosure.",
      },
      {
        title: "FBPA private enforcement",
        body: "FBPA permits private action with treble damages in appropriate cases.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse injector independence framing",
        why: "GCMB supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Georgia AG FBPA activity.",
      },
      {
        pattern: "Package pricing without clear add-on disclosure",
        why: "FBPA consumer-protection exposure.",
      },
      {
        pattern: "Specialty claims by non-certified physicians",
        why: "GCMB specialty-claim enforcement.",
      },
      {
        pattern: "Guarantee language",
        why: "Both GCMB and FBPA apply.",
      },
    ],
    specialtyCallouts: [
      "Med spas — GCMB enforcement on supervision and specialty claims.",
      "Weight loss — FBPA activity on compounded medication marketing.",
      "Aesthetic surgery — package pricing focus.",
      "Dental — Georgia Board of Dentistry rules separate.",
      "Regen medicine — following federal patterns.",
    ],
    disclaimer:
      "This summary reflects general patterns in Georgia healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Georgia-licensed healthcare marketing attorney.",
    keywords: [
      "Georgia healthcare marketing rules",
      "GCMB advertising",
      "Georgia FBPA healthcare",
      "Georgia med spa marketing",
      "Georgia telehealth rules",
    ],
  },
  {
    slug: "north-carolina",
    state: "North Carolina",
    abbreviation: "NC",
    title: "North Carolina Healthcare Marketing Compliance Rules — NCMB and AG",
    description:
      "North Carolina Medical Board (NCMB) physician advertising rules and Unfair and Deceptive Trade Practices Act (UDTPA) enforcement — focus on aesthetic, weight loss, and telehealth practice marketing.",
    heroTagline:
      "North Carolina's regulatory environment is shaped by NCMB rules, UDTPA consumer protection authority, and specific rules on physician advertising and supervision.",
    intro:
      "North Carolina healthcare marketing compliance operates under North Carolina Medical Board (NCMB) rules at 21 NCAC 32 and the North Carolina Unfair and Deceptive Trade Practices Act (UDTPA). NC is a growing healthcare market with corresponding enforcement attention on aesthetic practice and telehealth advertising.",
    medicalBoardName: "North Carolina Medical Board (NCMB)",
    medicalBoardFocus:
      "NCMB enforces 21 NCAC 32 advertising rules covering deceptive advertising prohibitions, specialty claims, supervision representations, and testimonial restrictions. Enforcement has focused on aesthetic practice marketing and telehealth prescribing representations.",
    stateAgFocus:
      "NC UDTPA permits AG and private action with treble damages. Healthcare marketing enforcement has included weight-loss clinic advertising, compounded medication marketing, and package pricing practices.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "NCMB supervision rules for non-physician injectors are actively enforced, with marketing implications a common focus area.",
      },
      {
        title: "Telehealth marketing",
        body: "NC has specific telehealth rules that apply to any provider marketing to NC residents.",
      },
      {
        title: "Compounded medication advertising",
        body: "NC AG has been active on compounded GLP-1 and related medication marketing.",
      },
      {
        title: "UDTPA treble-damage private actions",
        body: "UDTPA permits class actions with treble damages, creating meaningful private-enforcement exposure.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse injector independence representations",
        why: "NCMB supervision enforcement.",
      },
      {
        pattern: "Telehealth marketing without NC-licensure context",
        why: "NC telehealth rules apply to marketing to NC residents.",
      },
      {
        pattern: "Compounded medication brand-equivalence",
        why: "NC AG UDTPA activity.",
      },
      {
        pattern: "Outcome guarantees",
        why: "NCMB and UDTPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "NCMB specialty-claim standards.",
      },
    ],
    specialtyCallouts: [
      "Med spas — NCMB supervision focus.",
      "Weight loss / telehealth — NC AG UDTPA activity.",
      "Aesthetic surgery — specialty and guarantee rules.",
      "Dental — NC State Board of Dental Examiners rules separate.",
      "Regen medicine — federal patterns.",
    ],
    disclaimer:
      "This summary reflects general patterns in North Carolina healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a North Carolina-licensed healthcare marketing attorney.",
    keywords: [
      "North Carolina healthcare marketing rules",
      "NCMB advertising",
      "21 NCAC 32",
      "NC UDTPA healthcare",
      "NC telehealth marketing",
    ],
  },
  {
    slug: "michigan",
    state: "Michigan",
    abbreviation: "MI",
    title: "Michigan Healthcare Marketing Compliance Rules — LARA and AG",
    description:
      "Michigan Department of Licensing and Regulatory Affairs (LARA) rules for physician advertising and Michigan Consumer Protection Act enforcement — focus on aesthetic, weight loss, and telehealth practices.",
    heroTagline:
      "Michigan healthcare marketing is shaped by LARA licensing rules, MCPA consumer protection authority, and specific Michigan-specific supervision and telehealth rules.",
    intro:
      "Michigan healthcare marketing compliance operates under the Michigan Department of Licensing and Regulatory Affairs (LARA) — specifically the Michigan Board of Medicine and Board of Osteopathic Medicine and Surgery — and the Michigan Consumer Protection Act (MCPA). Michigan is a significant med spa and weight-loss market with corresponding enforcement attention.",
    medicalBoardName: "Michigan Board of Medicine (via LARA)",
    medicalBoardFocus:
      "Michigan physician advertising is governed by Public Health Code provisions and LARA rules covering deceptive advertising, specialty claims, supervision representations, and testimonial rules. Enforcement has focused on aesthetic and weight-loss practice marketing.",
    stateAgFocus:
      "Michigan MCPA provides AG consumer-protection authority and permits private action. Healthcare marketing enforcement has included compounded medication marketing, weight-loss advertising, and aesthetic practice pricing.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "Michigan LARA rules on supervision in aesthetic practice are actively enforced.",
      },
      {
        title: "Telehealth advertising",
        body: "Michigan has specific telehealth rules that affect marketing by out-of-state providers to Michigan residents.",
      },
      {
        title: "Compounded medication marketing",
        body: "MI AG has been active on compounded-GLP-1 marketing enforcement.",
      },
      {
        title: "MCPA class actions",
        body: "MCPA permits private class actions, creating exposure beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse injector independence language",
        why: "LARA supervision enforcement.",
      },
      {
        pattern: "Telehealth marketing to MI residents without licensure clarity",
        why: "Michigan telehealth rules apply to marketing.",
      },
      {
        pattern: "Compounded GLP-1 equivalence claims",
        why: "MI AG MCPA activity.",
      },
      {
        pattern: "Package pricing advertising",
        why: "MCPA disclosure standards.",
      },
      {
        pattern: "Guarantee language",
        why: "LARA and MCPA both apply.",
      },
    ],
    specialtyCallouts: [
      "Med spas — LARA supervision enforcement.",
      "Weight loss / telehealth — MCPA activity on compounded medication.",
      "Aesthetic surgery — package pricing and specialty rules.",
      "Dental — Michigan Board of Dentistry rules separate.",
      "Regen medicine — following federal enforcement patterns.",
    ],
    disclaimer:
      "This summary reflects general patterns in Michigan healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Michigan-licensed healthcare marketing attorney.",
    keywords: [
      "Michigan healthcare marketing rules",
      "Michigan LARA physician advertising",
      "Michigan Consumer Protection Act healthcare",
      "Michigan telehealth rules",
      "Michigan med spa marketing",
    ],
  },
]

export function getStateBySlug(slug: string): StateMeta | undefined {
  return STATES.find((s) => s.slug === slug)
}

export function getRelatedStates(slug: string, limit = 3): StateMeta[] {
  return STATES.filter((s) => s.slug !== slug).slice(0, limit)
}
