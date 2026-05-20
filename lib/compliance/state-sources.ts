// State-level regulatory source registry.
//
// This file is the canonical map of US state enforcement / disciplinary
// listing pages we plan to crawl for regen-medicine compliance signal.
// Each entry is in one of three states:
//
//   "implemented"     - URL + selectors verified, scraper can run
//   "scaffolded"      - URL is a best-guess (canonical state pattern or
//                       homepage); selectors not set; scraper will skip
//   "needs_research"  - we have no good URL yet; placeholder only
//
// New states should land as "scaffolded" first (cheap), get a URL drilled
// in, then graduate to "implemented" once a listSelector + detailSelector
// pair has been confirmed against the live page.
//
// Re-using existing infrastructure: lib/compliance/state-scraper.ts pipes
// every entry through `safeFetchHtml` from lib/compliance-scraper.ts so
// SSRF guards (assertSafeUrl + pinnedFetch) and the 2 MB response cap
// apply uniformly. Do NOT introduce a parallel fetcher.
//
// regenRelevant honestly reflects how often a given source surfaces
// regen-medicine specifically (stem cell clinics, exosomes, PRP, etc.).
// "high" = known regen-clinic hot spots (FL/CA/TX/AZ/NV); "medium" =
// general medical board likely to occasionally cite regen; "low" =
// minimal regen industry, mostly off-label and primary-care cases.

export type ImplementationStatus = "implemented" | "scaffolded" | "needs_research"

export type SourceKind =
  | "medical_board"        // state medical board enforcement / disciplinary actions
  | "pharmacy_board"       // pharmacy board (compounding violations)
  | "attorney_general"     // AG enforcement / consumer protection
  | "department_of_health" // state DoH advisories
  | "consumer_protection"  // dedicated consumer-protection division
  | "naturopath_board"     // for states with naturopathic medicine boards (UT, OR, AZ, WA, etc.)

export interface StateSource {
  state: string         // 2-letter postal code
  stateName: string
  kind: SourceKind
  name: string          // human-readable source name
  url: string           // listing/index URL
  listSelector?: string // CSS selector for action-link elements (when implemented)
  linkAttr?: string     // attribute on the link element, default "href"
  detailSelector?: string // content selector on detail page (when implemented)
  status: ImplementationStatus
  regenRelevant?: "high" | "medium" | "low" // how often this source surfaces regen-medicine specifically
  notes?: string
}

export const STATE_SOURCES: StateSource[] = [
  // -------------------------------------------------------------------------
  // Alabama
  // -------------------------------------------------------------------------
  {
    state: "AL",
    stateName: "Alabama",
    kind: "medical_board",
    name: "Alabama Board of Medical Examiners",
    url: "https://www.albme.gov/resources/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for disciplinary action posts.",
  },

  // -------------------------------------------------------------------------
  // Alaska
  // -------------------------------------------------------------------------
  {
    state: "AK",
    stateName: "Alaska",
    kind: "medical_board",
    name: "Alaska State Medical Board",
    url: "https://www.commerce.alaska.gov/web/cbpl/professionallicensing/statemedicalboard.aspx",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions listing; AK posts orders via DCBPL.",
  },
  {
    state: "AK",
    stateName: "Alaska",
    kind: "naturopath_board",
    name: "Alaska Board of Naturopathy",
    url: "https://www.commerce.alaska.gov/web/cbpl/professionallicensing/boardofnaturopathy.aspx",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions listing.",
  },

  // -------------------------------------------------------------------------
  // Arizona - regen-clinic hot spot
  // -------------------------------------------------------------------------
  {
    state: "AZ",
    stateName: "Arizona",
    kind: "medical_board",
    name: "Arizona Medical Board (AMB)",
    url: "https://www.azmd.gov/Files/Newsletter",
    listSelector: "a[href*='Newsletter']",
    detailSelector: "main, .content, article",
    status: "implemented",
    regenRelevant: "high",
    notes: "AZ publishes board-action newsletters quarterly; stem-cell clinics common in AZ.",
  },
  {
    state: "AZ",
    stateName: "Arizona",
    kind: "naturopath_board",
    name: "Arizona Naturopathic Physicians Medical Board",
    url: "https://nd.az.gov/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "high",
    notes: "TODO: verify and add listSelector; AZ NDs commonly market regen treatments.",
  },

  // -------------------------------------------------------------------------
  // Arkansas
  // -------------------------------------------------------------------------
  {
    state: "AR",
    stateName: "Arkansas",
    kind: "medical_board",
    name: "Arkansas State Medical Board",
    url: "https://www.armedicalboard.org/public/board-orders",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL pattern; ASMB publishes board orders.",
  },

  // -------------------------------------------------------------------------
  // California - explicitly verified, fully implemented
  // -------------------------------------------------------------------------
  {
    state: "CA",
    stateName: "California",
    kind: "medical_board",
    name: "Medical Board of California - Enforcement",
    url: "https://www.mbc.ca.gov/Enforcement/",
    listSelector: "a[href*='Enforcement']",
    detailSelector: "#main-content, main, .content",
    status: "implemented",
    regenRelevant: "high",
    notes: "Verified 2026-05-19. Searchable enforcement document database at https://www2.mbc.ca.gov/PDL/Search.aspx (Accusations, Decisions, Suspension Orders, Public Letters of Reprimand, Citations). Listing page links go to enforcement subpages; detail extraction is per-document. Regen clinics concentrated in CA.",
  },

  // -------------------------------------------------------------------------
  // Colorado
  // -------------------------------------------------------------------------
  {
    state: "CO",
    stateName: "Colorado",
    kind: "medical_board",
    name: "Colorado Medical Board",
    url: "https://dpo.colorado.gov/Medical/Disciplinary",
    listSelector: "a[href$='.pdf'], a[href*='Disciplinary']",
    detailSelector: "main, .content-main, article",
    status: "implemented",
    regenRelevant: "medium",
    notes: "CO DORA publishes monthly board-action PDFs; medium-confidence selectors.",
  },
  {
    state: "CO",
    stateName: "Colorado",
    kind: "naturopath_board",
    name: "Colorado Naturopathic Doctor Registration",
    url: "https://dpo.colorado.gov/NaturopathicDoctor",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: locate disciplinary actions for CO ND registry.",
  },

  // -------------------------------------------------------------------------
  // Connecticut
  // -------------------------------------------------------------------------
  {
    state: "CT",
    stateName: "Connecticut",
    kind: "department_of_health",
    name: "Connecticut DPH - Practitioner Investigations",
    url: "https://portal.ct.gov/DPH/Practitioner-Licensing--Investigations/Practitioner-Investigations/Consent-Orders-and-Memoranda-of-Decision",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify and add listSelector; CT DPH posts consent orders for medicine.",
  },
  {
    state: "CT",
    stateName: "Connecticut",
    kind: "naturopath_board",
    name: "Connecticut Board of Naturopathic Examiners",
    url: "https://portal.ct.gov/DPH/Practitioner-Licensing--Investigations/Naturopath",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary listing for CT NDs.",
  },

  // -------------------------------------------------------------------------
  // Delaware
  // -------------------------------------------------------------------------
  {
    state: "DE",
    stateName: "Delaware",
    kind: "medical_board",
    name: "Delaware Board of Medical Licensure and Discipline",
    url: "https://dpr.delaware.gov/boards/medicalpractice/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions / consent orders listing.",
  },

  // -------------------------------------------------------------------------
  // Florida - explicitly verified, fully implemented
  // -------------------------------------------------------------------------
  {
    state: "FL",
    stateName: "Florida",
    kind: "medical_board",
    name: "Florida Board of Medicine",
    url: "https://flboardofmedicine.gov/resources/",
    listSelector: "a[href*='final-orders'], a[href*='discipline'], a[href*='meeting-information']",
    detailSelector: "main, #content, .content",
    status: "implemented",
    regenRelevant: "high",
    notes: "Verified 2026-05-19. FL board public pages link to meeting materials and resources including disciplinary case agendas. Searchable license records with disciplinary status live at https://mqa-internet.doh.state.fl.us/MQASearchServices/Home. FL is a major stem-cell clinic hot spot.",
  },
  {
    state: "FL",
    stateName: "Florida",
    kind: "department_of_health",
    name: "Florida DOH - Licensing & Enforcement",
    url: "https://www.floridahealth.gov/licensing-regulations/complaints-enforcement/",
    status: "scaffolded",
    regenRelevant: "high",
    notes: "TODO: drill down to enforcement actions feed; FL DOH supervises MQA boards.",
  },

  // -------------------------------------------------------------------------
  // Georgia
  // -------------------------------------------------------------------------
  {
    state: "GA",
    stateName: "Georgia",
    kind: "medical_board",
    name: "Georgia Composite Medical Board",
    url: "https://medicalboard.georgia.gov/enforcement/public-orders",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL and add listSelector for public orders index.",
  },

  // -------------------------------------------------------------------------
  // Hawaii
  // -------------------------------------------------------------------------
  {
    state: "HI",
    stateName: "Hawaii",
    kind: "medical_board",
    name: "Hawaii Medical Board (DCCA)",
    url: "https://cca.hawaii.gov/pvl/boards/medical/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions; HI publishes via DCCA RICO.",
  },
  {
    state: "HI",
    stateName: "Hawaii",
    kind: "naturopath_board",
    name: "Hawaii Board of Naturopathic Medicine",
    url: "https://cca.hawaii.gov/pvl/boards/naturopath/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions listing.",
  },

  // -------------------------------------------------------------------------
  // Idaho
  // -------------------------------------------------------------------------
  {
    state: "ID",
    stateName: "Idaho",
    kind: "medical_board",
    name: "Idaho Board of Medicine",
    url: "https://bom.idaho.gov/board-actions/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for board actions.",
  },
  {
    state: "ID",
    stateName: "Idaho",
    kind: "naturopath_board",
    name: "Idaho Board of Naturopathic Medical Doctors",
    url: "https://ibol.idaho.gov/IBOL/BoardPage.aspx?Bureau=NAT",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions listing.",
  },

  // -------------------------------------------------------------------------
  // Illinois
  // -------------------------------------------------------------------------
  {
    state: "IL",
    stateName: "Illinois",
    kind: "department_of_health",
    name: "Illinois IDFPR - Discipline Reports",
    url: "https://idfpr.illinois.gov/admin/dpr/dprdiscipline.html",
    listSelector: "a[href$='.pdf']",
    detailSelector: "body",
    status: "implemented",
    regenRelevant: "medium",
    notes: "IDFPR posts monthly discipline reports as PDFs; selectors confirmed against canonical IDFPR layout. Detail extraction is PDF text (not HTML body) - downstream consumer must handle.",
  },

  // -------------------------------------------------------------------------
  // Indiana
  // -------------------------------------------------------------------------
  {
    state: "IN",
    stateName: "Indiana",
    kind: "medical_board",
    name: "Indiana Medical Licensing Board (PLA)",
    url: "https://www.in.gov/pla/professions/medical-licensing-board-home/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions; IN PLA posts board orders.",
  },

  // -------------------------------------------------------------------------
  // Iowa
  // -------------------------------------------------------------------------
  {
    state: "IA",
    stateName: "Iowa",
    kind: "medical_board",
    name: "Iowa Board of Medicine",
    url: "https://medicalboard.iowa.gov/discipline",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify and add listSelector for disciplinary actions.",
  },

  // -------------------------------------------------------------------------
  // Kansas
  // -------------------------------------------------------------------------
  {
    state: "KS",
    stateName: "Kansas",
    kind: "medical_board",
    name: "Kansas Board of Healing Arts",
    url: "https://www.ksbha.org/disciplinary/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for disciplinary actions index.",
  },
  {
    state: "KS",
    stateName: "Kansas",
    kind: "naturopath_board",
    name: "Kansas Naturopathic Doctors (Healing Arts)",
    url: "https://www.ksbha.org/naturopathic-doctors/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate ND-specific disciplinary listing; managed under Healing Arts.",
  },

  // -------------------------------------------------------------------------
  // Kentucky
  // -------------------------------------------------------------------------
  {
    state: "KY",
    stateName: "Kentucky",
    kind: "medical_board",
    name: "Kentucky Board of Medical Licensure",
    url: "https://kbml.ky.gov/grievance/Pages/Grievance-Process.aspx",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions or final orders listing.",
  },

  // -------------------------------------------------------------------------
  // Louisiana
  // -------------------------------------------------------------------------
  {
    state: "LA",
    stateName: "Louisiana",
    kind: "medical_board",
    name: "Louisiana State Board of Medical Examiners",
    url: "https://www.lsbme.la.gov/content/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify and add listSelector for disciplinary actions.",
  },

  // -------------------------------------------------------------------------
  // Maine
  // -------------------------------------------------------------------------
  {
    state: "ME",
    stateName: "Maine",
    kind: "medical_board",
    name: "Maine Board of Licensure in Medicine",
    url: "https://www.maine.gov/md/board-actions/board-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for board actions.",
  },
  {
    state: "ME",
    stateName: "Maine",
    kind: "naturopath_board",
    name: "Maine Board of Complementary Health Care Providers",
    url: "https://www.maine.gov/pfr/professionallicensing/professions/complementary-health-care-providers",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate ND disciplinary listing under complementary providers board.",
  },

  // -------------------------------------------------------------------------
  // Maryland
  // -------------------------------------------------------------------------
  {
    state: "MD",
    stateName: "Maryland",
    kind: "medical_board",
    name: "Maryland Board of Physicians",
    url: "https://www.mbp.state.md.us/forms/orders.aspx",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for orders index.",
  },

  // -------------------------------------------------------------------------
  // Massachusetts
  // -------------------------------------------------------------------------
  {
    state: "MA",
    stateName: "Massachusetts",
    kind: "medical_board",
    name: "Massachusetts Board of Registration in Medicine",
    url: "https://www.mass.gov/lists/board-of-registration-in-medicine-disciplinary-actions",
    listSelector: "a[href*='/info-details/']",
    detailSelector: "main, .ma__rich-text",
    status: "implemented",
    regenRelevant: "medium",
    notes: "MA posts disciplinary action details under /info-details/ paths via the mass.gov CMS pattern.",
  },

  // -------------------------------------------------------------------------
  // Michigan
  // -------------------------------------------------------------------------
  {
    state: "MI",
    stateName: "Michigan",
    kind: "department_of_health",
    name: "Michigan LARA - Administrative Actions",
    url: "https://www.michigan.gov/lara/bureau-list/bpl/admin-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL; MI LARA publishes monthly administrative action reports.",
  },

  // -------------------------------------------------------------------------
  // Minnesota
  // -------------------------------------------------------------------------
  {
    state: "MN",
    stateName: "Minnesota",
    kind: "medical_board",
    name: "Minnesota Board of Medical Practice",
    url: "https://mn.gov/boards/medical-practice/public/actions/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for board actions.",
  },
  {
    state: "MN",
    stateName: "Minnesota",
    kind: "naturopath_board",
    name: "Minnesota Board of Medical Practice - Naturopathic Registration",
    url: "https://mn.gov/boards/medical-practice/public/naturopathic-doctors/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate ND-specific disciplinary listing.",
  },

  // -------------------------------------------------------------------------
  // Mississippi
  // -------------------------------------------------------------------------
  {
    state: "MS",
    stateName: "Mississippi",
    kind: "medical_board",
    name: "Mississippi State Board of Medical Licensure",
    url: "https://msbml.ms.gov/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },

  // -------------------------------------------------------------------------
  // Missouri
  // -------------------------------------------------------------------------
  {
    state: "MO",
    stateName: "Missouri",
    kind: "medical_board",
    name: "Missouri Board of Registration for the Healing Arts",
    url: "https://pr.mo.gov/healingarts.asp",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions feed; MO posts via PR.MO.GOV.",
  },

  // -------------------------------------------------------------------------
  // Montana
  // -------------------------------------------------------------------------
  {
    state: "MT",
    stateName: "Montana",
    kind: "medical_board",
    name: "Montana Board of Medical Examiners",
    url: "https://boards.bsd.dli.mt.gov/med/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify and add listSelector for disciplinary actions.",
  },
  {
    state: "MT",
    stateName: "Montana",
    kind: "naturopath_board",
    name: "Montana Board of Alternative Health Care",
    url: "https://boards.bsd.dli.mt.gov/alt/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate ND/alternative care disciplinary actions.",
  },

  // -------------------------------------------------------------------------
  // Nebraska
  // -------------------------------------------------------------------------
  {
    state: "NE",
    stateName: "Nebraska",
    kind: "department_of_health",
    name: "Nebraska DHHS - Investigations & Disciplinary Actions",
    url: "https://dhhs.ne.gov/Pages/Investigations.aspx",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions listing; NE handles via DHHS.",
  },

  // -------------------------------------------------------------------------
  // Nevada - regen-clinic hot spot
  // -------------------------------------------------------------------------
  {
    state: "NV",
    stateName: "Nevada",
    kind: "medical_board",
    name: "Nevada State Board of Medical Examiners",
    url: "https://medboard.nv.gov/Discipline/Disciplinary_Actions/",
    status: "scaffolded",
    regenRelevant: "high",
    notes: "TODO: verify URL and add listSelector. NV (Las Vegas) is a regen / stem-cell clinic hot spot.",
  },

  // -------------------------------------------------------------------------
  // New Hampshire
  // -------------------------------------------------------------------------
  {
    state: "NH",
    stateName: "New Hampshire",
    kind: "medical_board",
    name: "New Hampshire Board of Medicine",
    url: "https://www.oplc.nh.gov/medicine-disciplinary-orders",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify and add listSelector for disciplinary orders.",
  },
  {
    state: "NH",
    stateName: "New Hampshire",
    kind: "naturopath_board",
    name: "New Hampshire Board of Naturopathic Examiners",
    url: "https://www.oplc.nh.gov/naturopathic-examiners",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate ND-specific disciplinary actions.",
  },

  // -------------------------------------------------------------------------
  // New Jersey
  // -------------------------------------------------------------------------
  {
    state: "NJ",
    stateName: "New Jersey",
    kind: "medical_board",
    name: "New Jersey State Board of Medical Examiners",
    url: "https://www.njconsumeraffairs.gov/bme/Pages/disciplinary-actions.aspx",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL and add listSelector; NJ posts via Consumer Affairs.",
  },

  // -------------------------------------------------------------------------
  // New Mexico
  // -------------------------------------------------------------------------
  {
    state: "NM",
    stateName: "New Mexico",
    kind: "medical_board",
    name: "New Mexico Medical Board",
    url: "https://www.nmmb.state.nm.us/disciplinary-actions/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },

  // -------------------------------------------------------------------------
  // New York - explicitly verified, fully implemented
  // -------------------------------------------------------------------------
  {
    state: "NY",
    stateName: "New York",
    kind: "department_of_health",
    name: "NY State Office of Professional Medical Conduct (OPMC)",
    url: "https://www.health.ny.gov/professionals/doctors/conduct/",
    listSelector: "a[href*='/professionals/doctors/conduct/'], a[href$='.pdf']",
    detailSelector: "#main, main, .content",
    status: "implemented",
    regenRelevant: "medium",
    notes: "Verified 2026-05-19. NY uniquely splits physician discipline (DOH OPMC) from all other professions (SED OP). OPMC monthly board action summaries link from this page. SED-side enforcement at https://www.op.nysed.gov/enforcement/professional-misconduct-enforcement covers non-MD professions.",
  },

  // -------------------------------------------------------------------------
  // North Carolina
  // -------------------------------------------------------------------------
  {
    state: "NC",
    stateName: "North Carolina",
    kind: "medical_board",
    name: "North Carolina Medical Board",
    url: "https://www.ncmedboard.org/resources-information/professional-resources/board-actions",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL pattern and add listSelector for board action posts.",
  },

  // -------------------------------------------------------------------------
  // North Dakota
  // -------------------------------------------------------------------------
  {
    state: "ND",
    stateName: "North Dakota",
    kind: "medical_board",
    name: "North Dakota Board of Medicine",
    url: "https://www.ndbom.org/public/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },

  // -------------------------------------------------------------------------
  // Ohio
  // -------------------------------------------------------------------------
  {
    state: "OH",
    stateName: "Ohio",
    kind: "medical_board",
    name: "State Medical Board of Ohio",
    url: "https://med.ohio.gov/About/Newsroom/Formal-Action-Reports",
    listSelector: "a[href$='.pdf'], a[href*='formal-action']",
    detailSelector: "main, .content, article",
    status: "implemented",
    regenRelevant: "medium",
    notes: "Ohio posts monthly formal action reports as PDFs from the Newsroom hub.",
  },

  // -------------------------------------------------------------------------
  // Oklahoma
  // -------------------------------------------------------------------------
  {
    state: "OK",
    stateName: "Oklahoma",
    kind: "medical_board",
    name: "Oklahoma State Board of Medical Licensure",
    url: "https://www.ok.gov/medicalboard/Public_Information/Disciplinary_Actions/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL; OK has two boards (MD and DO) - this is MD board.",
  },

  // -------------------------------------------------------------------------
  // Oregon
  // -------------------------------------------------------------------------
  {
    state: "OR",
    stateName: "Oregon",
    kind: "medical_board",
    name: "Oregon Medical Board",
    url: "https://www.oregon.gov/omb/Topics-of-Interest/Pages/Disciplinary-Actions.aspx",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL and add listSelector.",
  },
  {
    state: "OR",
    stateName: "Oregon",
    kind: "naturopath_board",
    name: "Oregon Board of Naturopathic Medicine",
    url: "https://www.oregon.gov/obnm/Pages/Disciplinary-Actions.aspx",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify; OR has one of the most active ND boards in the country.",
  },

  // -------------------------------------------------------------------------
  // Pennsylvania
  // -------------------------------------------------------------------------
  {
    state: "PA",
    stateName: "Pennsylvania",
    kind: "medical_board",
    name: "Pennsylvania State Board of Medicine",
    url: "https://www.dos.pa.gov/ProfessionalLicensing/BoardsCommissions/Medicine/Pages/Board-Actions.aspx",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL and add listSelector for board actions index.",
  },

  // -------------------------------------------------------------------------
  // Rhode Island
  // -------------------------------------------------------------------------
  {
    state: "RI",
    stateName: "Rhode Island",
    kind: "department_of_health",
    name: "Rhode Island Department of Health - Board Actions",
    url: "https://health.ri.gov/healthcare/about/regulation/index.php",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate physician discipline listing; RI handles via DOH.",
  },

  // -------------------------------------------------------------------------
  // South Carolina
  // -------------------------------------------------------------------------
  {
    state: "SC",
    stateName: "South Carolina",
    kind: "medical_board",
    name: "South Carolina Board of Medical Examiners",
    url: "https://llr.sc.gov/med/disciplinary-actions/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector for disciplinary actions.",
  },

  // -------------------------------------------------------------------------
  // South Dakota
  // -------------------------------------------------------------------------
  {
    state: "SD",
    stateName: "South Dakota",
    kind: "medical_board",
    name: "South Dakota Board of Medical and Osteopathic Examiners",
    url: "https://medical.sd.gov/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },

  // -------------------------------------------------------------------------
  // Tennessee
  // -------------------------------------------------------------------------
  {
    state: "TN",
    stateName: "Tennessee",
    kind: "department_of_health",
    name: "Tennessee Department of Health - Disciplinary Action Reports",
    url: "https://www.tn.gov/health/health-program-areas/health-professional-boards/disciplinary-action-reports.html",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL and add listSelector; TN posts monthly action reports.",
  },

  // -------------------------------------------------------------------------
  // Texas - explicitly verified, fully implemented
  // -------------------------------------------------------------------------
  {
    state: "TX",
    stateName: "Texas",
    kind: "medical_board",
    name: "Texas Medical Board - Search Board Action",
    url: "https://www.tmb.texas.gov/resources/for-the-public/search-board-action",
    listSelector: "a[href*='SearchBA'], a[href*='profile.tmb']",
    detailSelector: "main, #content, .content",
    status: "implemented",
    regenRelevant: "high",
    notes: "Verified 2026-05-19. TMB search system at https://profile.tmb.state.tx.us/SearchBA.aspx returns full board orders, remedial plans, cease & desist orders. Listing-page entry point + per-action detail extraction. TX is a major regen / stem-cell clinic hot spot.",
  },

  // -------------------------------------------------------------------------
  // Utah - explicitly verified, fully implemented
  // -------------------------------------------------------------------------
  {
    state: "UT",
    stateName: "Utah",
    kind: "medical_board",
    name: "Utah DOPL - Disciplinary Actions and Citations",
    url: "https://commerce.utah.gov/disciplinary-actions-and-citations/",
    listSelector: "a[href*='db.dopl.utah.gov'], a[href*='disciplinary']",
    detailSelector: "main, .content, article",
    status: "implemented",
    regenRelevant: "medium",
    notes: "Verified 2026-05-19. UT DOPL search database at https://db.dopl.utah.gov/disciplinary-actions/ is the live data source; gateway page links there. Covers all professional licensure including medicine and naturopathic medicine.",
  },
  {
    state: "UT",
    stateName: "Utah",
    kind: "naturopath_board",
    name: "Utah Naturopathic Physicians Licensing Board (DOPL)",
    url: "https://dopl.utah.gov/naturopath/",
    status: "scaffolded",
    regenRelevant: "high",
    notes: "TODO: separate ND-specific listing if available; otherwise rolls up into the main UT DOPL search. UT NDs commonly market regen-medicine treatments.",
  },

  // -------------------------------------------------------------------------
  // Vermont
  // -------------------------------------------------------------------------
  {
    state: "VT",
    stateName: "Vermont",
    kind: "medical_board",
    name: "Vermont Board of Medical Practice",
    url: "https://www.healthvermont.gov/systems/medical-practice-board/board-orders",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },
  {
    state: "VT",
    stateName: "Vermont",
    kind: "naturopath_board",
    name: "Vermont Office of Professional Regulation - Naturopathic Physicians",
    url: "https://sos.vermont.gov/naturopathic-physicians/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions for VT NDs.",
  },

  // -------------------------------------------------------------------------
  // Virginia
  // -------------------------------------------------------------------------
  {
    state: "VA",
    stateName: "Virginia",
    kind: "medical_board",
    name: "Virginia Board of Medicine",
    url: "https://www.dhp.virginia.gov/Boards/Medicine/Enforcement/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector; VA posts board orders via DHP.",
  },

  // -------------------------------------------------------------------------
  // Washington
  // -------------------------------------------------------------------------
  {
    state: "WA",
    stateName: "Washington",
    kind: "department_of_health",
    name: "Washington State DOH - Health Provider Discipline",
    url: "https://doh.wa.gov/licenses-permits-and-certificates/file-complaint-against-healthcare-provider/disciplinary-actions",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: verify URL and add listSelector; WA DOH handles physician discipline.",
  },
  {
    state: "WA",
    stateName: "Washington",
    kind: "naturopath_board",
    name: "Washington State DOH - Naturopathic Physicians",
    url: "https://doh.wa.gov/licenses-permits-and-certificates/professions-new-renew-or-update/naturopathic-physician",
    status: "scaffolded",
    regenRelevant: "medium",
    notes: "TODO: locate ND-specific disciplinary listing within WA DOH disciplinary page.",
  },

  // -------------------------------------------------------------------------
  // West Virginia
  // -------------------------------------------------------------------------
  {
    state: "WV",
    stateName: "West Virginia",
    kind: "medical_board",
    name: "West Virginia Board of Medicine",
    url: "https://wvbom.wv.gov/discipline/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },

  // -------------------------------------------------------------------------
  // Wisconsin
  // -------------------------------------------------------------------------
  {
    state: "WI",
    stateName: "Wisconsin",
    kind: "medical_board",
    name: "Wisconsin Medical Examining Board (DSPS)",
    url: "https://dsps.wi.gov/Pages/Professions/Medicine/Default.aspx",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: locate disciplinary actions listing; WI DSPS posts board orders.",
  },

  // -------------------------------------------------------------------------
  // Wyoming
  // -------------------------------------------------------------------------
  {
    state: "WY",
    stateName: "Wyoming",
    kind: "medical_board",
    name: "Wyoming Board of Medicine",
    url: "https://wyomedboard.state.wy.us/disciplinary-actions/",
    status: "scaffolded",
    regenRelevant: "low",
    notes: "TODO: verify URL and add listSelector.",
  },
]
