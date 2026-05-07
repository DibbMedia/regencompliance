import type { StateMeta } from "./types"

export const STATES: StateMeta[] = [
  {
    slug: "california",
    state: "California",
    abbreviation: "CA",
    title: "California Healthcare Marketing Compliance Rules - FDA, FTC, MBC & AG",
    description:
      "California has the most active state-level enforcement environment for healthcare marketing. Medical Board of California advertising rules, state AG consumer protection, and specialty board actions - with a focus on med spas, telehealth, and aesthetic practices.",
    heroTagline:
      "California healthcare marketing sits under the strictest state-level enforcement environment in the country - Medical Board of California rules, Business & Professions Code §17500 false advertising authority, and active AG consumer protection.",
    intro:
      "California is the single most-enforced state for healthcare marketing. The Medical Board of California (MBC) has its own detailed advertising rules in 16 CCR §1353.5; the Attorney General's office uses B&P §17200 and §17500 authority extensively against healthcare practices; and the state's Sherman Food, Drug, and Cosmetic Law mirrors federal FDA authority at state level. Practices marketing in California face a genuinely distinct and heavier regulatory surface than most states, and marketing written to 'meet federal rules' often still fails California-specific standards.",
    medicalBoardName: "Medical Board of California (MBC)",
    medicalBoardFocus:
      "The MBC actively enforces 16 CCR §1353.5 - which covers deceptive advertising by licensed physicians. Specialty-claim misuse ('cosmetic surgeon' by non-ABMS-certified physicians), supervision misrepresentation (particularly for med spa injectors), and outcome guarantee language are the most common bases for discipline. California also has specific rules on how physicians can advertise 'board-certified' status - requiring disclosure of the specific certifying board.",
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
        why: "Triggers both federal FDA misbranding and California Sherman Law violations - double exposure.",
      },
      {
        pattern: "Telehealth prescriber location not disclosed",
        why: "California AG has pursued telehealth practices for not clearly disclosing where the prescribing provider is actually located.",
      },
      {
        pattern: "Package pricing advertising without clear add-on disclosure",
        why: "California AG active enforcement area - particularly in aesthetic surgery and fertility practices.",
      },
      {
        pattern: "Patient testimonials with outcome specificity and no typical-experience disclosure",
        why: "§17500 provides state-level authority to pursue patterns federal FTC may not get to first.",
      },
    ],
    specialtyCallouts: [
      "Med spas - highest-enforcement specialty in California for supervision and injectable marketing.",
      "Weight loss / telehealth - growing state AG focus on cross-border prescribing.",
      "Aesthetic surgery - package pricing disclosure and 'board-certified' language specifically targeted.",
      "Dental - 'cosmetic dentist' misuse is active MBC-adjacent area (Dental Board of California handles dental).",
      "Regen medicine - Sherman Law creates state-level exposure in addition to federal CBER issues.",
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
    title: "Texas Healthcare Marketing Compliance Rules - TMB, AG, and Federal Overlap",
    description:
      "Texas Medical Board advertising rules, Texas Deceptive Trade Practices Act enforcement, and the specific supervision requirements that define Texas med spa and weight loss marketing compliance.",
    heroTagline:
      "Texas has an active Medical Board with specific rules for medical advertising, and the DTPA gives consumers and the state AG independent enforcement authority over deceptive healthcare marketing.",
    intro:
      "Texas healthcare marketing is shaped by the Texas Medical Board (TMB), the Texas Deceptive Trade Practices Act (DTPA), and the Texas AG's consumer protection authority. The TMB has specific advertising rules in 22 TAC §164 that cover physician-advertising conduct, specialty claim requirements, and supervision disclosures. The DTPA is unusual in permitting private plaintiffs to bring claims in addition to AG actions - creating multiple enforcement vectors for the same marketing conduct.",
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
        body: "Unlike most state consumer-protection laws, the DTPA permits private plaintiffs to sue - including class actions. Healthcare marketing that deceives consumers creates exposure to private lawsuits in addition to AG or Medical Board action.",
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
      "Med spas - supervision language is the primary TMB enforcement pattern.",
      "Weight loss / telehealth GLP-1 - Texas AG has prioritized this specialty under DTPA.",
      "Dental - the Texas State Board of Dental Examiners enforces its own advertising rules separately.",
      "Regen medicine - Texas has been a growth market with corresponding enforcement interest.",
      "Aesthetic surgery - 'board-certified' language is actively enforced.",
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
    title: "Florida Healthcare Marketing Compliance Rules - FL Medical Board and AG",
    description:
      "Florida Board of Medicine advertising rules under F.A.C. 64B8, the Florida Deceptive and Unfair Trade Practices Act (FDUTPA), and specific enforcement patterns in med spa, weight loss, and regenerative medicine marketing.",
    heroTagline:
      "Florida's regulatory environment is defined by the Board of Medicine, FDUTPA, and an AG office that has been active on healthcare marketing - particularly in the fast-growing med spa, weight-loss, and regen categories.",
    intro:
      "Florida is a healthcare practice destination - particularly for regen medicine, aesthetic surgery, and concierge medicine - and the regulatory environment reflects that. The Florida Board of Medicine (FBM) enforces specific advertising rules under F.A.C. 64B8, which include physician qualification disclosure, specialty claim rules, and deceptive-advertising prohibitions. FDUTPA provides state-AG and private enforcement over deceptive practices. Florida has been a particularly active jurisdiction for enforcement against stem cell and regenerative medicine marketing, given the volume of such practices in the state.",
    medicalBoardName: "Florida Board of Medicine (FBM)",
    medicalBoardFocus:
      "The FBM enforces F.A.C. 64B8-11 and related advertising rules. Specific focus areas include the 'board-certified' rule (requires ABMS or equivalent), specialty-claim accuracy, and supervision requirements in aesthetic practices. The FBM has also been active on cosmetic surgery marketing specifically - including handling of complications and the marketing of medical tourism.",
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
        body: "Florida's telehealth-friendly environment has produced substantial weight-loss practice growth - and corresponding state AG attention to marketing that minimizes clinical evaluation or misrepresents medication options.",
      },
      {
        title: "'Board-certified' enforcement",
        body: "Florida Board of Medicine enforces specific rules on 'board-certified' language - requiring ABMS or Florida-recognized equivalent certification. Non-ABMS board certification claims must be qualified.",
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
      "Regen medicine - Florida has particularly active state-level enforcement due to practice volume.",
      "Aesthetic surgery - 'board-certified' and medical-tourism disclosure are active focus areas.",
      "Weight loss / telehealth - AG activity under FDUTPA has grown.",
      "Med spas - FBM supervision enforcement is in line with other heavily-enforced states.",
      "Dental - Florida Board of Dentistry has separate advertising rules.",
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
    title: "New York Healthcare Marketing Compliance Rules - OPMC and AG",
    description:
      "New York's Office of Professional Medical Conduct (OPMC) rules on physician advertising, Executive Law §63(12) AG authority, and specific enforcement patterns in aesthetic, weight loss, and corporate practice of medicine contexts.",
    heroTagline:
      "New York's healthcare marketing environment is defined by OPMC, an aggressive AG office, and the state's particularly strict corporate-practice-of-medicine rules - each of which shapes how practices can advertise.",
    intro:
      "New York has one of the most distinctive healthcare marketing regulatory environments in the country. The Office of Professional Medical Conduct (OPMC) enforces physician conduct rules that include specific advertising prohibitions. Executive Law §63(12) gives the AG broad authority over persistent fraud, which has been used in healthcare marketing contexts. And New York's particularly strict interpretation of corporate-practice-of-medicine rules shapes how non-physician-owned entities can advertise healthcare services.",
    medicalBoardName: "New York Office of Professional Medical Conduct (OPMC)",
    medicalBoardFocus:
      "OPMC enforces Education Law §6530 prohibitions on deceptive advertising, specialty misrepresentation, and conduct-related marketing issues. New York has specific rules on how physicians can advertise - including rules on guarantees, superlative claims, and the use of patient testimonials. New York also has specific rules on the relationship between physicians and corporate service providers (including med spa corporate structures) that affect how advertising can be attributed and who is liable for violations.",
    stateAgFocus:
      "The NY AG uses Executive Law §63(12) for persistent-fraud enforcement and Consumer Protection Act authority for deceptive practices. Healthcare marketing enforcement has included cosmetic practice advertising, telehealth prescribing, and corporate-practice-of-medicine violations via marketing. The AG office has also been notably active on cross-border healthcare marketing - including marketing targeting New York residents by out-of-state providers.",
    focusAreas: [
      {
        title: "Corporate practice of medicine and marketing",
        body: "New York has particularly strict corporate-practice-of-medicine rules. Marketing that implies non-physician corporate entities provide medical services can trigger enforcement - including against corporate med spa chains, telehealth platforms, and franchise models.",
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
      "Aesthetic surgery - NY is particularly strict on 'best/top' superlatives and specialty claims.",
      "Med spas - corporate practice of medicine shapes what entities can advertise.",
      "Telehealth - cross-border advertising to NY residents is a focus area.",
      "Weight loss - intersection of telehealth and corporate-practice concerns.",
      "Regen medicine - AG enforcement has followed federal patterns.",
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
    title: "Illinois Healthcare Marketing Compliance Rules - IDFPR and AG",
    description:
      "Illinois Department of Financial and Professional Regulation (IDFPR) rules on physician advertising and the Illinois Consumer Fraud Act - with specific focus on med spa supervision, weight loss, and aesthetic practice marketing.",
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
      "Med spas - supervision language is primary IDFPR focus.",
      "Weight loss / telehealth - AG has been active on ICFA enforcement.",
      "Aesthetic surgery - package pricing and 'board-certified' standards apply.",
      "Dental - Illinois Dental Practice Act applies separately.",
      "Regen medicine - federal patterns generally mirrored in state enforcement.",
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
    title: "Pennsylvania Healthcare Marketing Compliance Rules - State Board of Medicine and AG",
    description:
      "Pennsylvania State Board of Medicine advertising rules and UTPCPL enforcement against healthcare marketing deception - with focus areas specific to PA's aesthetic, weight loss, and telehealth sectors.",
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
        body: "UTPCPL permits private action with treble damages - creating exposure to class-action litigation beyond AG enforcement.",
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
      "Med spas - supervision enforcement is primary focus.",
      "Weight loss / telehealth - PA AG activity under UTPCPL.",
      "Aesthetic surgery - guarantee and specialty rules apply.",
      "Dental - PA State Board of Dentistry rules separate.",
      "Compounding-pharmacy-affiliated clinics - growing enforcement area.",
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
    title: "Ohio Healthcare Marketing Compliance Rules - SMBO and AG",
    description:
      "State Medical Board of Ohio (SMBO) advertising rules and Ohio Consumer Sales Practices Act enforcement - with specific focus areas in aesthetic practice, weight loss, and telehealth marketing.",
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
      "Med spas - SMBO and Board of Nursing supervision enforcement.",
      "Weight loss - Ohio AG CSPA activity on compounded-GLP-1.",
      "Aesthetic surgery - specialty claims and guarantee rules.",
      "Dental - Ohio State Dental Board separate rules.",
      "Regen medicine - federal patterns mirrored.",
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
    title: "Georgia Healthcare Marketing Compliance Rules - GCMB and AG",
    description:
      "Georgia Composite Medical Board (GCMB) advertising rules and Fair Business Practices Act enforcement - with focus on aesthetic, weight loss, and regenerative medicine marketing.",
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
      "Med spas - GCMB enforcement on supervision and specialty claims.",
      "Weight loss - FBPA activity on compounded medication marketing.",
      "Aesthetic surgery - package pricing focus.",
      "Dental - Georgia Board of Dentistry rules separate.",
      "Regen medicine - following federal patterns.",
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
    title: "North Carolina Healthcare Marketing Compliance Rules - NCMB and AG",
    description:
      "North Carolina Medical Board (NCMB) physician advertising rules and Unfair and Deceptive Trade Practices Act (UDTPA) enforcement - focus on aesthetic, weight loss, and telehealth practice marketing.",
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
      "Med spas - NCMB supervision focus.",
      "Weight loss / telehealth - NC AG UDTPA activity.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - NC State Board of Dental Examiners rules separate.",
      "Regen medicine - federal patterns.",
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
    title: "Michigan Healthcare Marketing Compliance Rules - LARA and AG",
    description:
      "Michigan Department of Licensing and Regulatory Affairs (LARA) rules for physician advertising and Michigan Consumer Protection Act enforcement - focus on aesthetic, weight loss, and telehealth practices.",
    heroTagline:
      "Michigan healthcare marketing is shaped by LARA licensing rules, MCPA consumer protection authority, and specific Michigan-specific supervision and telehealth rules.",
    intro:
      "Michigan healthcare marketing compliance operates under the Michigan Department of Licensing and Regulatory Affairs (LARA) - specifically the Michigan Board of Medicine and Board of Osteopathic Medicine and Surgery - and the Michigan Consumer Protection Act (MCPA). Michigan is a significant med spa and weight-loss market with corresponding enforcement attention.",
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
      "Med spas - LARA supervision enforcement.",
      "Weight loss / telehealth - MCPA activity on compounded medication.",
      "Aesthetic surgery - package pricing and specialty rules.",
      "Dental - Michigan Board of Dentistry rules separate.",
      "Regen medicine - following federal enforcement patterns.",
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
  {
    slug: "new-jersey",
    state: "New Jersey",
    abbreviation: "NJ",
    title: "New Jersey Healthcare Marketing Compliance Rules - BME and AG",
    description:
      "New Jersey State Board of Medical Examiners advertising rules at N.J.A.C. 13:35-6.10, Consumer Fraud Act enforcement, and the AG-driven Division of Consumer Affairs activity that defines NJ healthcare marketing exposure.",
    heroTagline:
      "New Jersey runs one of the more aggressive AG-led consumer protection programs in the country, and the State Board of Medical Examiners has detailed advertising rules that pair with that authority.",
    intro:
      "New Jersey healthcare marketing operates under the State Board of Medical Examiners (BME), which enforces N.J.A.C. 13:35-6.10 - one of the more prescriptive state physician advertising rules in the country. The AG's Division of Consumer Affairs runs an active consumer protection program under the New Jersey Consumer Fraud Act (CFA), and healthcare marketing is a recurring focus, particularly in cosmetic surgery, weight loss, and telehealth contexts.",
    medicalBoardName: "New Jersey State Board of Medical Examiners (BME)",
    medicalBoardFocus:
      "The BME enforces N.J.A.C. 13:35-6.10, which has specific provisions covering deceptive advertising, before/after photo disclosure, testimonial handling, guarantee restrictions, and 'board-certified' language. New Jersey also has unusually clear rules on how cosmetic and aesthetic specialties may be claimed and what constitutes a fee-disclosure violation in advertised pricing.",
    stateAgFocus:
      "The NJ AG (through Division of Consumer Affairs) uses the Consumer Fraud Act, which provides treble damages and attorney fees - making private CFA actions a meaningful additional risk vector beyond AG enforcement. Recent enforcement has included cosmetic surgery package pricing, telehealth weight-loss marketing, and medical-spa supervision representations.",
    focusAreas: [
      {
        title: "Cosmetic surgery package pricing disclosure",
        body: "N.J.A.C. 13:35-6.10 has specific fee-disclosure requirements when prices are advertised. New Jersey AG has pursued cosmetic practices for inadequate disclosure of additional charges (anesthesia, facility fees, post-op care) in advertised package pricing.",
      },
      {
        title: "'Board-certified' enforcement",
        body: "BME requires specific certifying-board disclosure and only recognizes ABMS or BME-approved equivalents. Use of non-recognized board certifications without qualification has been a recurring disciplinary basis.",
      },
      {
        title: "Med spa supervision representations",
        body: "BME enforces supervision requirements for non-physician injectors. Marketing language implying nurse-injector independence is treated as supervision misrepresentation.",
      },
      {
        title: "Consumer Fraud Act treble exposure",
        body: "CFA permits private suits with treble damages and fees, creating exposure to class actions in addition to AG action.",
      },
    ],
    watchItems: [
      {
        pattern: "Package pricing without explicit add-on disclosure",
        why: "BME and CFA both have direct authority on inadequate fee disclosure.",
      },
      {
        pattern: "'Board-certified' without ABMS-or-equivalent qualifier",
        why: "BME enforces specific board-certification disclosure rules.",
      },
      {
        pattern: "Nurse-injector independence language",
        why: "BME treats implied independence as supervision misrepresentation.",
      },
      {
        pattern: "Outcome guarantees in cosmetic or weight-loss marketing",
        why: "Both BME advertising rules and CFA private-action exposure apply.",
      },
      {
        pattern: "Before/after photos without typical-experience disclosure",
        why: "N.J.A.C. 13:35-6.10 has specific before/after disclosure provisions.",
      },
    ],
    specialtyCallouts: [
      "Cosmetic and aesthetic surgery - package pricing and 'board-certified' rules apply.",
      "Med spas - BME supervision enforcement is active.",
      "Weight loss / telehealth - Division of Consumer Affairs activity under CFA.",
      "Dental - New Jersey State Board of Dentistry enforces parallel advertising rules.",
      "Regen medicine - federal patterns mirrored in state enforcement.",
    ],
    disclaimer:
      "This summary reflects general patterns in New Jersey healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a New Jersey-licensed healthcare marketing attorney.",
    keywords: [
      "New Jersey healthcare marketing rules",
      "NJ Board of Medical Examiners advertising",
      "N.J.A.C. 13:35-6.10",
      "New Jersey Consumer Fraud Act healthcare",
      "NJ med spa marketing",
    ],
  },
  {
    slug: "massachusetts",
    state: "Massachusetts",
    abbreviation: "MA",
    title: "Massachusetts Healthcare Marketing Compliance Rules - BORM and AG",
    description:
      "Massachusetts Board of Registration in Medicine advertising rules at 243 CMR 2.07, Chapter 93A consumer protection enforcement, and the AG-led oversight that shapes MA healthcare marketing exposure.",
    heroTagline:
      "Massachusetts pairs detailed Board of Registration in Medicine advertising rules with one of the most plaintiff-friendly consumer protection statutes in the country, Chapter 93A.",
    intro:
      "Massachusetts healthcare marketing compliance operates under the Board of Registration in Medicine (BORM), which enforces 243 CMR 2.07 advertising rules, and the Massachusetts AG's Chapter 93A authority. Chapter 93A is unusually broad and provides treble damages plus attorney fees, which makes Massachusetts a meaningful private-litigation jurisdiction for healthcare marketing in addition to AG enforcement.",
    medicalBoardName: "Massachusetts Board of Registration in Medicine (BORM)",
    medicalBoardFocus:
      "BORM enforces 243 CMR 2.07, which restricts deceptive advertising, regulates testimonial use, requires substantiation for outcome claims, and limits guarantee language. Massachusetts has also been active on physician-owned corporate-entity marketing and on supervision representations in aesthetic practice.",
    stateAgFocus:
      "The MA AG uses Chapter 93A authority - one of the broadest consumer protection statutes in the country - against deceptive healthcare marketing. Recent enforcement has included telehealth prescribing advertising, compounded medication marketing, and cosmetic practice pricing. Chapter 93A also permits private actions with treble damages and fees, creating significant class-action exposure.",
    focusAreas: [
      {
        title: "Chapter 93A private enforcement",
        body: "Chapter 93A is the most plaintiff-friendly consumer protection statute in the US. Healthcare marketing that misleads consumers can face class actions with treble damages even where AG enforcement does not act.",
      },
      {
        title: "Testimonial and substantiation rules",
        body: "BORM 243 CMR 2.07 has specific rules on testimonial use and on substantiation for outcome claims. Massachusetts has been active on aesthetic and weight-loss practice testimonials.",
      },
      {
        title: "Compounded medication marketing",
        body: "Massachusetts has heightened sensitivity to compounding-pharmacy marketing following the NECC tragedy. AG enforcement on compounded GLP-1 and related medication marketing has been notably active.",
      },
      {
        title: "Supervision representations",
        body: "BORM enforces supervision rules for non-physician practitioners in aesthetic settings. Marketing implying independent practice is treated as a substantive disciplinary matter.",
      },
    ],
    watchItems: [
      {
        pattern: "Outcome guarantees in any medical advertising",
        why: "BORM rules and Chapter 93A both create substantial exposure.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "MA AG has been active on compounded medication marketing under Chapter 93A.",
      },
      {
        pattern: "Testimonials without substantiation or typical-experience disclosure",
        why: "BORM 243 CMR 2.07 substantiation rules.",
      },
      {
        pattern: "Telehealth marketing minimizing clinical evaluation",
        why: "MA AG and BORM both have authority on this pattern.",
      },
      {
        pattern: "Nurse-injector independence representations",
        why: "BORM supervision enforcement.",
      },
    ],
    specialtyCallouts: [
      "Compounded medication clinics - heightened scrutiny post-NECC.",
      "Med spas - BORM supervision and substantiation rules.",
      "Weight loss / telehealth - active MA AG Chapter 93A focus.",
      "Aesthetic surgery - testimonial and guarantee rules.",
      "Dental - Massachusetts Board of Registration in Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Massachusetts healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Massachusetts-licensed healthcare marketing attorney.",
    keywords: [
      "Massachusetts healthcare marketing rules",
      "BORM advertising 243 CMR 2.07",
      "Chapter 93A healthcare",
      "MA telehealth marketing",
      "Massachusetts med spa compliance",
    ],
  },
  {
    slug: "connecticut",
    state: "Connecticut",
    abbreviation: "CT",
    title: "Connecticut Healthcare Marketing Compliance Rules - DPH and AG",
    description:
      "Connecticut Department of Public Health Medical Examining Board advertising rules and CUTPA enforcement - with focus areas in aesthetic, weight loss, and telehealth marketing.",
    heroTagline:
      "Connecticut healthcare marketing sits under DPH licensing oversight and CUTPA consumer protection authority - with an AG office that has been active on healthcare advertising enforcement.",
    intro:
      "Connecticut healthcare marketing compliance operates under the Connecticut Department of Public Health (DPH), specifically the Medical Examining Board, and the Connecticut Unfair Trade Practices Act (CUTPA). CUTPA permits both AG and private action with attorney-fee shifting, creating meaningful private-enforcement exposure on healthcare marketing.",
    medicalBoardName: "Connecticut Medical Examining Board (under DPH)",
    medicalBoardFocus:
      "DPH and the Medical Examining Board enforce physician advertising standards under Conn. Agencies Regs. covering deceptive advertising, specialty claims, supervision representations, and testimonial rules. Connecticut has been active on aesthetic and telehealth marketing enforcement.",
    stateAgFocus:
      "The CT AG uses CUTPA authority for healthcare marketing enforcement. Recent enforcement has focused on weight-loss clinic advertising, compounded medication marketing, and aesthetic practice package pricing. CUTPA permits private action with attorney fees, creating class-action exposure.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision and marketing",
        body: "DPH has been active on supervision representations in med spa contexts and on specialty-claim accuracy in cosmetic practice marketing.",
      },
      {
        title: "Telehealth advertising",
        body: "Connecticut telehealth rules apply to providers marketing to CT residents regardless of provider location. Marketing minimizing evaluation requirements has drawn AG scrutiny.",
      },
      {
        title: "Compounded medication marketing",
        body: "CT AG has been active on compounded GLP-1 marketing under CUTPA, particularly on brand-equivalence representations.",
      },
      {
        title: "CUTPA class actions",
        body: "CUTPA's private-right-of-action with fee shifting creates exposure to class actions beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Compounded GLP-1 brand-equivalence language",
        why: "CT AG has pursued this pattern under CUTPA.",
      },
      {
        pattern: "Nurse-injector independence framing",
        why: "DPH supervision enforcement.",
      },
      {
        pattern: "Telehealth advertising without CT-licensure clarity",
        why: "Connecticut telehealth rules apply to any provider marketing to CT patients.",
      },
      {
        pattern: "Outcome guarantees on medical or weight-loss services",
        why: "DPH rules and CUTPA both apply.",
      },
      {
        pattern: "Specialty claims by non-certified physicians",
        why: "Medical Examining Board specialty-claim enforcement.",
      },
    ],
    specialtyCallouts: [
      "Med spas - DPH supervision focus.",
      "Weight loss / telehealth - CT AG CUTPA activity.",
      "Aesthetic surgery - specialty and guarantee rules apply.",
      "Dental - Connecticut Dental Commission rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Connecticut healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Connecticut-licensed healthcare marketing attorney.",
    keywords: [
      "Connecticut healthcare marketing rules",
      "Connecticut DPH physician advertising",
      "CUTPA healthcare",
      "CT telehealth marketing",
      "Connecticut med spa compliance",
    ],
  },
  {
    slug: "washington",
    state: "Washington",
    abbreviation: "WA",
    title: "Washington Healthcare Marketing Compliance Rules - MQAC and AG",
    description:
      "Washington Medical Quality Assurance Commission (MQAC) advertising rules and Consumer Protection Act enforcement - with state-specific telehealth and aesthetic practice focus.",
    heroTagline:
      "Washington pairs an active Medical Quality Assurance Commission with one of the most aggressive AG offices in the country, particularly under the state Consumer Protection Act.",
    intro:
      "Washington healthcare marketing compliance operates under the Medical Quality Assurance Commission (MQAC), which enforces physician advertising rules under WAC 246-919, and the Washington Consumer Protection Act (WACPA). The AG office has historically been one of the most active in the country on consumer protection, including healthcare marketing enforcement.",
    medicalBoardName: "Washington Medical Quality Assurance Commission (MQAC)",
    medicalBoardFocus:
      "MQAC enforces WAC 246-919 advertising provisions including deceptive advertising prohibitions, specialty-claim requirements, supervision representations, and testimonial rules. Washington has been active on cosmetic practice supervision and telehealth practice advertising.",
    stateAgFocus:
      "The WA AG is among the most active consumer-protection AG offices nationally. WACPA enforcement has included telehealth prescribing marketing, compounded medication advertising, and aesthetic practice package pricing. WACPA permits private action with treble damages.",
    focusAreas: [
      {
        title: "Telehealth prescribing advertising",
        body: "Washington has been an early-mover state on telehealth regulation. Marketing that minimizes evaluation steps or misrepresents prescribing standards has drawn both MQAC and AG attention.",
      },
      {
        title: "Aesthetic practice supervision",
        body: "MQAC enforces supervision rules for non-physician injectors. Marketing implying independent practice is treated as a substantive disciplinary matter.",
      },
      {
        title: "Compounded medication marketing",
        body: "WA AG has been active on compounded GLP-1 marketing under WACPA, including brand-equivalence and disease-treatment representations.",
      },
      {
        title: "WACPA private actions",
        body: "WACPA permits private suits with treble damages, creating class-action exposure beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Telehealth marketing minimizing clinical evaluation",
        why: "Both MQAC and WA AG have pursued this pattern.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "WA AG WACPA enforcement.",
      },
      {
        pattern: "Nurse-injector independence representations",
        why: "MQAC supervision enforcement.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "MQAC rules and WACPA both apply.",
      },
      {
        pattern: "Cross-border telehealth marketing without WA-compliance framing",
        why: "Washington telehealth rules apply to providers marketing to WA residents.",
      },
    ],
    specialtyCallouts: [
      "Telehealth - WA has historically been an aggressive state on telehealth marketing.",
      "Med spas - MQAC supervision enforcement.",
      "Weight loss - WA AG active on compounded medication.",
      "Aesthetic surgery - specialty and guarantee rules apply.",
      "Dental - Washington Dental Quality Assurance Commission rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Washington healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Washington-licensed healthcare marketing attorney.",
    keywords: [
      "Washington healthcare marketing rules",
      "MQAC advertising WAC 246-919",
      "Washington Consumer Protection Act healthcare",
      "WA telehealth marketing",
      "Washington med spa compliance",
    ],
  },
  {
    slug: "colorado",
    state: "Colorado",
    abbreviation: "CO",
    title: "Colorado Healthcare Marketing Compliance Rules - DORA and AG",
    description:
      "Colorado Medical Board (under DORA) advertising rules and Colorado Consumer Protection Act enforcement - with focus on med spa, weight loss, and telehealth practice marketing.",
    heroTagline:
      "Colorado healthcare marketing operates under DORA's Medical Board, the Consumer Protection Act, and a regulatory environment shaped by the state's high concentration of aesthetic and wellness practices.",
    intro:
      "Colorado healthcare marketing compliance operates under the Department of Regulatory Agencies (DORA) - specifically the Colorado Medical Board - and the Colorado Consumer Protection Act (CCPA). Colorado is a substantial aesthetic and wellness practice market, and enforcement has reflected the volume of practices in the state.",
    medicalBoardName: "Colorado Medical Board (under DORA)",
    medicalBoardFocus:
      "The Colorado Medical Board enforces 3 CCR 713-32 advertising rules including deceptive advertising prohibitions, specialty claims, supervision representations, and outcome-claim substantiation. Enforcement has been particularly active in med spa and aesthetic practice contexts.",
    stateAgFocus:
      "Colorado AG uses CCPA authority. Recent healthcare marketing enforcement has included compounded medication marketing, telehealth prescribing advertising, and aesthetic practice package pricing. CCPA permits private action.",
    focusAreas: [
      {
        title: "Med spa supervision and specialty representation",
        body: "Colorado Medical Board has been notably active on med spa enforcement, including supervision representations and 'cosmetic surgeon' specialty claims by non-certified physicians.",
      },
      {
        title: "Telehealth and weight-loss marketing",
        body: "Colorado has a substantial telehealth weight-loss market. AG enforcement has focused on compounded GLP-1 marketing and on advertising that minimizes clinical evaluation requirements.",
      },
      {
        title: "Wellness and longevity practice marketing",
        body: "Colorado has a high concentration of wellness, peptide, and longevity practices. Marketing that crosses into disease-treatment claims has drawn both Medical Board and AG attention.",
      },
      {
        title: "CCPA private-action exposure",
        body: "CCPA permits private suits and class actions, adding to AG enforcement risk.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "Colorado Medical Board supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Colorado AG CCPA activity.",
      },
      {
        pattern: "Peptide or NAD+ marketing with disease-treatment claims",
        why: "Both Medical Board and AG have authority on this pattern.",
      },
      {
        pattern: "'Cosmetic surgeon' by non-ABMS-certified physicians",
        why: "Medical Board specialty-claim enforcement.",
      },
      {
        pattern: "Outcome guarantees on aesthetic or wellness services",
        why: "3 CCR 713-32 and CCPA both apply.",
      },
    ],
    specialtyCallouts: [
      "Med spas - Colorado Medical Board has been notably active.",
      "Weight loss / telehealth - active AG focus on compounded medication.",
      "Wellness and peptide practices - disease-claim risk on growing inventory of products.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - Colorado Dental Board rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Colorado healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Colorado-licensed healthcare marketing attorney.",
    keywords: [
      "Colorado healthcare marketing rules",
      "Colorado Medical Board advertising",
      "3 CCR 713-32",
      "Colorado Consumer Protection Act healthcare",
      "Colorado med spa compliance",
    ],
  },
  {
    slug: "minnesota",
    state: "Minnesota",
    abbreviation: "MN",
    title: "Minnesota Healthcare Marketing Compliance Rules - BMP and AG",
    description:
      "Minnesota Board of Medical Practice (BMP) advertising rules and Minnesota Consumer Fraud Act / Deceptive Trade Practices Act enforcement - with focus on telehealth, weight loss, and aesthetic marketing.",
    heroTagline:
      "Minnesota's regulatory environment combines an active Board of Medical Practice with a uniquely AG-friendly consumer protection framework that creates meaningful healthcare marketing exposure.",
    intro:
      "Minnesota healthcare marketing compliance operates under the Minnesota Board of Medical Practice (BMP) and the Minnesota Consumer Fraud Act (CFA) plus the Minnesota Deceptive Trade Practices Act (MDTPA). Minnesota's AG office has been historically active on consumer protection issues, and healthcare marketing has been a recurring focus area.",
    medicalBoardName: "Minnesota Board of Medical Practice (BMP)",
    medicalBoardFocus:
      "BMP enforces Minn. Stat. 147 and Minn. Rules 5605 advertising provisions including deceptive advertising, specialty claims, testimonial restrictions, and supervision representations. Enforcement has focused on aesthetic practice and telehealth marketing.",
    stateAgFocus:
      "Minnesota AG uses CFA and MDTPA authority. Recent healthcare marketing enforcement has included weight-loss telehealth marketing, compounded medication advertising, and aesthetic practice package pricing.",
    focusAreas: [
      {
        title: "Telehealth and weight-loss advertising",
        body: "Minnesota AG has been active on weight-loss and telehealth marketing under CFA and MDTPA, particularly on representations that minimize clinical evaluation.",
      },
      {
        title: "Aesthetic practice supervision",
        body: "BMP enforces supervision rules in med spa contexts; marketing implying independent injector practice is a recurring focus.",
      },
      {
        title: "Compounded medication marketing",
        body: "Minnesota AG has pursued compounded-GLP-1 marketing including brand-equivalence and outcome representations.",
      },
      {
        title: "MDTPA injunctive enforcement",
        body: "MDTPA permits private action for injunctive relief and fee-shifting, creating private-enforcement exposure.",
      },
    ],
    watchItems: [
      {
        pattern: "Telehealth marketing minimizing clinical evaluation",
        why: "MN AG CFA / MDTPA activity.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence representations",
        why: "MN AG enforcement on compounded medication marketing.",
      },
      {
        pattern: "Nurse-injector independence framing",
        why: "BMP supervision enforcement.",
      },
      {
        pattern: "Specialty misrepresentation in cosmetic marketing",
        why: "BMP specialty-claim enforcement.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "Both BMP rules and CFA/MDTPA apply.",
      },
    ],
    specialtyCallouts: [
      "Telehealth weight loss - MN AG active enforcement.",
      "Med spas - BMP supervision focus.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - Minnesota Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Minnesota healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Minnesota-licensed healthcare marketing attorney.",
    keywords: [
      "Minnesota healthcare marketing rules",
      "Minnesota Board of Medical Practice advertising",
      "Minn Stat 147",
      "Minnesota Consumer Fraud Act healthcare",
      "MN telehealth marketing",
    ],
  },
  {
    slug: "arizona",
    state: "Arizona",
    abbreviation: "AZ",
    title: "Arizona Healthcare Marketing Compliance Rules - AzMB and AG",
    description:
      "Arizona Medical Board (AzMB) and Arizona Regulatory Board of Osteopathic Examiners advertising rules, plus Arizona Consumer Fraud Act enforcement on healthcare marketing.",
    heroTagline:
      "Arizona's regulatory environment is shaped by the Arizona Medical Board, the Osteopathic Board, and an AG office that has been active on healthcare marketing under the Consumer Fraud Act.",
    intro:
      "Arizona healthcare marketing compliance operates under the Arizona Medical Board (AzMB) for MDs and the Arizona Regulatory Board of Osteopathic Examiners (AOA) for DOs, with AG authority under the Arizona Consumer Fraud Act. Arizona has been a substantial growth market for med spas, regenerative medicine, and weight-loss telehealth practices, with corresponding enforcement attention.",
    medicalBoardName: "Arizona Medical Board (AzMB)",
    medicalBoardFocus:
      "AzMB enforces A.A.C. R4-16 advertising provisions including deceptive advertising prohibitions, specialty claims, supervision representations, and testimonial rules. Enforcement has been particularly active in cosmetic and aesthetic practice contexts.",
    stateAgFocus:
      "Arizona AG uses Consumer Fraud Act authority. Recent enforcement has included compounded medication marketing, telehealth prescribing advertising, and aesthetic practice package pricing. The Arizona Consumer Fraud Act permits AG and limited private action.",
    focusAreas: [
      {
        title: "Med spa supervision and specialty",
        body: "AzMB has been active on med spa enforcement, including supervision representations and 'cosmetic surgeon' specialty claims.",
      },
      {
        title: "Regenerative medicine marketing",
        body: "Arizona has a substantial regen medicine practice base. State enforcement has tracked federal FDA action on disease-treatment and FDA-approval representations.",
      },
      {
        title: "Telehealth and weight-loss advertising",
        body: "Arizona AG has been active on compounded GLP-1 marketing and on telehealth marketing minimizing evaluation requirements.",
      },
      {
        title: "Cross-border marketing",
        body: "Arizona attracts healthcare marketing aimed at out-of-state residents, particularly in aesthetic and wellness contexts. Marketing must meet Arizona standards regardless of audience.",
      },
    ],
    watchItems: [
      {
        pattern: "Stem cell or regen claims with disease treatment language",
        why: "State enforcement parallels federal FDA action on this pattern.",
      },
      {
        pattern: "Nurse-injector independence representations",
        why: "AzMB supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Arizona AG Consumer Fraud Act activity.",
      },
      {
        pattern: "'Cosmetic surgeon' by non-ABMS-certified physicians",
        why: "AzMB specialty-claim enforcement.",
      },
      {
        pattern: "Outcome guarantees in aesthetic or wellness marketing",
        why: "AzMB rules and Consumer Fraud Act both apply.",
      },
    ],
    specialtyCallouts: [
      "Med spas - AzMB supervision and specialty enforcement.",
      "Regen medicine - state enforcement tracks federal patterns.",
      "Weight loss / telehealth - AG activity on compounded medication.",
      "Aesthetic surgery - specialty rules and guarantee restrictions.",
      "Dental - Arizona State Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Arizona healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Arizona-licensed healthcare marketing attorney.",
    keywords: [
      "Arizona healthcare marketing rules",
      "Arizona Medical Board advertising",
      "A.A.C. R4-16",
      "Arizona Consumer Fraud Act healthcare",
      "Arizona med spa compliance",
    ],
  },
  {
    slug: "virginia",
    state: "Virginia",
    abbreviation: "VA",
    title: "Virginia Healthcare Marketing Compliance Rules - Board of Medicine and AG",
    description:
      "Virginia Board of Medicine advertising rules under 18 VAC 85, the Virginia Consumer Protection Act, and AG-led enforcement on healthcare marketing.",
    heroTagline:
      "Virginia healthcare marketing operates under Board of Medicine advertising rules and the Virginia Consumer Protection Act, with active AG attention on cosmetic, weight loss, and telehealth practice advertising.",
    intro:
      "Virginia healthcare marketing compliance operates under the Virginia Board of Medicine, which enforces 18 VAC 85 advertising rules, and the Virginia Consumer Protection Act (VCPA). Virginia has been a steady-growth healthcare market with corresponding enforcement attention on cosmetic and telehealth practices.",
    medicalBoardName: "Virginia Board of Medicine",
    medicalBoardFocus:
      "The Virginia Board of Medicine enforces 18 VAC 85 advertising provisions including deceptive advertising prohibitions, specialty-claim requirements, supervision representations, and testimonial restrictions. Enforcement focus has included med spa and aesthetic practice marketing.",
    stateAgFocus:
      "Virginia AG uses VCPA authority for healthcare marketing enforcement. Recent enforcement has focused on weight-loss telehealth advertising, compounded medication marketing, and aesthetic practice package pricing.",
    focusAreas: [
      {
        title: "Med spa supervision representations",
        body: "Virginia Board of Medicine enforces supervision rules for non-physician injectors. Marketing that implies independent injector practice has been a disciplinary focus.",
      },
      {
        title: "Telehealth advertising",
        body: "Virginia telehealth rules apply to providers marketing to VA residents regardless of provider location. Marketing that minimizes clinical evaluation has drawn AG attention.",
      },
      {
        title: "Compounded medication marketing",
        body: "VA AG has pursued compounded-GLP-1 marketing under VCPA, including brand-equivalence representations.",
      },
      {
        title: "VCPA private-action exposure",
        body: "VCPA permits private action with treble damages and fee shifting in appropriate cases.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence framing",
        why: "Board of Medicine supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Virginia AG VCPA activity.",
      },
      {
        pattern: "Telehealth advertising without VA-licensure clarity",
        why: "VA telehealth rules apply to marketing to VA residents.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "Board of Medicine rules and VCPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation in aesthetic marketing",
        why: "Board of Medicine specialty-claim enforcement.",
      },
    ],
    specialtyCallouts: [
      "Med spas - Board of Medicine supervision focus.",
      "Weight loss / telehealth - AG VCPA activity.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - Virginia Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Virginia healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Virginia-licensed healthcare marketing attorney.",
    keywords: [
      "Virginia healthcare marketing rules",
      "Virginia Board of Medicine advertising",
      "18 VAC 85",
      "Virginia Consumer Protection Act healthcare",
      "VA telehealth marketing",
    ],
  },
  {
    slug: "maryland",
    state: "Maryland",
    abbreviation: "MD",
    title: "Maryland Healthcare Marketing Compliance Rules - MBP and AG",
    description:
      "Maryland Board of Physicians (MBP) advertising rules under COMAR 10.32 and Maryland Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Maryland's regulatory environment is shaped by the Board of Physicians, the Consumer Protection Act, and an AG office with significant authority on healthcare marketing.",
    intro:
      "Maryland healthcare marketing compliance operates under the Maryland Board of Physicians (MBP), which enforces COMAR 10.32 advertising provisions, and the Maryland Consumer Protection Act (MCPA). Maryland has been an active state for cosmetic and telehealth practice growth with corresponding enforcement attention.",
    medicalBoardName: "Maryland Board of Physicians (MBP)",
    medicalBoardFocus:
      "MBP enforces COMAR 10.32 advertising rules including deceptive advertising prohibitions, specialty claims, supervision representations, and testimonial standards. Maryland has specific provisions on physician-owned corporate-entity marketing.",
    stateAgFocus:
      "Maryland AG uses MCPA authority for healthcare marketing enforcement. Recent enforcement has focused on weight-loss telehealth advertising, compounded medication marketing, and aesthetic practice package pricing. MCPA permits private action.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "MBP enforces supervision rules for non-physician practitioners in aesthetic settings. Marketing implying independent practice is a focus area.",
      },
      {
        title: "Telehealth and weight-loss advertising",
        body: "Maryland AG has been active on telehealth marketing and compounded GLP-1 advertising under MCPA.",
      },
      {
        title: "Specialty-claim enforcement",
        body: "MBP enforces specific 'board-certified' standards requiring ABMS or equivalent certification disclosure.",
      },
      {
        title: "MCPA private actions",
        body: "MCPA permits private action and class actions, creating private-enforcement exposure.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "MBP supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "MD AG MCPA activity.",
      },
      {
        pattern: "Telehealth marketing without MD-licensure clarity",
        why: "Maryland telehealth rules apply to providers marketing to MD residents.",
      },
      {
        pattern: "'Board-certified' without ABMS-or-equivalent qualifier",
        why: "MBP specialty-claim enforcement.",
      },
      {
        pattern: "Outcome guarantees on cosmetic or weight-loss services",
        why: "MBP rules and MCPA both apply.",
      },
    ],
    specialtyCallouts: [
      "Med spas - MBP supervision focus.",
      "Weight loss / telehealth - AG MCPA activity.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - Maryland State Board of Dental Examiners rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Maryland healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Maryland-licensed healthcare marketing attorney.",
    keywords: [
      "Maryland healthcare marketing rules",
      "Maryland Board of Physicians advertising",
      "COMAR 10.32",
      "Maryland Consumer Protection Act healthcare",
      "MD telehealth marketing",
    ],
  },
  {
    slug: "tennessee",
    state: "Tennessee",
    abbreviation: "TN",
    title: "Tennessee Healthcare Marketing Compliance Rules - BME and AG",
    description:
      "Tennessee Board of Medical Examiners advertising rules and Tennessee Consumer Protection Act enforcement - with focus on cosmetic, weight loss, and telehealth marketing.",
    heroTagline:
      "Tennessee healthcare marketing operates under Board of Medical Examiners rules and the Consumer Protection Act, with growing enforcement attention on aesthetic and weight-loss marketing.",
    intro:
      "Tennessee healthcare marketing compliance operates under the Tennessee Board of Medical Examiners and the Tennessee Consumer Protection Act (TCPA). Tennessee has been a substantial growth market for med spas, weight-loss telehealth, and regenerative medicine practices, with corresponding state-level enforcement attention.",
    medicalBoardName: "Tennessee Board of Medical Examiners",
    medicalBoardFocus:
      "The TN Board of Medical Examiners enforces Tenn. Comp. R. & Regs. 0880 advertising rules including deceptive advertising prohibitions, specialty claims, supervision representations, and testimonial restrictions. Enforcement has focused on med spa and aesthetic practice marketing.",
    stateAgFocus:
      "Tennessee AG uses TCPA authority. Recent enforcement has focused on weight-loss telehealth marketing, compounded medication advertising, and aesthetic practice package pricing. TCPA permits AG and private action.",
    focusAreas: [
      {
        title: "Med spa supervision and specialty",
        body: "TN Board of Medical Examiners has been active on med spa supervision representations and specialty-claim accuracy.",
      },
      {
        title: "Compounded medication and weight-loss marketing",
        body: "Tennessee AG has been active on compounded GLP-1 marketing and on weight-loss advertising that minimizes clinical evaluation.",
      },
      {
        title: "Regenerative medicine marketing",
        body: "Tennessee has a substantial regen medicine practice base. State enforcement has paralleled federal FDA action on disease-treatment claims.",
      },
      {
        title: "TCPA private enforcement",
        body: "TCPA permits private action with treble damages in appropriate cases.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "Board of Medical Examiners supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "TN AG TCPA activity.",
      },
      {
        pattern: "Stem cell or regen marketing with disease-treatment claims",
        why: "State enforcement parallels federal FDA action.",
      },
      {
        pattern: "Outcome guarantees on aesthetic or weight-loss services",
        why: "Board rules and TCPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation in cosmetic marketing",
        why: "Board specialty-claim enforcement.",
      },
    ],
    specialtyCallouts: [
      "Med spas - Board of Medical Examiners supervision focus.",
      "Regen medicine - state enforcement tracks federal patterns.",
      "Weight loss / telehealth - AG TCPA activity.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - Tennessee Board of Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Tennessee healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Tennessee-licensed healthcare marketing attorney.",
    keywords: [
      "Tennessee healthcare marketing rules",
      "Tennessee Board of Medical Examiners advertising",
      "Tenn Comp R 0880",
      "Tennessee Consumer Protection Act healthcare",
      "TN med spa compliance",
    ],
  },
  {
    slug: "oregon",
    state: "Oregon",
    abbreviation: "OR",
    title: "Oregon Healthcare Marketing Compliance Rules - OMB and AG",
    description:
      "Oregon Medical Board (OMB) advertising rules and Oregon Unlawful Trade Practices Act enforcement - with focus on med spa, weight loss, and telehealth marketing.",
    heroTagline:
      "Oregon's regulatory environment combines an active Medical Board with the Unlawful Trade Practices Act, which permits broad consumer-protection enforcement on healthcare marketing.",
    intro:
      "Oregon healthcare marketing compliance operates under the Oregon Medical Board (OMB) and the Oregon Unlawful Trade Practices Act (UTPA). Oregon has been a growing market for cosmetic, wellness, and telehealth practices with corresponding enforcement attention.",
    medicalBoardName: "Oregon Medical Board (OMB)",
    medicalBoardFocus:
      "OMB enforces OAR 847 advertising rules including deceptive advertising prohibitions, specialty claims, supervision representations, and testimonial standards. Oregon has been particularly active on med spa and aesthetic practice supervision.",
    stateAgFocus:
      "Oregon AG uses UTPA authority. Recent healthcare marketing enforcement has included weight-loss telehealth marketing, compounded medication advertising, and aesthetic practice package pricing. UTPA permits private action with attorney fees.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "OMB enforces supervision rules for non-physician injectors. Marketing implying independent practice is a recurring focus.",
      },
      {
        title: "Telehealth and weight-loss advertising",
        body: "Oregon AG has been active on telehealth and compounded-GLP-1 marketing under UTPA.",
      },
      {
        title: "Wellness and longevity practice marketing",
        body: "Oregon has growing peptide and wellness practice activity. Marketing that crosses into disease-treatment claims has drawn enforcement attention.",
      },
      {
        title: "UTPA private enforcement",
        body: "UTPA permits private action with attorney fees, creating exposure beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "OMB supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Oregon AG UTPA activity.",
      },
      {
        pattern: "Peptide or NAD+ marketing with disease-treatment claims",
        why: "Both OMB and AG have authority on this pattern.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "OMB rules and UTPA both apply.",
      },
      {
        pattern: "Telehealth advertising without OR-licensure clarity",
        why: "Oregon telehealth rules apply to providers marketing to OR residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - OMB supervision focus.",
      "Wellness and peptide practices - growing enforcement area.",
      "Weight loss / telehealth - AG UTPA activity.",
      "Aesthetic surgery - specialty and guarantee rules.",
      "Dental - Oregon Board of Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Oregon healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Oregon-licensed healthcare marketing attorney.",
    keywords: [
      "Oregon healthcare marketing rules",
      "Oregon Medical Board advertising",
      "OAR 847",
      "Oregon Unlawful Trade Practices Act healthcare",
      "OR med spa compliance",
    ],
  },
  {
    slug: "nevada",
    state: "Nevada",
    abbreviation: "NV",
    title: "Nevada Healthcare Marketing Compliance Rules - NSBME and AG",
    description:
      "Nevada State Board of Medical Examiners (NSBME) advertising rules and Nevada Deceptive Trade Practices Act enforcement - with focus on Vegas-corridor cosmetic, weight loss, and aesthetic marketing.",
    heroTagline:
      "Nevada's regulatory environment is shaped by the State Board of Medical Examiners, the Deceptive Trade Practices Act, and the high-traffic medical-tourism market centered in the Las Vegas corridor.",
    intro:
      "Nevada healthcare marketing compliance operates under the Nevada State Board of Medical Examiners (NSBME) and the Nevada Deceptive Trade Practices Act (NDTPA). Nevada is a notable medical-tourism market, particularly for aesthetic surgery and wellness, with corresponding enforcement attention on out-of-state-targeted marketing.",
    medicalBoardName: "Nevada State Board of Medical Examiners (NSBME)",
    medicalBoardFocus:
      "NSBME enforces NAC 630 advertising rules including deceptive advertising prohibitions, specialty claims, supervision representations, and testimonial standards. Nevada has specific provisions on cross-border marketing given its medical-tourism market.",
    stateAgFocus:
      "Nevada AG uses NDTPA authority. Recent healthcare marketing enforcement has focused on aesthetic practice package pricing, weight-loss telehealth marketing, and out-of-state-targeted advertising. NDTPA permits AG and limited private action.",
    focusAreas: [
      {
        title: "Medical-tourism marketing",
        body: "Nevada attracts substantial out-of-state and international cosmetic patients. Marketing must disclose Nevada licensure and supervision arrangements clearly.",
      },
      {
        title: "Aesthetic practice supervision",
        body: "NSBME enforces supervision rules for non-physician injectors, which is particularly relevant in the Vegas-corridor med spa market.",
      },
      {
        title: "Weight-loss and telehealth advertising",
        body: "Nevada AG has pursued weight-loss telehealth marketing and compounded medication marketing under NDTPA.",
      },
      {
        title: "Package pricing disclosure",
        body: "AG enforcement has focused on aesthetic practice package pricing without adequate add-on (anesthesia, facility, post-op) disclosure.",
      },
    ],
    watchItems: [
      {
        pattern: "Out-of-state aesthetic marketing without NV-licensure disclosure",
        why: "Nevada medical-tourism context makes licensure disclosure a state-specific concern.",
      },
      {
        pattern: "Nurse-injector independence representations",
        why: "NSBME supervision enforcement.",
      },
      {
        pattern: "Package pricing without add-on disclosure",
        why: "Nevada AG NDTPA activity.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Nevada AG enforcement on compounded medication marketing.",
      },
      {
        pattern: "Outcome guarantees in aesthetic marketing",
        why: "NSBME rules and NDTPA both apply.",
      },
    ],
    specialtyCallouts: [
      "Aesthetic surgery - medical-tourism marketing standards apply.",
      "Med spas - NSBME supervision focus, particularly in Vegas corridor.",
      "Weight loss / telehealth - AG NDTPA activity.",
      "Wellness practices - growing enforcement attention.",
      "Dental - Nevada State Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Nevada healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Nevada-licensed healthcare marketing attorney.",
    keywords: [
      "Nevada healthcare marketing rules",
      "Nevada State Board of Medical Examiners advertising",
      "NAC 630",
      "Nevada Deceptive Trade Practices Act healthcare",
      "Nevada med spa compliance",
    ],
  },
  {
    slug: "wisconsin",
    state: "Wisconsin",
    abbreviation: "WI",
    title: "Wisconsin Healthcare Marketing Compliance Rules - MEB and AG",
    description:
      "Wisconsin Medical Examining Board (MEB) advertising rules under Wis. Admin. Code Med 10 and Wisconsin Deceptive Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Wisconsin healthcare marketing operates under Medical Examining Board rules and the Deceptive Trade Practices Act, with steady AG attention on cosmetic and weight-loss marketing.",
    intro:
      "Wisconsin healthcare marketing compliance operates under the Wisconsin Medical Examining Board (MEB) and the Wisconsin Deceptive Trade Practices Act (DTPA). MEB enforces physician advertising standards under Wis. Admin. Code Med 10 covering deceptive advertising, specialty claims, and supervision representations.",
    medicalBoardName: "Wisconsin Medical Examining Board (MEB)",
    medicalBoardFocus:
      "Wisconsin MEB enforces Med 10 advertising provisions covering deceptive advertising, specialty claim accuracy, supervision representations, and testimonial restrictions. Federal rules (FDA, FTC) apply over the top - state enforcement is a parallel layer, not a substitute.",
    stateAgFocus:
      "Wisconsin AG uses Wis. Stat. 100.18 (DTPA) authority for consumer-protection enforcement. Healthcare marketing enforcement has been less frequent than in higher-traffic states but the authority exists, particularly for compounded medication and weight-loss marketing.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Wisconsin telehealth rules apply to any provider marketing to WI residents. Marketing minimizing clinical evaluation steps creates exposure.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "MEB enforces specialty claim standards. 'Cosmetic surgeon' or 'board-certified' without proper qualification is a recurring focus.",
      },
      {
        title: "Compounded medication marketing",
        body: "Wisconsin enforcement on compounded GLP-1 brand-equivalence representations exists under DTPA, even if less aggressive than larger states.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence framing",
        why: "MEB supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Wisconsin DTPA authority applies.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "Both MEB rules and DTPA apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "MEB specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without WI-licensure clarity",
        why: "WI telehealth rules apply to marketing to WI residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - MEB supervision rules apply.",
      "Weight loss / telehealth - DTPA authority on compounded medication.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Wisconsin Dentistry Examining Board rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Wisconsin healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Wisconsin-licensed healthcare marketing attorney.",
    keywords: [
      "Wisconsin healthcare marketing rules",
      "Wisconsin Medical Examining Board advertising",
      "Wis Admin Code Med 10",
      "Wisconsin DTPA healthcare",
      "WI telehealth marketing",
    ],
  },
  {
    slug: "indiana",
    state: "Indiana",
    abbreviation: "IN",
    title: "Indiana Healthcare Marketing Compliance Rules - MLB and AG",
    description:
      "Indiana Medical Licensing Board (MLB) advertising rules and Indiana Deceptive Consumer Sales Act enforcement on healthcare marketing.",
    heroTagline:
      "Indiana healthcare marketing operates under Medical Licensing Board rules and the Deceptive Consumer Sales Act - with steady AG attention on cosmetic and weight-loss advertising.",
    intro:
      "Indiana healthcare marketing compliance operates under the Indiana Medical Licensing Board (MLB) and the Indiana Deceptive Consumer Sales Act (DCSA). Federal rules (FDA, FTC) apply over the top, and Indiana enforcement reinforces those obligations through the MLB and AG.",
    medicalBoardName: "Indiana Medical Licensing Board (MLB)",
    medicalBoardFocus:
      "Indiana MLB enforces 844 IAC advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards. Enforcement focus tracks national patterns - med spa supervision and specialty-claim accuracy.",
    stateAgFocus:
      "Indiana AG uses DCSA authority. Healthcare marketing enforcement has been moderate-volume, focused on weight-loss and compounded-medication marketing.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Indiana telehealth rules apply to providers marketing to IN residents. Federal rules apply over the top.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "MLB enforces specialty claim standards. Misuse of 'cosmetic surgeon' or 'board-certified' is a recurring focus.",
      },
      {
        title: "Compounded medication marketing",
        body: "Indiana AG has authority under DCSA for compounded medication marketing, including brand-equivalence representations.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "MLB supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Indiana DCSA authority applies.",
      },
      {
        pattern: "Outcome guarantees in medical or weight-loss marketing",
        why: "Both MLB rules and DCSA apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "MLB specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth marketing without IN-licensure clarity",
        why: "IN telehealth rules apply to marketing to IN residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - MLB supervision rules.",
      "Weight loss / telehealth - DCSA authority on compounded medication.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Indiana State Board of Dentistry rules separate.",
      "Regen medicine - federal patterns apply.",
    ],
    disclaimer:
      "This summary reflects general patterns in Indiana healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Indiana-licensed healthcare marketing attorney.",
    keywords: [
      "Indiana healthcare marketing rules",
      "Indiana Medical Licensing Board advertising",
      "844 IAC",
      "Indiana DCSA healthcare",
      "IN telehealth marketing",
    ],
  },
  {
    slug: "missouri",
    state: "Missouri",
    abbreviation: "MO",
    title: "Missouri Healthcare Marketing Compliance Rules - BHA and AG",
    description:
      "Missouri State Board of Registration for the Healing Arts (BHA) advertising rules and Missouri Merchandising Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Missouri healthcare marketing operates under the Healing Arts Board and the Merchandising Practices Act - with the MMPA's plaintiff-friendly authority creating meaningful private exposure.",
    intro:
      "Missouri healthcare marketing compliance operates under the Missouri State Board of Registration for the Healing Arts (BHA) and the Missouri Merchandising Practices Act (MMPA). MMPA permits private action with attorney fees and is plaintiff-friendly, making private litigation a meaningful exposure layer alongside AG enforcement.",
    medicalBoardName: "Missouri State Board of Registration for the Healing Arts (BHA)",
    medicalBoardFocus:
      "Missouri BHA enforces 20 CSR 2150 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Missouri AG uses MMPA authority. Healthcare marketing enforcement has included weight-loss and compounded-medication marketing. MMPA private action is meaningful exposure.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "BHA enforces supervision rules for non-physician injectors; nurse-injector independence representations are a recurring focus.",
      },
      {
        title: "Telehealth advertising",
        body: "Missouri telehealth rules apply to providers marketing to MO residents.",
      },
      {
        title: "MMPA private actions",
        body: "MMPA permits private action with attorney fees and is recognized as plaintiff-friendly. Class actions are a meaningful exposure.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence framing",
        why: "BHA supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "MO AG MMPA authority applies.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "BHA rules and MMPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BHA specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without MO-licensure clarity",
        why: "Missouri telehealth rules apply to marketing to MO residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - BHA supervision focus.",
      "Weight loss / telehealth - MMPA authority on compounded medication.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Missouri Dental Board rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Missouri healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Missouri-licensed healthcare marketing attorney.",
    keywords: [
      "Missouri healthcare marketing rules",
      "Missouri Healing Arts Board advertising",
      "20 CSR 2150",
      "Missouri Merchandising Practices Act healthcare",
      "MO med spa compliance",
    ],
  },
  {
    slug: "kentucky",
    state: "Kentucky",
    abbreviation: "KY",
    title: "Kentucky Healthcare Marketing Compliance Rules - KBML and AG",
    description:
      "Kentucky Board of Medical Licensure (KBML) advertising rules and Kentucky Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Kentucky healthcare marketing operates under Board of Medical Licensure rules and the Consumer Protection Act - federal rules apply over the top.",
    intro:
      "Kentucky healthcare marketing compliance operates under the Kentucky Board of Medical Licensure (KBML) and the Kentucky Consumer Protection Act (KCPA). KBML enforces 201 KAR 9 advertising provisions, and the AG has KCPA authority.",
    medicalBoardName: "Kentucky Board of Medical Licensure (KBML)",
    medicalBoardFocus:
      "KBML enforces 201 KAR 9 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Kentucky AG uses KCPA authority. Healthcare marketing enforcement has focused on weight-loss and compounded-medication marketing.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Kentucky telehealth rules apply to providers marketing to KY residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "KBML enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "Kentucky AG has KCPA authority for compounded medication marketing enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "KBML supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "KY AG KCPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "KBML rules and KCPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "KBML specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth marketing without KY-licensure clarity",
        why: "Kentucky telehealth rules apply to marketing to KY residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - KBML supervision rules.",
      "Weight loss / telehealth - KCPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Kentucky Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Kentucky healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Kentucky-licensed healthcare marketing attorney.",
    keywords: [
      "Kentucky healthcare marketing rules",
      "Kentucky Board of Medical Licensure advertising",
      "201 KAR 9",
      "Kentucky Consumer Protection Act healthcare",
      "KY med spa compliance",
    ],
  },
  {
    slug: "alabama",
    state: "Alabama",
    abbreviation: "AL",
    title: "Alabama Healthcare Marketing Compliance Rules - BME and AG",
    description:
      "Alabama Board of Medical Examiners advertising rules and Alabama Deceptive Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Alabama healthcare marketing operates under Board of Medical Examiners rules and the Deceptive Trade Practices Act, with federal rules forming the dominant exposure layer.",
    intro:
      "Alabama healthcare marketing compliance operates under the Alabama Board of Medical Examiners and the Alabama Deceptive Trade Practices Act (ADTPA). Standard physician advertising rules apply; enforcement focus has historically been more limited compared to high-traffic states, but federal rules (FDA, FTC) apply uniformly and remain the dominant exposure layer.",
    medicalBoardName: "Alabama Board of Medical Examiners",
    medicalBoardFocus:
      "Standard physician advertising rules apply under Ala. Admin. Code 540 covering deceptive advertising, specialty claims, supervision, and testimonial standards. Enforcement focus has historically been more limited compared to high-traffic states.",
    stateAgFocus:
      "Alabama AG uses ADTPA for consumer protection. Healthcare-marketing-specific enforcement has been limited but the authority exists, particularly for compounded medication and weight-loss marketing.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Alabama telehealth rules apply to providers marketing to AL residents. Federal rules apply over the top.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "Board of Medical Examiners enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "AL AG has authority under ADTPA for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "Board of Medical Examiners supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "ADTPA authority applies.",
      },
      {
        pattern: "Outcome guarantees in medical marketing",
        why: "Board rules and ADTPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Board specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without AL-licensure clarity",
        why: "Alabama telehealth rules apply.",
      },
    ],
    specialtyCallouts: [
      "Med spas - Board supervision rules apply.",
      "Weight loss / telehealth - ADTPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Alabama Dental Board rules separate.",
      "Regen medicine - federal patterns are the primary exposure.",
    ],
    disclaimer:
      "This summary reflects general patterns in Alabama healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Alabama-licensed healthcare marketing attorney.",
    keywords: [
      "Alabama healthcare marketing rules",
      "Alabama Board of Medical Examiners advertising",
      "Ala Admin Code 540",
      "Alabama Deceptive Trade Practices Act healthcare",
      "AL telehealth marketing",
    ],
  },
  {
    slug: "louisiana",
    state: "Louisiana",
    abbreviation: "LA",
    title: "Louisiana Healthcare Marketing Compliance Rules - LSBME and AG",
    description:
      "Louisiana State Board of Medical Examiners (LSBME) advertising rules and Louisiana Unfair Trade Practices and Consumer Protection Law enforcement on healthcare marketing.",
    heroTagline:
      "Louisiana healthcare marketing operates under LSBME rules and the Unfair Trade Practices and Consumer Protection Law, with steady AG attention on cosmetic and weight-loss advertising.",
    intro:
      "Louisiana healthcare marketing compliance operates under the Louisiana State Board of Medical Examiners (LSBME) and the Louisiana Unfair Trade Practices and Consumer Protection Law (LUTPA). LUTPA permits private action with attorney fees in appropriate cases.",
    medicalBoardName: "Louisiana State Board of Medical Examiners (LSBME)",
    medicalBoardFocus:
      "LSBME enforces La. Admin. Code 46:XLV advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Louisiana AG uses LUTPA authority. Healthcare marketing enforcement has focused on weight-loss and compounded-medication marketing.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "LSBME enforces supervision rules for non-physician injectors.",
      },
      {
        title: "Telehealth advertising",
        body: "Louisiana telehealth rules apply to providers marketing to LA residents.",
      },
      {
        title: "Compounded medication marketing",
        body: "LA AG has LUTPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "LSBME supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "LA AG LUTPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "LSBME rules and LUTPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "LSBME specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without LA-licensure clarity",
        why: "Louisiana telehealth rules apply to marketing to LA residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - LSBME supervision rules.",
      "Weight loss / telehealth - LUTPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Louisiana State Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Louisiana healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Louisiana-licensed healthcare marketing attorney.",
    keywords: [
      "Louisiana healthcare marketing rules",
      "Louisiana State Board of Medical Examiners advertising",
      "La Admin Code 46 XLV",
      "Louisiana LUTPA healthcare",
      "LA telehealth marketing",
    ],
  },
  {
    slug: "oklahoma",
    state: "Oklahoma",
    abbreviation: "OK",
    title: "Oklahoma Healthcare Marketing Compliance Rules - OSBMLS and AG",
    description:
      "Oklahoma State Board of Medical Licensure and Supervision (OSBMLS) advertising rules and Oklahoma Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Oklahoma healthcare marketing operates under OSBMLS rules and the Consumer Protection Act, with federal rules as the dominant exposure layer.",
    intro:
      "Oklahoma healthcare marketing compliance operates under the Oklahoma State Board of Medical Licensure and Supervision (OSBMLS) and the Oklahoma Consumer Protection Act (OCPA). Standard physician advertising rules apply, with federal rules forming the primary exposure layer.",
    medicalBoardName: "Oklahoma State Board of Medical Licensure and Supervision (OSBMLS)",
    medicalBoardFocus:
      "OSBMLS enforces OAC 435 advertising provisions covering deceptive advertising, specialty claims, and supervision representations.",
    stateAgFocus:
      "Oklahoma AG uses OCPA authority. Healthcare marketing enforcement has been moderate, focused on weight-loss and compounded-medication marketing.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Oklahoma telehealth rules apply to providers marketing to OK residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "OSBMLS enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "OK AG has OCPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "OSBMLS supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "OK AG OCPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "OSBMLS rules and OCPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "OSBMLS specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without OK-licensure clarity",
        why: "Oklahoma telehealth rules apply to marketing to OK residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - OSBMLS supervision rules.",
      "Weight loss / telehealth - OCPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Oklahoma Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Oklahoma healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Oklahoma-licensed healthcare marketing attorney.",
    keywords: [
      "Oklahoma healthcare marketing rules",
      "Oklahoma State Board of Medical Licensure advertising",
      "OAC 435",
      "Oklahoma Consumer Protection Act healthcare",
      "OK telehealth marketing",
    ],
  },
  {
    slug: "south-carolina",
    state: "South Carolina",
    abbreviation: "SC",
    title: "South Carolina Healthcare Marketing Compliance Rules - LLR and AG",
    description:
      "South Carolina Department of Labor, Licensing and Regulation (LLR) Board of Medical Examiners advertising rules and SC Unfair Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "South Carolina healthcare marketing operates under the Board of Medical Examiners (under LLR) and the Unfair Trade Practices Act, with steady federal rules forming the dominant layer.",
    intro:
      "South Carolina healthcare marketing compliance operates under the South Carolina Board of Medical Examiners (within LLR) and the South Carolina Unfair Trade Practices Act (SCUTPA). SCUTPA permits private action with attorney fees and treble damages in appropriate cases.",
    medicalBoardName: "South Carolina Board of Medical Examiners (under LLR)",
    medicalBoardFocus:
      "SC Board of Medical Examiners enforces SC Code Regs. 81 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "SC AG uses SCUTPA authority. Healthcare marketing enforcement has focused on weight-loss and compounded-medication marketing. SCUTPA private action exposure exists.",
    focusAreas: [
      {
        title: "Aesthetic practice supervision",
        body: "Board of Medical Examiners enforces supervision rules for non-physician injectors.",
      },
      {
        title: "Telehealth advertising",
        body: "South Carolina telehealth rules apply to providers marketing to SC residents.",
      },
      {
        title: "Compounded medication marketing",
        body: "SC AG has SCUTPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "Board of Medical Examiners supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "SCUTPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "Board rules and SCUTPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Board specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without SC-licensure clarity",
        why: "South Carolina telehealth rules apply to marketing to SC residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - Board of Medical Examiners supervision rules.",
      "Weight loss / telehealth - SCUTPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - South Carolina Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in South Carolina healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a South Carolina-licensed healthcare marketing attorney.",
    keywords: [
      "South Carolina healthcare marketing rules",
      "South Carolina Board of Medical Examiners advertising",
      "SC Code Regs 81",
      "SCUTPA healthcare",
      "SC telehealth marketing",
    ],
  },
  {
    slug: "iowa",
    state: "Iowa",
    abbreviation: "IA",
    title: "Iowa Healthcare Marketing Compliance Rules - IBM and AG",
    description:
      "Iowa Board of Medicine (IBM) advertising rules and Iowa Consumer Fraud Act enforcement on healthcare marketing.",
    heroTagline:
      "Iowa healthcare marketing operates under Board of Medicine rules and the Consumer Fraud Act, with federal rules as the dominant compliance layer.",
    intro:
      "Iowa healthcare marketing compliance operates under the Iowa Board of Medicine (IBM) and the Iowa Consumer Fraud Act. Standard physician advertising rules apply.",
    medicalBoardName: "Iowa Board of Medicine (IBM)",
    medicalBoardFocus:
      "IBM enforces Iowa Admin. Code 653 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Iowa AG uses Consumer Fraud Act authority. Healthcare marketing enforcement has been moderate, focused on weight-loss and compounded-medication marketing.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Iowa telehealth rules apply to providers marketing to IA residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "IBM enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "Iowa AG has Consumer Fraud Act authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "IBM supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Iowa Consumer Fraud Act authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "IBM rules and Consumer Fraud Act both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "IBM specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without IA-licensure clarity",
        why: "Iowa telehealth rules apply to marketing to IA residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - IBM supervision rules.",
      "Weight loss / telehealth - Consumer Fraud Act authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Iowa Dental Board rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Iowa healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Iowa-licensed healthcare marketing attorney.",
    keywords: [
      "Iowa healthcare marketing rules",
      "Iowa Board of Medicine advertising",
      "Iowa Admin Code 653",
      "Iowa Consumer Fraud Act healthcare",
      "IA telehealth marketing",
    ],
  },
  {
    slug: "kansas",
    state: "Kansas",
    abbreviation: "KS",
    title: "Kansas Healthcare Marketing Compliance Rules - BHA and AG",
    description:
      "Kansas State Board of Healing Arts (BHA) advertising rules and Kansas Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Kansas healthcare marketing operates under Board of Healing Arts rules and the Consumer Protection Act, with federal rules as the dominant compliance layer.",
    intro:
      "Kansas healthcare marketing compliance operates under the Kansas State Board of Healing Arts (BHA) and the Kansas Consumer Protection Act (KCPA). Standard physician advertising rules apply.",
    medicalBoardName: "Kansas State Board of Healing Arts (BHA)",
    medicalBoardFocus:
      "Kansas BHA enforces K.A.R. 100 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Kansas AG uses KCPA authority. Healthcare marketing enforcement has been moderate.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Kansas telehealth rules apply to providers marketing to KS residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "Kansas BHA enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "KS AG has KCPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "Kansas BHA supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "KCPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "BHA rules and KCPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BHA specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without KS-licensure clarity",
        why: "Kansas telehealth rules apply to marketing to KS residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - BHA supervision rules.",
      "Weight loss / telehealth - KCPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Kansas Dental Board rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Kansas healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Kansas-licensed healthcare marketing attorney.",
    keywords: [
      "Kansas healthcare marketing rules",
      "Kansas Board of Healing Arts advertising",
      "K.A.R. 100",
      "Kansas Consumer Protection Act healthcare",
      "KS telehealth marketing",
    ],
  },
  {
    slug: "mississippi",
    state: "Mississippi",
    abbreviation: "MS",
    title: "Mississippi Healthcare Marketing Compliance Rules - BML and AG",
    description:
      "Mississippi State Board of Medical Licensure (BML) advertising rules and Mississippi Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Mississippi healthcare marketing operates under Board of Medical Licensure rules and the Consumer Protection Act, with federal rules as the primary exposure layer.",
    intro:
      "Mississippi healthcare marketing compliance operates under the Mississippi State Board of Medical Licensure (BML) and the Mississippi Consumer Protection Act (MCPA). Standard physician advertising rules apply.",
    medicalBoardName: "Mississippi State Board of Medical Licensure (BML)",
    medicalBoardFocus:
      "Mississippi BML enforces 30 Miss. Admin. Code Pt. 2635 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Mississippi AG uses MCPA authority. Healthcare marketing enforcement has been moderate.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Mississippi telehealth rules apply to providers marketing to MS residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "BML enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "MS AG has MCPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "BML supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "MCPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "BML rules and MCPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BML specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without MS-licensure clarity",
        why: "Mississippi telehealth rules apply to marketing to MS residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - BML supervision rules.",
      "Weight loss / telehealth - MCPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Mississippi State Board of Dental Examiners rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Mississippi healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Mississippi-licensed healthcare marketing attorney.",
    keywords: [
      "Mississippi healthcare marketing rules",
      "Mississippi Board of Medical Licensure advertising",
      "30 Miss Admin Code 2635",
      "Mississippi Consumer Protection Act healthcare",
      "MS telehealth marketing",
    ],
  },
  {
    slug: "arkansas",
    state: "Arkansas",
    abbreviation: "AR",
    title: "Arkansas Healthcare Marketing Compliance Rules - ASMB and AG",
    description:
      "Arkansas State Medical Board (ASMB) advertising rules and Arkansas Deceptive Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Arkansas healthcare marketing operates under State Medical Board rules and the Deceptive Trade Practices Act, with federal rules as the primary compliance frame.",
    intro:
      "Arkansas healthcare marketing compliance operates under the Arkansas State Medical Board (ASMB) and the Arkansas Deceptive Trade Practices Act (ADTPA). Standard physician advertising rules apply.",
    medicalBoardName: "Arkansas State Medical Board (ASMB)",
    medicalBoardFocus:
      "Arkansas ASMB enforces 060.00.1 Ark. Code R. advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Arkansas AG uses ADTPA authority. Healthcare marketing enforcement has been moderate.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Arkansas telehealth rules apply to providers marketing to AR residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "ASMB enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "AR AG has ADTPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "ASMB supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "ADTPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "ASMB rules and ADTPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "ASMB specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without AR-licensure clarity",
        why: "Arkansas telehealth rules apply to marketing to AR residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - ASMB supervision rules.",
      "Weight loss / telehealth - ADTPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Arkansas State Board of Dental Examiners rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Arkansas healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Arkansas-licensed healthcare marketing attorney.",
    keywords: [
      "Arkansas healthcare marketing rules",
      "Arkansas State Medical Board advertising",
      "Arkansas Deceptive Trade Practices Act healthcare",
      "AR telehealth marketing",
    ],
  },
  {
    slug: "utah",
    state: "Utah",
    abbreviation: "UT",
    title: "Utah Healthcare Marketing Compliance Rules - DOPL and AG",
    description:
      "Utah Division of Occupational and Professional Licensing (DOPL) Physicians Licensing Board advertising rules and Utah Consumer Sales Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Utah's regulatory environment is shaped by DOPL's Physicians Licensing Board, the Consumer Sales Practices Act, and a substantial wellness and aesthetic-practice market.",
    intro:
      "Utah healthcare marketing compliance operates under the Utah Division of Occupational and Professional Licensing (DOPL) - specifically the Physicians Licensing Board - and the Utah Consumer Sales Practices Act (UCSPA). Utah has been a substantial wellness, peptide, and aesthetic-practice market with corresponding state-level interest in marketing claims.",
    medicalBoardName: "Utah Physicians Licensing Board (under DOPL)",
    medicalBoardFocus:
      "DOPL enforces Utah Admin. Code R156-67 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards. Wellness and peptide practice marketing has drawn growing attention.",
    stateAgFocus:
      "Utah AG uses UCSPA authority. Recent healthcare marketing enforcement has included wellness practice claims and compounded medication marketing.",
    focusAreas: [
      {
        title: "Wellness and peptide practice marketing",
        body: "Utah's high concentration of wellness, peptide, and longevity practices has produced growing state interest in marketing that crosses into disease-treatment claims.",
      },
      {
        title: "Aesthetic practice supervision",
        body: "DOPL enforces supervision rules for non-physician injectors.",
      },
      {
        title: "Compounded medication marketing",
        body: "Utah AG has UCSPA authority for compounded GLP-1 marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Peptide or NAD+ marketing with disease-treatment claims",
        why: "DOPL and AG both have authority on this pattern.",
      },
      {
        pattern: "Nurse-injector independence representations",
        why: "DOPL supervision enforcement.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "UCSPA authority.",
      },
      {
        pattern: "Outcome guarantees on wellness or aesthetic services",
        why: "DOPL rules and UCSPA both apply.",
      },
      {
        pattern: "Telehealth advertising without UT-licensure clarity",
        why: "Utah telehealth rules apply to marketing to UT residents.",
      },
    ],
    specialtyCallouts: [
      "Wellness and peptide practices - growing enforcement focus.",
      "Med spas - DOPL supervision rules.",
      "Weight loss / telehealth - UCSPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Utah Dentist and Dental Hygienist Licensing Board rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Utah healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Utah-licensed healthcare marketing attorney.",
    keywords: [
      "Utah healthcare marketing rules",
      "Utah Physicians Licensing Board advertising",
      "Utah Admin Code R156-67",
      "Utah Consumer Sales Practices Act healthcare",
      "UT wellness practice compliance",
    ],
  },
  {
    slug: "nebraska",
    state: "Nebraska",
    abbreviation: "NE",
    title: "Nebraska Healthcare Marketing Compliance Rules - DHHS and AG",
    description:
      "Nebraska Department of Health and Human Services (DHHS) physician licensure advertising rules and Nebraska Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Nebraska healthcare marketing operates under DHHS physician licensure rules and the Consumer Protection Act, with federal rules as the dominant compliance layer.",
    intro:
      "Nebraska healthcare marketing compliance operates under the Nebraska Department of Health and Human Services (DHHS) - which administers physician licensure - and the Nebraska Consumer Protection Act. Standard physician advertising rules apply.",
    medicalBoardName: "Nebraska Board of Medicine and Surgery (under DHHS)",
    medicalBoardFocus:
      "DHHS enforces 172 NAC 88 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Nebraska AG uses Consumer Protection Act authority. Healthcare marketing enforcement has been moderate.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Nebraska telehealth rules apply to providers marketing to NE residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "DHHS enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "NE AG has Consumer Protection Act authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "DHHS supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Nebraska Consumer Protection Act authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "DHHS rules and CPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "DHHS specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without NE-licensure clarity",
        why: "Nebraska telehealth rules apply to marketing to NE residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - DHHS supervision rules.",
      "Weight loss / telehealth - CPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Nebraska Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Nebraska healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Nebraska-licensed healthcare marketing attorney.",
    keywords: [
      "Nebraska healthcare marketing rules",
      "Nebraska DHHS physician advertising",
      "172 NAC 88",
      "Nebraska Consumer Protection Act healthcare",
      "NE telehealth marketing",
    ],
  },
  {
    slug: "idaho",
    state: "Idaho",
    abbreviation: "ID",
    title: "Idaho Healthcare Marketing Compliance Rules - IBOM and AG",
    description:
      "Idaho Board of Medicine (IBOM) advertising rules and Idaho Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Idaho healthcare marketing operates under Board of Medicine rules and the Consumer Protection Act, with federal rules as the dominant compliance layer.",
    intro:
      "Idaho healthcare marketing compliance operates under the Idaho Board of Medicine (IBOM) and the Idaho Consumer Protection Act (ICPA). Standard physician advertising rules apply.",
    medicalBoardName: "Idaho Board of Medicine (IBOM)",
    medicalBoardFocus:
      "IBOM enforces IDAPA 22 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Idaho AG uses ICPA authority. Healthcare marketing enforcement has been moderate.",
    focusAreas: [
      {
        title: "Telehealth advertising rules",
        body: "Idaho telehealth rules apply to providers marketing to ID residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "IBOM enforces specialty-claim standards.",
      },
      {
        title: "Compounded medication marketing",
        body: "ID AG has ICPA authority for compounded medication marketing.",
      },
    ],
    watchItems: [
      {
        pattern: "Nurse-injector independence representations",
        why: "IBOM supervision rules apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "ICPA authority.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "IBOM rules and ICPA both apply.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "IBOM specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without ID-licensure clarity",
        why: "Idaho telehealth rules apply to marketing to ID residents.",
      },
    ],
    specialtyCallouts: [
      "Med spas - IBOM supervision rules.",
      "Weight loss / telehealth - ICPA authority.",
      "Aesthetic practice - specialty and guarantee rules.",
      "Dental - Idaho Board of Dentistry rules separate.",
      "Regen medicine - federal patterns mirrored.",
    ],
    disclaimer:
      "This summary reflects general patterns in Idaho healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Idaho-licensed healthcare marketing attorney.",
    keywords: [
      "Idaho healthcare marketing rules",
      "Idaho Board of Medicine advertising",
      "IDAPA 22",
      "Idaho Consumer Protection Act healthcare",
      "ID telehealth marketing",
    ],
  },
  {
    slug: "alaska",
    state: "Alaska",
    abbreviation: "AK",
    title: "Alaska Healthcare Marketing Compliance Rules - SMB and AG",
    description:
      "Alaska State Medical Board (SMB) physician advertising rules and Alaska Unfair Trade Practices and Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Alaska healthcare marketing is dominated by federal compliance obligations; the State Medical Board and Unfair Trade Practices Act provide a parallel state-level layer.",
    intro:
      "Alaska healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Alaska State Medical Board (SMB) and the Alaska Unfair Trade Practices and Consumer Protection Act (UTPCPA) providing parallel state-level authority. State-level enforcement has historically been limited compared to high-traffic states, but federal obligations apply uniformly and remain the dominant exposure layer.",
    medicalBoardName: "Alaska State Medical Board (SMB)",
    medicalBoardFocus:
      "SMB enforces 12 AAC 40 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards. Federal rules apply over the top regardless of state activity.",
    stateAgFocus:
      "Alaska AG uses UTPCPA for consumer protection. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the dominant layer",
        body: "FDA and FTC rules apply uniformly. Even where state enforcement is limited, federal rules on disease claims, FDA approval representations, testimonial use, and substantiation always apply.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Alaska telehealth rules apply to providers marketing to AK residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "SMB enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and SMB advertising standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + state UTPCPA exposure.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "SMB specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without AK-licensure clarity",
        why: "Alaska telehealth rules apply to marketing to AK residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - SMB supervision rules apply.",
      "Telehealth - cross-border marketing must meet Alaska standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Alaska Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Alaska healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult an Alaska-licensed healthcare marketing attorney.",
    keywords: [
      "Alaska healthcare marketing rules",
      "Alaska State Medical Board advertising",
      "12 AAC 40",
      "Alaska UTPCPA healthcare",
      "AK telehealth marketing",
    ],
  },
  {
    slug: "hawaii",
    state: "Hawaii",
    abbreviation: "HI",
    title: "Hawaii Healthcare Marketing Compliance Rules - Medical Board and AG",
    description:
      "Hawaii Medical Board physician advertising rules and Hawaii Unfair and Deceptive Acts or Practices statute enforcement on healthcare marketing.",
    heroTagline:
      "Hawaii healthcare marketing operates under Medical Board rules and the UDAP statute, with federal compliance obligations as the dominant layer.",
    intro:
      "Hawaii healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Hawaii Medical Board and the Hawaii Unfair and Deceptive Acts or Practices (UDAP) statute (HRS 480) providing parallel state-level authority.",
    medicalBoardName: "Hawaii Medical Board",
    medicalBoardFocus:
      "Hawaii Medical Board enforces HRS 453 and HAR 16-85 advertising provisions covering deceptive advertising, specialty claims, supervision representations, and testimonial standards.",
    stateAgFocus:
      "Hawaii AG uses HRS 480 (UDAP) authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly regardless of state activity. Federal disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Hawaii telehealth rules apply to providers marketing to HI residents.",
      },
      {
        title: "Medical-tourism marketing",
        body: "Hawaii attracts out-of-state and international cosmetic patients in some specialties. Medical-tourism marketing must disclose Hawaii licensure clearly.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees in medical or wellness marketing",
        why: "FTC substantiation rules and Medical Board standards both apply.",
      },
      {
        pattern: "Out-of-state aesthetic marketing without HI-licensure disclosure",
        why: "Medical-tourism context makes licensure disclosure a state-specific concern.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Medical Board specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without HI-licensure clarity",
        why: "Hawaii telehealth rules apply to marketing to HI residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Aesthetic surgery - medical-tourism marketing standards apply.",
      "Med spas - Medical Board supervision rules apply.",
      "Telehealth - cross-border marketing must meet Hawaii standards.",
      "Dental - Hawaii Board of Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Hawaii healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Hawaii-licensed healthcare marketing attorney.",
    keywords: [
      "Hawaii healthcare marketing rules",
      "Hawaii Medical Board advertising",
      "HRS 453",
      "Hawaii UDAP healthcare",
      "HI telehealth marketing",
    ],
  },
  {
    slug: "wyoming",
    state: "Wyoming",
    abbreviation: "WY",
    title: "Wyoming Healthcare Marketing Compliance Rules - Board of Medicine and AG",
    description:
      "Wyoming Board of Medicine physician advertising rules and Wyoming Consumer Protection Act enforcement - federal compliance is the primary frame.",
    heroTagline:
      "Wyoming healthcare marketing is dominated by federal compliance; the Board of Medicine and Consumer Protection Act provide a state-level overlay.",
    intro:
      "Wyoming healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Wyoming Board of Medicine and the Wyoming Consumer Protection Act (WCPA) providing state-level authority. State-level enforcement has historically been limited compared to high-traffic states.",
    medicalBoardName: "Wyoming Board of Medicine",
    medicalBoardFocus:
      "Wyoming Board of Medicine enforces 21 Wyo. Code Rules advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "Wyoming AG uses WCPA authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Wyoming telehealth rules apply to providers marketing to WY residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "Wyoming Board of Medicine enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and Board standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + state WCPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Board specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without WY-licensure clarity",
        why: "Wyoming telehealth rules apply to marketing to WY residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - Board of Medicine supervision rules apply.",
      "Telehealth - cross-border marketing must meet Wyoming standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Wyoming Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Wyoming healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Wyoming-licensed healthcare marketing attorney.",
    keywords: [
      "Wyoming healthcare marketing rules",
      "Wyoming Board of Medicine advertising",
      "Wyoming Consumer Protection Act healthcare",
      "WY telehealth marketing",
    ],
  },
  {
    slug: "vermont",
    state: "Vermont",
    abbreviation: "VT",
    title: "Vermont Healthcare Marketing Compliance Rules - Board of Medical Practice and AG",
    description:
      "Vermont Board of Medical Practice physician advertising rules and Vermont Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Vermont healthcare marketing operates under Board of Medical Practice rules and the Consumer Protection Act, with federal rules as the primary compliance frame.",
    intro:
      "Vermont healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Vermont Board of Medical Practice and the Vermont Consumer Protection Act (VCPA) providing state-level authority. State enforcement is limited in volume but the framework exists; federal rules apply uniformly.",
    medicalBoardName: "Vermont Board of Medical Practice",
    medicalBoardFocus:
      "Vermont Board of Medical Practice enforces 26 V.S.A. 1354 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "Vermont AG uses VCPA authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Vermont telehealth rules apply to providers marketing to VT residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "Vermont Board of Medical Practice enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and Board standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + VCPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Board specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without VT-licensure clarity",
        why: "Vermont telehealth rules apply to marketing to VT residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - Board of Medical Practice supervision rules apply.",
      "Telehealth - cross-border marketing must meet Vermont standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Vermont Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Vermont healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Vermont-licensed healthcare marketing attorney.",
    keywords: [
      "Vermont healthcare marketing rules",
      "Vermont Board of Medical Practice advertising",
      "26 VSA 1354",
      "Vermont Consumer Protection Act healthcare",
      "VT telehealth marketing",
    ],
  },
  {
    slug: "maine",
    state: "Maine",
    abbreviation: "ME",
    title: "Maine Healthcare Marketing Compliance Rules - BOLM and AG",
    description:
      "Maine Board of Licensure in Medicine (BOLM) physician advertising rules and Maine Unfair Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Maine healthcare marketing operates under BOLM rules and the Unfair Trade Practices Act, with federal rules as the primary compliance frame.",
    intro:
      "Maine healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Maine Board of Licensure in Medicine (BOLM) and the Maine Unfair Trade Practices Act (UTPA) providing state-level authority.",
    medicalBoardName: "Maine Board of Licensure in Medicine (BOLM)",
    medicalBoardFocus:
      "BOLM enforces 02-373 CMR 1 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "Maine AG uses UTPA authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Maine telehealth rules apply to providers marketing to ME residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "BOLM enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and BOLM standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + state UTPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BOLM specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without ME-licensure clarity",
        why: "Maine telehealth rules apply to marketing to ME residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - BOLM supervision rules apply.",
      "Telehealth - cross-border marketing must meet Maine standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Maine Board of Dental Practice rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Maine healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Maine-licensed healthcare marketing attorney.",
    keywords: [
      "Maine healthcare marketing rules",
      "Maine Board of Licensure in Medicine advertising",
      "Maine UTPA healthcare",
      "ME telehealth marketing",
    ],
  },
  {
    slug: "north-dakota",
    state: "North Dakota",
    abbreviation: "ND",
    title: "North Dakota Healthcare Marketing Compliance Rules - Board of Medicine and AG",
    description:
      "North Dakota Board of Medicine advertising rules and North Dakota Consumer Fraud Act enforcement - federal rules form the primary compliance frame.",
    heroTagline:
      "North Dakota healthcare marketing operates under Board of Medicine rules and the Consumer Fraud Act, with federal compliance obligations as the dominant layer.",
    intro:
      "North Dakota healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the North Dakota Board of Medicine and the North Dakota Consumer Fraud Act providing state-level authority.",
    medicalBoardName: "North Dakota Board of Medicine",
    medicalBoardFocus:
      "ND Board of Medicine enforces NDAC 50 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "ND AG uses Consumer Fraud Act authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "North Dakota telehealth rules apply to providers marketing to ND residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "ND Board of Medicine enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and Board standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + ND Consumer Fraud Act authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "Board specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without ND-licensure clarity",
        why: "ND telehealth rules apply to marketing to ND residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - Board supervision rules apply.",
      "Telehealth - cross-border marketing must meet ND standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - North Dakota State Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in North Dakota healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a North Dakota-licensed healthcare marketing attorney.",
    keywords: [
      "North Dakota healthcare marketing rules",
      "ND Board of Medicine advertising",
      "NDAC 50",
      "North Dakota Consumer Fraud Act healthcare",
      "ND telehealth marketing",
    ],
  },
  {
    slug: "south-dakota",
    state: "South Dakota",
    abbreviation: "SD",
    title: "South Dakota Healthcare Marketing Compliance Rules - BMOE and AG",
    description:
      "South Dakota Board of Medical and Osteopathic Examiners (BMOE) advertising rules and South Dakota Deceptive Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "South Dakota healthcare marketing operates under BMOE rules and the Deceptive Trade Practices Act, with federal compliance obligations as the dominant layer.",
    intro:
      "South Dakota healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the South Dakota Board of Medical and Osteopathic Examiners (BMOE) and the South Dakota Deceptive Trade Practices Act providing state-level authority.",
    medicalBoardName: "South Dakota Board of Medical and Osteopathic Examiners (BMOE)",
    medicalBoardFocus:
      "BMOE enforces ARSD 20:47 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "SD AG uses Deceptive Trade Practices Act authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "South Dakota telehealth rules apply to providers marketing to SD residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "BMOE enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and BMOE standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + SD DTPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BMOE specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without SD-licensure clarity",
        why: "SD telehealth rules apply to marketing to SD residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - BMOE supervision rules apply.",
      "Telehealth - cross-border marketing must meet SD standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - South Dakota State Board of Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in South Dakota healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a South Dakota-licensed healthcare marketing attorney.",
    keywords: [
      "South Dakota healthcare marketing rules",
      "South Dakota BMOE advertising",
      "ARSD 20:47",
      "South Dakota Deceptive Trade Practices Act healthcare",
      "SD telehealth marketing",
    ],
  },
  {
    slug: "montana",
    state: "Montana",
    abbreviation: "MT",
    title: "Montana Healthcare Marketing Compliance Rules - BOME and AG",
    description:
      "Montana Board of Medical Examiners (BOME) physician advertising rules and Montana Unfair Trade Practices and Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "Montana healthcare marketing operates under Board of Medical Examiners rules and the Unfair Trade Practices Act, with federal compliance obligations as the dominant layer.",
    intro:
      "Montana healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Montana Board of Medical Examiners (BOME) and the Montana Unfair Trade Practices and Consumer Protection Act (MTUTPCPA) providing state-level authority.",
    medicalBoardName: "Montana Board of Medical Examiners (BOME)",
    medicalBoardFocus:
      "BOME enforces ARM 24.156 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "MT AG uses MTUTPCPA authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Montana telehealth rules apply to providers marketing to MT residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "BOME enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and BOME standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + MTUTPCPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BOME specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without MT-licensure clarity",
        why: "Montana telehealth rules apply to marketing to MT residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - BOME supervision rules apply.",
      "Telehealth - cross-border marketing must meet Montana standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Montana Board of Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Montana healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Montana-licensed healthcare marketing attorney.",
    keywords: [
      "Montana healthcare marketing rules",
      "Montana Board of Medical Examiners advertising",
      "ARM 24.156",
      "Montana UTPCPA healthcare",
      "MT telehealth marketing",
    ],
  },
  {
    slug: "west-virginia",
    state: "West Virginia",
    abbreviation: "WV",
    title: "West Virginia Healthcare Marketing Compliance Rules - BOM and AG",
    description:
      "West Virginia Board of Medicine (BOM) physician advertising rules and West Virginia Consumer Credit and Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "West Virginia healthcare marketing operates under Board of Medicine rules and the Consumer Credit and Protection Act, with federal compliance as the dominant layer.",
    intro:
      "West Virginia healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the West Virginia Board of Medicine (BOM) and the West Virginia Consumer Credit and Protection Act (WVCCPA) providing state-level authority. WVCCPA permits private action with attorney fees in appropriate cases.",
    medicalBoardName: "West Virginia Board of Medicine (BOM)",
    medicalBoardFocus:
      "BOM enforces W. Va. C.S.R. 11 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "WV AG uses WVCCPA authority. Healthcare-marketing-specific enforcement has been limited but private action under WVCCPA is a meaningful exposure.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "West Virginia telehealth rules apply to providers marketing to WV residents.",
      },
      {
        title: "WVCCPA private actions",
        body: "WVCCPA permits private action with attorney fees, creating exposure beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and BOM standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + WVCCPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BOM specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without WV-licensure clarity",
        why: "West Virginia telehealth rules apply to marketing to WV residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - BOM supervision rules apply.",
      "Telehealth - cross-border marketing must meet West Virginia standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - West Virginia Board of Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in West Virginia healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a West Virginia-licensed healthcare marketing attorney.",
    keywords: [
      "West Virginia healthcare marketing rules",
      "WV Board of Medicine advertising",
      "W Va CSR 11",
      "West Virginia Consumer Credit and Protection Act healthcare",
      "WV telehealth marketing",
    ],
  },
  {
    slug: "delaware",
    state: "Delaware",
    abbreviation: "DE",
    title: "Delaware Healthcare Marketing Compliance Rules - DBM and AG",
    description:
      "Delaware Board of Medical Licensure and Discipline (DBM) physician advertising rules and Delaware Consumer Fraud Act enforcement on healthcare marketing.",
    heroTagline:
      "Delaware healthcare marketing operates under DBM rules and the Consumer Fraud Act, with federal compliance as the dominant layer.",
    intro:
      "Delaware healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Delaware Board of Medical Licensure and Discipline (DBM) and the Delaware Consumer Fraud Act providing state-level authority.",
    medicalBoardName: "Delaware Board of Medical Licensure and Discipline (DBM)",
    medicalBoardFocus:
      "DBM enforces 24 Del. Admin. Code 1700 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "DE AG uses Consumer Fraud Act authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Delaware telehealth rules apply to providers marketing to DE residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "DBM enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and DBM standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + DE Consumer Fraud Act authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "DBM specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without DE-licensure clarity",
        why: "Delaware telehealth rules apply to marketing to DE residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - DBM supervision rules apply.",
      "Telehealth - cross-border marketing must meet Delaware standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Delaware Board of Dentistry and Dental Hygiene rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Delaware healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Delaware-licensed healthcare marketing attorney.",
    keywords: [
      "Delaware healthcare marketing rules",
      "Delaware Board of Medical Licensure advertising",
      "24 Del Admin Code 1700",
      "Delaware Consumer Fraud Act healthcare",
      "DE telehealth marketing",
    ],
  },
  {
    slug: "rhode-island",
    state: "Rhode Island",
    abbreviation: "RI",
    title: "Rhode Island Healthcare Marketing Compliance Rules - BMLD and AG",
    description:
      "Rhode Island Board of Medical Licensure and Discipline (BMLD) advertising rules and Rhode Island Deceptive Trade Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "Rhode Island healthcare marketing operates under BMLD rules and the Deceptive Trade Practices Act, with federal compliance as the dominant layer.",
    intro:
      "Rhode Island healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the Rhode Island Board of Medical Licensure and Discipline (BMLD) and the Rhode Island Deceptive Trade Practices Act (RIDTPA) providing state-level authority.",
    medicalBoardName: "Rhode Island Board of Medical Licensure and Discipline (BMLD)",
    medicalBoardFocus:
      "BMLD enforces 216-RICR-40 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "RI AG uses RIDTPA authority. Healthcare-marketing-specific enforcement has been limited but the authority exists.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "Rhode Island telehealth rules apply to providers marketing to RI residents.",
      },
      {
        title: "Medical specialty claim accuracy",
        body: "BMLD enforces specialty-claim standards.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and BMLD standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + RIDTPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BMLD specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without RI-licensure clarity",
        why: "Rhode Island telehealth rules apply to marketing to RI residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - BMLD supervision rules apply.",
      "Telehealth - cross-border marketing must meet Rhode Island standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - Rhode Island Board of Examiners in Dentistry rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in Rhode Island healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a Rhode Island-licensed healthcare marketing attorney.",
    keywords: [
      "Rhode Island healthcare marketing rules",
      "Rhode Island Board of Medical Licensure advertising",
      "216-RICR-40",
      "Rhode Island Deceptive Trade Practices Act healthcare",
      "RI telehealth marketing",
    ],
  },
  {
    slug: "new-hampshire",
    state: "New Hampshire",
    abbreviation: "NH",
    title: "New Hampshire Healthcare Marketing Compliance Rules - BOM and AG",
    description:
      "New Hampshire Board of Medicine (BOM) physician advertising rules and New Hampshire Consumer Protection Act enforcement on healthcare marketing.",
    heroTagline:
      "New Hampshire healthcare marketing operates under Board of Medicine rules and the Consumer Protection Act, with federal compliance as the dominant layer.",
    intro:
      "New Hampshire healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the New Hampshire Board of Medicine (BOM) and the New Hampshire Consumer Protection Act (NHCPA) providing state-level authority. NHCPA permits private action with treble damages in appropriate cases.",
    medicalBoardName: "New Hampshire Board of Medicine (BOM)",
    medicalBoardFocus:
      "NH BOM enforces N.H. Code Admin. R. Med advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "NH AG uses NHCPA authority. Healthcare-marketing-specific enforcement has been limited but private action under NHCPA is a meaningful exposure.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "New Hampshire telehealth rules apply to providers marketing to NH residents.",
      },
      {
        title: "NHCPA private actions",
        body: "NHCPA permits private action with treble damages, creating private-enforcement exposure.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and BOM standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + NHCPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "BOM specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without NH-licensure clarity",
        why: "NH telehealth rules apply to marketing to NH residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - BOM supervision rules apply.",
      "Telehealth - cross-border marketing must meet New Hampshire standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - New Hampshire Board of Dental Examiners rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in New Hampshire healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a New Hampshire-licensed healthcare marketing attorney.",
    keywords: [
      "New Hampshire healthcare marketing rules",
      "New Hampshire Board of Medicine advertising",
      "NH Code Admin R Med",
      "New Hampshire Consumer Protection Act healthcare",
      "NH telehealth marketing",
    ],
  },
  {
    slug: "new-mexico",
    state: "New Mexico",
    abbreviation: "NM",
    title: "New Mexico Healthcare Marketing Compliance Rules - NMMB and AG",
    description:
      "New Mexico Medical Board (NMMB) physician advertising rules and New Mexico Unfair Practices Act enforcement on healthcare marketing.",
    heroTagline:
      "New Mexico healthcare marketing operates under Medical Board rules and the Unfair Practices Act, with federal compliance as the dominant layer.",
    intro:
      "New Mexico healthcare marketing compliance operates primarily under federal rules - FDA and FTC - with the New Mexico Medical Board (NMMB) and the New Mexico Unfair Practices Act (UPA) providing state-level authority. UPA permits private action with attorney fees in appropriate cases.",
    medicalBoardName: "New Mexico Medical Board (NMMB)",
    medicalBoardFocus:
      "NMMB enforces NMAC 16.10 advertising provisions covering deceptive advertising, specialty claims, supervision, and testimonial standards.",
    stateAgFocus:
      "NM AG uses UPA authority. Healthcare-marketing-specific enforcement has been limited but private action under UPA is a meaningful exposure.",
    focusAreas: [
      {
        title: "Federal compliance is the primary layer",
        body: "FDA and FTC rules apply uniformly. Disease-claim, substantiation, and testimonial rules are the dominant compliance frame.",
      },
      {
        title: "Telehealth advertising rules",
        body: "New Mexico telehealth rules apply to providers marketing to NM residents.",
      },
      {
        title: "UPA private actions",
        body: "UPA permits private action with attorney fees, creating exposure beyond AG enforcement.",
      },
    ],
    watchItems: [
      {
        pattern: "Disease-treatment claims for non-FDA-approved products",
        why: "Federal FDA exposure regardless of state activity.",
      },
      {
        pattern: "Outcome guarantees on medical services",
        why: "FTC substantiation rules and NMMB standards both apply.",
      },
      {
        pattern: "Compounded GLP-1 brand-equivalence claims",
        why: "Federal FDA + UPA authority.",
      },
      {
        pattern: "Specialty misrepresentation",
        why: "NMMB specialty-claim enforcement.",
      },
      {
        pattern: "Telehealth advertising without NM-licensure clarity",
        why: "New Mexico telehealth rules apply to marketing to NM residents.",
      },
    ],
    specialtyCallouts: [
      "All specialties - federal FDA/FTC rules are the primary exposure.",
      "Med spas - NMMB supervision rules apply.",
      "Telehealth - cross-border marketing must meet New Mexico standards.",
      "Aesthetic practice - federal substantiation rules apply.",
      "Dental - New Mexico Board of Dental Health Care rules separate.",
    ],
    disclaimer:
      "This summary reflects general patterns in New Mexico healthcare marketing enforcement; it is not legal advice. For state-specific guidance on your practice, consult a New Mexico-licensed healthcare marketing attorney.",
    keywords: [
      "New Mexico healthcare marketing rules",
      "New Mexico Medical Board advertising",
      "NMAC 16.10",
      "New Mexico Unfair Practices Act healthcare",
      "NM telehealth marketing",
    ],
  },
]

export function getStateBySlug(slug: string): StateMeta | undefined {
  return STATES.find((s) => s.slug === slug)
}

export function getRelatedStates(slug: string, limit = 3): StateMeta[] {
  return STATES.filter((s) => s.slug !== slug).slice(0, limit)
}
