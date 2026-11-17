/**
 * Every visible string on the landing page lives here.
 *
 * Sources
 *   PHRONEM   copy from the existing Phronem site (~/.t3/projects/phronem, legacy/index.html
 *             and src/content/site.ts). Kept close to the original wording.
 *   PREREQ    facts taken from PREREQUISITES.md (written for Arqon; the company name here is Phronem).
 *   NEW       written for this page. Needs the founder's review before launch.
 *
 * Content rules carried over from the Phronem site
 *   - No client names, no metrics, no advisor names, no logos, no testimonials.
 *   - The five dimension weights are never published (the rings visual is deliberately equal).
 *   - External review is described as planned, not under way.
 *   - Recalibration is after approximately 200 logged decision outcomes.
 *   - Certificates are not accreditation. Nothing is described as obtained until it is.
 *   - US English. No em dashes.
 */

const email = "ibraheem@phronem.com"; // PHRONEM: the only public contact on the original site

const mailto = (subject: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

export const site = {
  name: "Phronem",
  wordmark: "phronem",
  tagline: "Structured decision support", // PHRONEM
  description:
    "Phronem helps organizations structure high-consequence decisions through a transparent methodology combining expert judgment, historical evidence, and analysis of the opposing case.", // PHRONEM
  url: "https://phronem.com",
  email,
  footerLine: "Building a more rigorous approach to enterprise decision-making.", // PHRONEM
} as const;

/** One label per intent across the page (taste skill: no duplicate CTA intent). */
export const ctas = {
  agencyBrief: { label: "Send us a brief", href: mailto("Study brief - Phronem") }, // NEW
  joinPanel: { label: "Apply as an expert", href: mailto("Expert panel application - Phronem") }, // NEW label, one per intent
  contact: { label: "Contact Us", href: "/contact" }, // NEW: the nav button
} as const;

/** Main navigation, in the order every expert-network site uses (docs/information-architecture.md). */
export const nav = [
  { href: "/#services", label: "Services", menu: "services" },
  { href: "/#clients", label: "Clients", menu: "clients" },
  { href: "/experts", label: "Experts" },
  { href: "/compliance", label: "Compliance" },
] as const;

/** NEW. Caption under the emblem that draws itself on scroll. */
export const mark = {
  caption: "Five dimensions. One vetted panel. One record.",
};

/**
 * Pinned, scroll-scrubbed statement with word tiles (reference "Control [icon] your mind").
 * Headline reworded from PHRONEM "Better strategic decisions. Built on evidence, not intuition."
 * so that "evidence." is the word that stays on screen beside the paragraph. Paragraph is PHRONEM.
 */
export const manifesto = {
  sentence: "Strategic decisions built not on intuition but on evidence.",
  lines: [
    { lead: "Strategic", tile: "orbit", tail: "decisions" },
    { lead: "built not on", tile: "rings", tail: "intuition", italic: true },
    { lead: "but on", tile: "converge", tail: "evidence." },
  ] as const,
  body: "Phronem helps organizations structure high-consequence decisions through a transparent methodology that combines expert judgment, historical evidence, and a systematic treatment of the opposing case.",
};

/** PHRONEM: the five steps from the Phronem site's "How it works". */
export const howItWorks = {
  title: "From question to record", // shortened from PHRONEM "From an open question to a record you can stand behind"
  titleLines: ["From question", "to record"], // the second line is set in grey italic, as in the reference
  intro: "Every engagement follows the same four steps, whether it ends in a panel, a meeting, an interview or a testimony.", // NEW
  // NEW. The engagement flow every expert network shows; the record's own steps live on its service page.
  steps: [
    { name: "Brief", icon: "frame", title: "Frame the question you need answered", text: "Describe the decision, matter or study, and who would know the answer." },
    { name: "Source and vet", icon: "source", title: "Experts sourced and vetted for you", text: "Found for direct experience, with identity, role and conflicts checked." },
    { name: "Engage", icon: "engage", title: "A panel, meeting or interview", text: "On compliance terms agreed with you in advance." },
    { name: "Record", icon: "record", title: "A record of what was said", text: "Agreement and dissent both kept, ready to revisit." },
  ],
  // NEW, illustrative UI pieces (the reference's looping widgets). Figures follow the fictional examples.
  widgets: {
    confidence: { value: "Moderate", label: "Confidence" }, // the sample record's confidence
    conflict: { label: "Conflict check" },
    assumption: { label: "Client growth", value: "Ahead of plan", pill: "Tracked to plan" }, // NEW, illustrative: an assumption a record is watched against
    expert: { kicker: "Expert 041", role: "Former regulator, energy markets", checks: ["ID", "Role", "Conflicts"] },
  },
} as const;

/**
 * NEW. The four-feature showcase after "From question to record" (the reference's
 * "Hyper-Personalized Imagination Sessions" section): what an engagement delivers, one feature
 * per Phronem service family, each with a looping illustrative widget. Figures are fictional.
 */
export const features = [
  {
    id: "judgment",
    title: "Independent expert judgment",
    text: "Views gathered separately, so real disagreement stays visible.",
    widget: { caption: "Elicit. Compare. Record.", pillLabel: "Views", pillValue: 9 },
  },
  {
    id: "opposing",
    title: "The opposing case, tested",
    text: "The strongest case against a recommendation, built and weighed.",
    widget: { button: "Test the counter-case" },
  },
  {
    id: "measured",
    title: "Confidence you can measure",
    text: "Stated confidence compared with outcomes as they are logged.",
    widget: { chip: "Outcome logged" },
  },
  {
    id: "current",
    title: "Records that stay current",
    text: "When an assumption changes, the record is revisited and reissued.",
    widget: { date: "14", month: "Mar 2027", day: "Friday", heading: "Assumption changed", body: "Pricing fell below plan. A new version of the record is being issued.", badge: "v2", trigger: "1 trigger met", status: "Revisiting" },
  },
] as const;

/** PHRONEM: framework. Weights are intentionally absent. */
export const framework = {
  title: "Five dimensions of decision confidence",
  intro: "Every record evaluates a recommendation across the same five dimensions.",
  items: [
    {
      name: "Expert consensus",
      text: "Assesses agreement among relevant domain experts, while preserving the areas of genuine uncertainty and disagreement rather than averaging them away.",
    },
    {
      name: "Historical base rates",
      text: "Examines how comparable situations have resolved, providing outside-view context for what should be expected.",
    },
    {
      name: "Signal alignment",
      text: "Evaluates whether the available qualitative and quantitative evidence supports the recommendation or contradicts it.",
    },
    {
      name: "Dissent analysis",
      text: "Constructs the strongest credible case against the recommendation, then tests it. A dissent that survives scrutiny lowers confidence; one that does not raises it.",
    },
    {
      name: "Input quality and recency",
      text: "Assesses the completeness, reliability, and age of the information available at the time the recommendation is produced.",
    },
  ],
};

/**
 * NEW. The hero card: an expert shortlist for a client request, the thing an expert network
 * delivers. Illustrative and labelled fictional; experts appear by role and an ID, never a name.
 */
export const heroShortlist = {
  kicker: "Expert shortlist",
  requestLabel: "Request",
  request: "UK hospital formulary decisions, six 45-minute calls",
  experts: [
    { id: "Expert 041", role: "Chief pharmacist, NHS acute trust", years: "14 yrs", status: "Scheduled" },
    { id: "Expert 117", role: "Former formulary committee chair", years: "22 yrs", status: "Vetted" },
    { id: "Expert 208", role: "Procurement lead, private hospitals", years: "9 yrs", status: "Vetted" },
    { id: "Expert 312", role: "Clinical pharmacist, oncology", years: "11 yrs", status: "In review" },
  ],
  checks: ["Identity confirmed", "Conflicts cleared", "Compliance signed"],
  progress: { done: 4, total: 6, label: "sourced" },
  caption: "Illustrative. Fictional experts.",
} as const;

/** PHRONEM: illustrative record, shown on the Decision Confidence Records page. Fictional decision, not real data. */
export const sampleRecord = {
  kicker: "Decision Confidence Record",
  caption: "Illustrative. Fictional decision, not real data.",
  decision: "Enter the Nordic market with a direct sales team in 2027",
  recommendation: "Proceed, starting with Sweden, with a 12-month review point.",
  confidence: "Moderate",
  dimensions: [
    { name: "Expert consensus", reading: "Broad agreement, two dissents kept" },
    { name: "Historical base rates", reading: "Comparable entries mostly succeeded" },
    { name: "Signal alignment", reading: "Demand supports, pricing mixed" },
    { name: "Dissent analysis", reading: "Partner-led case partly survives" },
    { name: "Input quality", reading: "Two key inputs over 12 months old" },
  ],
  changeIf: "Revisit if Swedish pricing falls below plan.",
};

/** The three audiences, shown as a sticky stack. */
export const audiences = {
  organizations: {
    id: "organizations",
    label: "For organizations",
    title: "A record of how the decision was reached, written before the outcome is known.", // PHRONEM (alternate)
    body: "Rather than delivering a single recommendation, a Decision Confidence Record documents what a recommendation rests on.", // PHRONEM
    fields: [
      "The recommended course of action",
      "The evidence supporting it",
      "The assumptions it depends on",
      "The strongest opposing case",
      "The confidence attached to it",
      "The conditions that would change it",
    ], // PHRONEM
    note: "The objective is not to replace executive judgment. It is to make the basis of a decision visible while the choice is still open.", // PHRONEM
    services: ["decision-confidence-records", "opposing-case-review", "assumption-monitoring", "in-person-meetings"],
  },
  investors: {
    id: "investors",
    label: "For investors and deal teams",
    title: "Test the thesis before the committee does.", // NEW
    body: "Independent judgments from people who have operated in the market, and the strongest case against the deal, written down before you commit.", // NEW
    questions: [
      "How strong is the target's competitive position, really?",
      "Will the market adopt this category, and when?",
      "How is the regulator likely to respond?",
      "What would the integration have to survive?",
    ], // NEW, drawn from PHRONEM service use cases
    services: ["expert-judgment-panels", "opposing-case-review", "outcome-tracking", "in-person-meetings"],
  },
  agencies: {
    id: "agencies",
    label: "For research agencies",
    title: "Verified UK healthcare professionals for your interviews.", // NEW, from PREREQ
    body: "We recruit and coordinate UK healthcare professionals for in-depth interviews. We don't design research or moderate.", // PREREQ (statement of what we do and don't do)
    points: [
      { name: "Screener-led recruitment", text: "Your screener decides who qualifies, and your quotas set the mix." },
      { name: "Verified before invitation", text: "Identity, role and experience are checked before anyone reaches your moderator." },
      { name: "Honest feasibility", text: "We say whether and how fast a study can be recruited before you commit." },
      { name: "Fair market value", text: "Honoraria pay fairly for a professional's time, and never as an incentive to prescribe." },
    ], // NEW, built from PREREQ stages 2, 3 and 6
    // NEW. Illustrative candidate summary; fictional, no real person.
    candidate: {
      kicker: "Candidate summary",
      caption: "Illustrative. Fictional participant.",
      role: "Consultant cardiologist",
      setting: "NHS hospital trust, England",
      checks: ["Identity confirmed", "Role and registration confirmed", "Screener passed", "No conflicts declared"],
      quota: "Hospital specialists, 4 of 5 filled",
    },
    cta: ctas.agencyBrief,
    services: ["healthcare-professional-recruitment"],
  },
  legal: {
    id: "legal",
    label: "For legal teams",
    title: "An independent expert, checked against every party.", // NEW
    body: "When a dispute turns on specialist knowledge, Phronem helps counsel find, vet and engage an expert with direct experience of the issues.", // PHRONEM (expert witness)
    // NEW. Illustrative conflict check; fictional matter.
    check: {
      kicker: "Conflict check",
      caption: "Illustrative. Fictional matter.",
      role: "Large software implementations",
      setting: "Contract dispute, England and Wales",
      checks: ["Checked against the claimant", "Checked against the defendant", "Prior instructions disclosed", "Available for the timetable"],
      quota: "Shortlist: 2 of 3 cleared",
    },
    points: [
      { name: "Direct experience", text: "Candidates are found for experience of the issues, not general standing in a field." },
      { name: "Their opinion, their own", text: "Experts are never asked to reach a conclusion. Their duty to the court comes first." },
    ],
    cta: { label: "Bring a live matter", href: mailto("Expert witness - Phronem") },
    services: ["expert-witness"],
  },
  experts: {
    id: "experts",
    label: "For experts",
    title: "Join the Phronem expert panel", // PHRONEM
    body: "If you have direct, senior experience in an industry, function or clinical specialty, we'd like to hear from you.", // PHRONEM, specialty added
    points: [
      { name: "Independent judgment", text: "You give your view without seeing anyone else's first, with a short written rationale." },
      { name: "Strict confidentiality", text: "You never share confidential or price-sensitive information from any employer." },
      { name: "Conflicts declared", text: "You are never asked about an organization you work for or have an interest in." },
      { name: "Paid for your time", text: "Every engagement is paid, at a fair rate for your expertise." },
    ], // PHRONEM (first three), NEW (last)
    cta: ctas.joinPanel,
  },
};

/** The panel's expertise areas (PHRONEM src/content/expertise.ts), listed on /experts. */
export { EXPERTISE_AREAS } from "./expertise";

/** Honest ledger. Status is PHRONEM; engagement items and codes are PREREQ. */
export const standards = {
  title: "Rigorous about method. Honest about stage.", // NEW
  engagement: {
    heading: "In writing before any fieldwork",
    items: [
      { name: "Confidentiality", icon: "confidentiality", hue: "lavender", text: "An NDA and supplier agreement, usually on your template." },
      { name: "Personal data", icon: "personal-data", hue: "violet", text: "A data processing agreement, plus transfer safeguards wherever UK data is accessed from abroad." },
      { name: "Adverse events", icon: "adverse-events", hue: "orchid", text: "Your named contact and reporting deadline, agreed before the first interview." },
      { name: "Full chain disclosed", icon: "full-chain", hue: "ember", text: "Every subcontractor and tool that touches your data, listed up front." },
    ],
  },
  // NEW. The card that points to the full compliance page (replaces the codes and review cards here;
  // that copy still appears on /compliance).
  complianceCard: {
    title: "Compliance, built in",
    text: "Vetting, confidentiality, conflict checks, data protection and adverse event reporting are agreed before any engagement starts. See exactly how we handle each one, the codes we work to, and what is still in preparation.",
    cta: { label: "Learn More", href: "/compliance" },
  },
  codes: {
    heading: "Codes we work to",
    items: ["BHBIA Legal and Ethical Guidelines", "EphMRA Code of Conduct", "MRS Code of Conduct"],
    note: "BHBIA training is the first step on our plan. A certificate shows a person passed a course; it does not make a company accredited, and we won't describe it that way.",
  },
  review: {
    title: "Reviewed, then recalibrated", // NEW
    figure: "200", // PHRONEM: the recalibration benchmark
    figureLabel: "logged decision outcomes before the first recalibration",
    before: "The methodology is intended to undergo external review with academic researchers and practitioners, and to be recalibrated after approximately ",
    strong: "200 logged decision outcomes",
    after: ". Revisions will be documented.",
  }, // PHRONEM
};

export const closing = {
  title: "Bring a live decision.", // PHRONEM services page
  body: "The most useful first conversation is about a real decision your organization is weighing now, with the choice still open.", // PHRONEM
};

/** NEW. In place of the stats strip other expert networks show: facts about the method and offer, not metrics. */
export const methodFacts = [
  { value: "8", label: "services, from expert panels to decision records" },
  { value: "12", label: "areas of expertise we recruit for" },
  { value: "5", label: "dimensions evaluated on every record" },
];

/** NEW. The "why us" pillars every network shows (quality, verification, compliance), plus Phronem's own. */
export const whyPhronem = {
  title: "Why work with Phronem",
  items: [
    { name: "Sourced for the question", text: "Experts are found for direct experience of the specific question in front of you." },
    { name: "Vetted before introduction", text: "Identity, role and experience are confirmed, and conflicts are checked against every organization involved." },
    { name: "Strict Compliance", text: "Before every engagement, experts confirm they will not share confidential or material non-public information." },
  ],
};

/**
 * NEW. "Clients we support" as four cards: a short description, the most relevant service, and a
 * placeholder photo from Unsplash (free licence) chosen to match each client type. Replace the
 * photos with commissioned or licensed imagery before launch. Ids keep the nav and footer anchors.
 */
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

export const clientCards = [
  {
    id: "organizations",
    label: "Boards and strategy teams",
    text: "A record of what a strategic decision rests on, written before the outcome is known.",
    service: "decision-confidence-records",
    image: { src: unsplash("photo-1573167507387-6b4b98cb7c13"), alt: "A board meeting around a long conference table, listening to a presenter" },
  },
  {
    id: "investors",
    label: "Investors and deal teams",
    text: "Independent views from people who have operated in the market, and the case against the deal.",
    service: "expert-judgment-panels",
    image: { src: unsplash("photo-1551135049-8a33b5883817"), alt: "A deal team reviewing documents together at a table" },
  },
  {
    id: "agencies",
    label: "Research agencies",
    text: "Verified UK healthcare professionals, recruited and coordinated for your interviews.",
    service: "healthcare-professional-recruitment",
    image: { src: unsplash("photo-1758691462651-611d730c5272"), alt: "A doctor wearing a stethoscope seated at her desk" },
  },
  {
    id: "legal",
    label: "Legal teams",
    text: "Independent experts with direct experience, checked for conflicts against every party.",
    service: "expert-witness",
    image: { src: unsplash("photo-1589829545856-d10d557cf95f"), alt: "A statue of Lady Justice holding scales and a sword" },
  },
] as const;

export const clientsSection = {
  title: "Clients we support", // NEW, the label every network uses
  servicesLabel: "Services for you",
};

/** NEW. The homepage band that sends experts to /experts (every network has one). */
export const expertsBand = {
  title: "Join the Phronem expert panel", // PHRONEM
  titleLines: ["Join the Phronem", "expert panel"], // second line in grey italic, the site's two-tone heading
  body: "Paid engagements on precisely framed questions, at your pace. You decide every time, and you are never asked for confidential information.",
  // NEW, illustrative: the kinds of experience the panel draws on, floating round the core.
  roles: ["Former regulator", "Hospital pharmacist", "CFO, consumer retail", "Energy markets lead", "Clinical specialist"],
  core: "Your view, kept",
  more: { label: "How it works for experts", href: "/experts" },
};

/** NEW. /experts, structured like the expert pages of IDR, GLG, Guidepoint and Silverlight. */
export const expertsPage = {
  title: "Your experience, on the questions that matter",
  lede: "If you have direct, senior experience in an industry, function or clinical specialty, Phronem can put it to work on decisions that are still open. Every engagement is paid, scoped in advance and yours to decline.",
  benefits: [
    { name: "Paid for your time", text: "Every engagement is paid, at a rate agreed before you start. There is never a fee to join." },
    { name: "You decide each time", text: "Each invitation states the topic, the time it takes and the payment. Accept or decline; there is no minimum." },
    { name: "Described by role, not name", text: "For panels, clients see your role and experience. Your name is shared only when you agree to an introduction." },
    { name: "Nothing confidential, ever", text: "You are never asked for confidential or price-sensitive information, and you can stop any engagement." },
  ],
  stepsTitle: "How it works",
  steps: [
    { name: "Apply", text: "Tell us about your experience and the areas you know first-hand." },
    { name: "Verify", text: "We confirm your identity, role and experience, and you complete a short compliance module." },
    { name: "Match", text: "When a question fits your experience and you have no conflict, we invite you, with the scope up front." },
    { name: "Engage", text: "A judgment with a short written rationale, an interview, a meeting or a longer advisory role." },
    { name: "Get paid", text: "Payment follows each completed engagement, at the rate agreed beforehand." },
  ],
  askTitle: "What we ask of you", // PHRONEM expectations
  ask: [
    { name: "Independent judgment", text: "You give your view on a specific question without seeing anyone else's first, with a short written rationale." },
    { name: "Strict confidentiality", text: "You never share confidential information from a current or former employer, or anything price-sensitive. You will be asked to confirm this every year." },
    { name: "Conflicts declared", text: "You are never asked about an organization you work for or have a declared interest in." },
    { name: "Vetting and training", text: "We confirm your identity, role and experience, and you complete a short compliance module before joining a panel." },
  ],
  whoTitle: "Who it's for",
  who: "Senior practitioners with direct experience: current and former executives, operators, clinicians, regulators and specialists. This is not a marketplace for general consulting, and not every application is accepted.",
  faqTitle: "Questions experts ask",
  faq: [
    { q: "Is there a fee to join?", a: "No. Phronem never charges experts anything." },
    { q: "How am I paid?", a: "After each completed engagement, at the rate agreed before it started. Screening questions are not paid engagements." },
    { q: "Would I be asked anything confidential?", a: "No. Every engagement is scoped in advance, and you confirm each time that you will not share confidential or material non-public information. You can decline any question." },
    { q: "Do I need my employer's permission?", a: "If your employment restricts outside consulting, don't take part without permission. Tell us about any restriction and we will respect it." },
    { q: "How are experts chosen for a project?", a: "For direct experience of the question. Anyone with a current role at, or a declared conflict with, an organization involved is excluded." },
    { q: "What happens to my data?", a: "We keep only what we need to match and pay you, and you can ask us to delete it. A full privacy notice will be published before the panel opens to applications at scale." },
  ],
  cta: ctas.joinPanel,
};

/** NEW, built from PREREQUISITES.md stages 2-5 and the PHRONEM methodology copy. Stated as commitments, not credentials. */
export const compliancePage = {
  title: "Compliance, stated plainly",
  lede: "Every engagement is set up to protect three groups: the experts who take part, the clients who rely on what they hear, and the people whose data we hold.",
  sections: [
    {
      id: "experts",
      title: "For experts",
      items: [
        "Identity, role and experience confirmed before any engagement",
        "A confirmation before every engagement: no confidential or material non-public information",
        "Conflicts declared, and anyone conflicted excluded from that engagement",
        "A compliance module before joining a panel, and a confirmation every year",
        "The right to decline any question, or stop, at any point",
      ],
    },
    {
      id: "clients",
      title: "For clients",
      items: [
        "An NDA and supplier agreement in place before any fieldwork, usually on your template",
        "Each proposed expert described by role and experience for your approval before an introduction",
        "Exclusion lists and any project-specific rules applied to every candidate",
        "Every subcontractor and tool that touches your data disclosed up front",
        "A written record of what was said, with agreement and dissent both kept",
      ],
    },
    {
      id: "employers",
      title: "For employers",
      items: [
        "Your policies on outside consulting respected; tell us and we will apply them",
        "Anyone with a current role at an organization a question concerns is excluded from it",
        `Questions go to ${email}`,
      ],
    },
    {
      id: "healthcare",
      title: "Healthcare research",
      items: [
        "Your adverse event contact and reporting deadline agreed before the first interview",
        "Blinding respected: participants are not told who the end client is unless you say so",
        "Honoraria at fair market value for a professional's time, never an incentive to prescribe",
        "No improper payments or inducements, accepted or offered",
      ],
    },
    {
      id: "data",
      title: "Personal data",
      items: [
        "Handled under UK GDPR, with a data processing agreement wherever we process data for you",
        "Transfer safeguards in place wherever UK personal data is accessed from abroad",
        "Data kept only as long as needed, and deleted on request or at the end of a project",
        "You are told quickly if anything goes wrong, so you can meet your own reporting duties",
      ],
    },
  ],
  codes: standards.codes,
  methodology: {
    id: "methodology",
    title: "Methodology and review", // PHRONEM
    intro: "Phronem's methodology is being actively developed and refined. The objective is a transparent, evidence-based framework for evaluating strategic decisions.",
    priorities: [
      "Refining confidence calibration",
      "Validating decision-quality measures",
      "Evaluating approaches to expert weighting",
      "Assessing predictive performance through longitudinal outcome tracking",
    ],
    review: standards.review,
  },
  preparing: {
    title: "In preparation",
    text: "Phronem is new. These are being written and will be reviewed professionally before we handle personal data at scale. Each is published here when it is complete.",
    items: ["Privacy notice", "Participant terms", "Information security policy", "Data retention and deletion policy", "Incident response plan", "Adverse event procedure", "Complaints procedure", "AI use policy"],
  },
};

/** NEW. GLG-style closing block: one call to action, routed by who you are. */
// Every route goes to the contact form, opened on the matching tab (?type=clients | experts)
export const closingRoutes = [
  { id: "organizations", label: "Organizations", title: "Bring a live decision.", text: closing.body, cta: { label: "Contact us", href: "/contact?type=clients" } },
  { id: "agencies", label: "Research agencies", title: "Send us a brief.", text: "Tell us who you need, how many and by when. You'll get an honest answer on feasibility before you commit.", cta: { label: ctas.agencyBrief.label, href: "/contact?type=clients" } },
  { id: "experts", label: "Experts", title: "Join the panel.", text: "Paid engagements on precisely framed questions, at your pace, and never anything confidential.", cta: { label: ctas.joinPanel.label, href: "/contact?type=experts" } },
] as const;

export const footer = {
  clients: [
    { label: "Boards and strategy teams", href: "/#organizations" },
    { label: "Investors and deal teams", href: "/#investors" },
    { label: "Research agencies", href: "/#agencies" },
    { label: "Legal teams", href: "/#legal" },
  ],
  experts: [
    { label: "Join the panel", href: "/experts" },
    { label: "How it works", href: "/experts#how" },
    { label: "Questions experts ask", href: "/experts#faq" },
  ],
  company: [
    { label: "Contact", href: "/contact" },
    { label: "Compliance", href: "/compliance" },
    { label: "Methodology", href: "/compliance#methodology" },
  ],
};

/**
 * NEW. /contact: a form with three tabs, after IDR's contact page (Clients / Experts / Learn more),
 * without its region and "how did you hear about us" questions. Fields: name, email, phone, enquiry.
 * Submissions go to /api/contact (src/app/api/contact/route.ts).
 */
export const contactPage = {
  title: "Contact us",
  lede: "Tell us what you are working on. Choose who you are, fill in the form and we will reply by email.",
  tabs: [
    {
      id: "clients",
      label: "Clients",
      intro: "Use this form for project, proposal or research enquiries.",
      introNote: "If you are an expert, for example if we have asked you to take part in a project, please use the Experts form.",
      enquiryLabel: "Your enquiry",
      enquiryHint: "The decision or project, who you need and by when",
    },
    {
      id: "experts",
      label: "Experts",
      intro: "Tell us about your experience, or ask about an engagement you have been invited to.",
      introNote: "Your question may already be answered in the expert FAQ.",
      introLink: { label: "Read the expert FAQ", href: "/experts#faq" },
      enquiryLabel: "Your message",
      enquiryHint: "Your field, your role and what you would like to ask",
    },
    {
      id: "learn-more",
      label: "Learn more",
      intro: "Want to know more about Phronem and its services? Share your details and we will be in touch.",
      enquiryLabel: "How can we help?",
      enquiryHint: "What you would like to know",
    },
  ],
  fields: { name: "Full name", email: "Email", phone: "Phone", consent: "I agree that Phronem may use these details to reply to my enquiry." },
  submit: "Submit",
  sending: "Sending",
  sent: { title: "Thank you", text: "Your message has reached us. We will reply by email." },
  error: "Your message could not be sent. Please try again, or write to us at",
};
