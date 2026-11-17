/**
 * Services: the menu under "Services" in the header, the /services index and
 * one page per service (/services/<slug>).
 *
 * Copied from ~/.t3/projects/phronem/src/content/services.ts (unchanged there), plus
 * healthcare-professional-recruitment (NEW, from PREREQUISITES.md). `group` added for the homepage.
 * All of this copy is NEW and needs the founder's sign-off. It is built only
 * from what the original site already says Phronem does (the record, the five
 * dimensions, expert judgment, the principle that recommendations should
 * evolve, outcome tracking), plus two standard expert-network services added
 * on request: in-person meetings and expert witness. The page structure follows
 * established expert networks: a lead, what is included, how it works, sample
 * uses, an example.
 *
 * Same content rules as site.ts: no client names, no metrics, no case studies
 * presented as real, no weights, external review described as planned.
 * Examples are fictional and labelled as such.
 */

export type ServiceGroup = "access" | "assurance";

export type Service = {
  slug: string;
  /** access: putting vetted experts in front of a question. assurance: the decision-record work. */
  group: ServiceGroup;
  name: string;
  /** One line, shown in the menu and on the index cards. */
  short: string;
  lede: string;
  included: readonly string[];
  steps: readonly { name: string; text: string }[];
  receive: readonly string[];
  useCases: readonly string[];
  /** Which of the five framework dimensions the service mainly draws on. Empty when none apply. */
  draws: readonly string[];
  example: string;
  note?: { text: string; href?: string; label?: string };
  /** Replaces the closing band's title and text when the default does not fit. */
  cta?: { title: string; text: string };
};

export const servicesPage = {
  eyebrow: "Services",
  title: "Ways to work with Phronem",
  lede: "Each service brings vetted expert judgment to a high-consequence question, from a strategic decision to a legal dispute. A Decision Confidence Record combines several of them; each one can also be used on its own.",
  availability:
    "Phronem is in early design-partner conversations. Services are offered to design partners while the methodology is developed, and the way each is delivered may change as it matures.",
  ctaTitle: "Bring a live decision",
  ctaText: "The most useful first conversation is about a real decision your organization is weighing now, with the choice still open.",
};

export const services: readonly Service[] = [
  {
    // NEW, built from PREREQUISITES.md (what we do and don't do; stages 2, 3 and 6). Founder review needed.
    slug: "healthcare-professional-recruitment",
    group: "access",
    name: "Healthcare professional recruitment",
    short: "Verified UK healthcare professionals recruited and coordinated for your interviews.",
    lede: "We recruit and coordinate UK healthcare professionals for in-depth interviews. We don't design research or moderate: your team keeps the screener, the discussion guide and the interview, and we bring the right people to it.",
    included: [
      "An honest feasibility response before you commit: whether, and how fast, the sample can be recruited",
      "Recruitment against your screener and quotas, for example hospital and community pharmacists",
      "Identity, role and registration checked before anyone is invited",
      "Scheduling and reminders, coordinated around clinical working patterns",
      "Honoraria at fair market value for the professional's time, never an incentive to prescribe",
      "Your adverse event contact and reporting deadline agreed before the first interview",
    ],
    steps: [
      { name: "Brief", text: "You share who you need, how many, by when, and the screener that decides who qualifies." },
      { name: "Feasibility", text: "We say whether the sample can be recruited and how fast, with a quote and the assumptions behind it." },
      { name: "Recruit", text: "Candidates are approached and screened against your criteria and quotas." },
      { name: "Verify", text: "Each candidate's identity, role and registration are confirmed before an invitation is sent." },
      { name: "Schedule", text: "Interviews are booked with your moderators, with reminders and replacements handled." },
    ],
    receive: [
      "A feasibility response and quote",
      "A candidate summary for each participant, before the interview",
      "Scheduled interviews against your quotas, with replacements where someone drops out",
    ],
    useCases: [
      "In-depth interviews with hospital specialists",
      "Community and hospital pharmacist studies",
      "General practice and primary care research",
      "Nurse and allied health professional interviews",
      "Hard-to-reach specialists and key opinion leaders",
    ],
    draws: [],
    example:
      "An agency needs five hospital and five community pharmacists for 45-minute interviews within three weeks. Feasibility comes back the same day with a quote. Each candidate is verified before invitation, and one who no longer works in a hospital pharmacy is replaced before the interview is booked.",
    note: {
      text: "Phronem is new to this work and will say so up front. A small paid pilot with a limited scope is the honest way to start.",
      href: "/compliance",
      label: "How we handle data and safety reporting",
    },
    cta: {
      title: "Send us a brief",
      text: "Tell us who you need, how many and by when. You'll get an honest answer on feasibility before you commit to anything.",
    },
  },
  {
    slug: "decision-confidence-records",
    group: "assurance",
    name: "Decision Confidence Records",
    short: "A structured record of what a strategic recommendation rests on.",
    lede: "A complete record for one strategic decision: the recommendation, the evidence and assumptions behind it, the strongest opposing case, and the confidence attached to it, written before the outcome is known.",
    included: [
      "The decision framed precisely, with the options still open",
      "An evaluation across all five dimensions of decision confidence",
      "Independent judgments from a vetted expert panel",
      "The strongest opposing case, constructed and tested",
      "A stated confidence, and the conditions that would change it",
    ],
    steps: [
      { name: "Frame", text: "The decision is stated precisely, with the options still open and the organizations it concerns identified." },
      { name: "Elicit", text: "Independent judgments from a scored panel, elicited separately and aggregated." },
      { name: "Test", text: "Historical base rates, the available evidence and the strongest opposing case are tested against the recommendation." },
      { name: "Score", text: "The recommendation is evaluated across the five dimensions, and a confidence is attached to it." },
      { name: "Issue", text: "The record is issued as a numbered version, so later revisions never overwrite what was known at the time." },
    ],
    receive: [
      "The recommended course of action",
      "The evidence supporting it",
      "The assumptions it depends on",
      "The strongest opposing case",
      "The confidence attached to the recommendation",
      "The conditions that would change it",
    ],
    useCases: ["Market entry", "Acquisitions and divestments", "Major capital allocation", "Regulatory response", "Strategic partnerships"],
    draws: ["Expert consensus", "Historical base rates", "Signal alignment", "Dissent analysis", "Input quality and recency"],
    example:
      "A board weighing direct entry into the Nordic market receives a record recommending it proceed, starting with Sweden, at moderate confidence. The partner-led alternative is documented as the strongest counter-case, with the conditions under which it would win.",
    note: { text: "See the illustrative record on the home page.", href: "#record", label: "View the example" },
  },
  {
    slug: "expert-judgment-panels",
    group: "access",
    name: "Expert judgment panels",
    short: "Independent judgments from vetted experts, elicited separately and aggregated.",
    lede: "Experts with direct experience of the kind of decision at hand give independent judgments on precisely framed questions. Each view is elicited separately, so genuine disagreement stays visible instead of being averaged away.",
    included: [
      "A panel selected for direct experience of the decision, with conflicted experts excluded",
      "Questions framed precisely enough to be compared later with what happens",
      "Each judgment given without seeing anyone else's first, with a short written rationale",
      "Agreement and dissent reported side by side, not averaged into one number",
    ],
    steps: [
      { name: "Define", text: "The questions the decision turns on are written down, each one specific enough to be resolved later." },
      { name: "Select", text: "Panel members are chosen for relevant experience. Anyone with a current role at, or a declared conflict with, an organization the decision concerns is excluded." },
      { name: "Elicit", text: "Each expert answers separately, without seeing other answers, and explains their reasoning." },
      { name: "Aggregate", text: "Judgments are combined into a consensus reading, with the range of views and the dissenting rationales kept." },
      { name: "Keep", text: "Every judgment is stored and later compared with the outcome, so panel reliability can be measured." },
    ],
    receive: [
      "A consensus reading, with the full range of views",
      "Dissenting rationales, kept in substance and anonymized",
      "The panel's composition, described by role and experience rather than by name",
    ],
    useCases: [
      "Judging how a regulator is likely to respond",
      "Testing whether a market will adopt a new category",
      "Assessing an acquisition target's competitive position",
      "Estimating when a technology shift will arrive",
      "Checking an internal forecast against outside experience",
    ],
    draws: ["Expert consensus", "Dissent analysis"],
    example:
      "Nine experts with regulatory experience are asked, separately, whether a licensing change will happen within 18 months. Six expect it and three do not. The three dissenting rationales stay in the record, because they describe what the decision would have to survive.",
    note: {
      text: "Every panel member is vetted, completes compliance training and confirms they will not share confidential or price-sensitive information.",
      href: "/experts",
      label: "How the panel works",
    },
  },
  {
    slug: "in-person-meetings",
    group: "access",
    name: "In-person meetings",
    short: "Vetted experts meeting your team face to face, for a working session, briefing or site visit.",
    lede: "Some questions are best worked through in the room. A vetted expert, or a small group of them, meets your team in person: for a working session on a live decision, a briefing for a board, or a visit to a site, facility or industry event.",
    included: [
      "Experts selected for direct experience of the question, with conflicts checked before any introduction",
      "The purpose, agenda and questions agreed in advance",
      "Scheduling and travel arranged around your team",
      "A written summary of the session, with agreement and disagreement both kept",
      "The same compliance terms as every engagement, including no sharing of confidential or price-sensitive information",
    ],
    steps: [
      { name: "Scope", text: "The purpose, format, location and the questions for the session are agreed." },
      { name: "Select", text: "Experts are chosen for relevant experience and checked for conflicts. You approve each one before an introduction." },
      { name: "Prepare", text: "The agenda and any briefing material are shared in advance, limited to what the expert may properly receive." },
      { name: "Meet", text: "The session runs in person. Phronem can attend to keep a record of what was said." },
      { name: "Summarize", text: "A written summary follows, with each view and the reasons behind it kept, including dissent." },
    ],
    receive: [
      "A shortlist of experts, described by role and experience, for your approval",
      "A confirmed agenda and arrangements",
      "A written session summary, with agreement and dissent recorded",
    ],
    useCases: [
      "Board and investment committee briefings",
      "Strategy workshops on a live decision",
      "Site and facility visits",
      "Meetings alongside an industry conference",
      "Sessions with several experts who see a question differently",
    ],
    draws: ["Expert consensus", "Dissent analysis"],
    example:
      "Before approving a new plant, an investment committee spends half a day with two experts who have run comparable facilities. One expects the build schedule to hold; the other expects permitting to add a year. The summary keeps both views and the reasons behind them.",
    note: {
      text: "Every expert is vetted, completes compliance training and confirms they will not share confidential or price-sensitive information.",
      href: "/experts",
      label: "How the panel works",
    },
  },
  {
    slug: "expert-witness",
    group: "access",
    name: "Expert witness",
    short: "Independent experts for litigation, arbitration and regulatory proceedings.",
    lede: "When a dispute turns on specialist knowledge, it needs an expert with direct experience of the issues who can give an independent opinion and explain it clearly. Phronem helps legal teams find, vet and engage that expert.",
    included: [
      "A search for experts with direct, relevant experience of the issues in the matter",
      "Conflict checks against every party to the dispute before any introduction",
      "Short calls with candidates, so counsel can assess them before instructing anyone",
      "Support through engagement, from scoping the instruction to agreeing terms",
      "Experts who can consult, write reports and give evidence, as the matter requires",
    ],
    steps: [
      { name: "Brief", text: "Counsel describes the matter, the questions for an expert, the parties involved and the timetable." },
      { name: "Search", text: "Candidates are identified for direct experience of the issues, not general standing in a field." },
      { name: "Check", text: "Each candidate is checked for conflicts with every party and confirms they are available for the timetable." },
      { name: "Introduce", text: "Counsel speaks with shortlisted candidates before deciding whom to instruct." },
      { name: "Engage", text: "The expert is instructed by counsel on agreed terms. Their opinion remains their own." },
    ],
    receive: [
      "A shortlist describing each candidate's relevant experience and any prior testimony they disclose",
      "A completed conflict check for each candidate",
      "An introduction to, and engagement terms for, the expert counsel chooses",
    ],
    useCases: [
      "Commercial and contract disputes",
      "International arbitration",
      "Intellectual property disputes",
      "Regulatory and competition investigations",
      "Damages and valuation questions",
    ],
    draws: [],
    example:
      "Counsel in a contract dispute over a delayed logistics system needs an expert in large software implementations. Three candidates are checked against both parties. One is excluded for a past consulting role with the defendant, and counsel speaks with the other two before instructing one.",
    note: {
      text: "Experts are never asked to reach a particular conclusion. Their opinion is their own, and their duty to the court or tribunal comes first. Phronem does not give legal advice.",
    },
    cta: {
      title: "Bring a live matter",
      text: "The most useful first conversation is about a matter in progress: the issues an expert would address, the parties involved and the timetable.",
    },
  },
  {
    slug: "opposing-case-review",
    group: "assurance",
    name: "Opposing-case review",
    short: "The strongest credible case against a recommendation, built and tested.",
    lede: "Before a recommendation is acted on, the strongest credible case against it is constructed and tested. A dissent that survives scrutiny lowers confidence; one that does not raises it.",
    included: [
      "A review of an existing recommendation, from your team or your advisers",
      "The strongest credible counter-case, written out in full",
      "Each part of the counter-case tested against the evidence and comparable situations",
      "A clear finding on which parts survive, and what that means for confidence",
    ],
    steps: [
      { name: "Receive", text: "The recommendation and the material behind it are reviewed as they stand." },
      { name: "Construct", text: "The strongest credible case against it is built, as a serious alternative rather than a list of objections." },
      { name: "Test", text: "Each part of the counter-case is tested against the evidence, historical base rates and expert judgment." },
      { name: "Report", text: "What survives is stated plainly, with its effect on confidence and what would change the finding." },
    ],
    receive: [
      "The opposing case, in writing",
      "A finding for each part of it: survives, partly survives or does not survive",
      "The effect on confidence, and the conditions that would change it",
    ],
    useCases: [
      "Before a board approves an acquisition",
      "When an internal recommendation has faced little challenge",
      "When advisers have an interest in the decision proceeding",
      "Before committing to a major capital project",
      "When a regulator or investor may later ask what alternatives were considered",
    ],
    draws: ["Dissent analysis", "Historical base rates", "Signal alignment"],
    example:
      "A recommendation to enter a market with a direct sales team is tested against a partner-led entry. The partner-led case partly survives: it remains the stronger option if a local partner already holds an anchor client, so that becomes a condition in the record.",
  },
  {
    slug: "assumption-monitoring",
    group: "assurance",
    name: "Assumption monitoring",
    short: "Records revisited when the assumptions behind them materially change.",
    lede: "Markets shift. Regulation changes. Competitors move. Assumption monitoring keeps a record current: the assumptions a decision depends on are watched, and when one materially changes, the record is revisited and a new version issued.",
    included: [
      "Each assumption stated, with what would count as a material change",
      "Periodic review of the evidence behind each assumption",
      "A revisited record, issued as a new version, when an assumption breaks",
      "Every earlier version kept, so the history of the decision stays visible",
    ],
    steps: [
      { name: "List", text: "The assumptions the recommendation depends on are taken from the record and written down one by one." },
      { name: "Set triggers", text: "For each assumption, the change that would matter is defined in advance." },
      { name: "Review", text: "The evidence behind each assumption is checked at agreed intervals and when events suggest it." },
      { name: "Revisit", text: "When a trigger is met, the record is revisited and a new version is issued alongside the old one." },
    ],
    receive: [
      "A register of assumptions, each with its trigger",
      "A new record version whenever a trigger is met",
      "The full version history of the decision",
    ],
    useCases: [
      "Market entry programs that run over several years",
      "Acquisitions during integration",
      "Capital projects with long build times",
      "Strategies exposed to pending regulation",
      "Partnerships with agreed review points",
    ],
    draws: ["Input quality and recency", "Signal alignment"],
    example:
      "A record assumed that prices in its first market would hold at plan. When prices fell below plan, the trigger was met: the record was revisited and a new version issued at lower confidence, with the original kept beside it.",
  },
  {
    slug: "outcome-tracking",
    group: "assurance",
    name: "Decision outcome tracking",
    short: "Outcomes logged against what was expected, so decision quality can be measured.",
    lede: "What was expected when a decision was taken is compared with what actually happened. Across a run of decisions, that shows whether the stated confidence was earned and which inputs proved reliable.",
    included: [
      "The expected outcome and confidence recorded when the decision is taken",
      "Outcomes logged at the review points set in the record",
      "Stated confidence compared with what happened",
      "Expert judgments scored against outcomes, so panel reliability can be measured",
    ],
    steps: [
      { name: "Record", text: "The expected outcome, the confidence and the review dates are fixed when the decision is taken." },
      { name: "Log", text: "At each review point, what actually happened is logged against what was expected." },
      { name: "Compare", text: "Stated confidence is compared with outcomes, decision by decision and, over time, across decisions." },
      { name: "Learn", text: "What the comparison shows feeds into the methodology, and every revision is documented." },
    ],
    receive: [
      "An outcome log for each decision",
      "A calibration view across decisions as they accumulate",
      "Documented changes to the methodology, where the evidence supports them",
    ],
    useCases: [
      "Investment committees reviewing their own track record",
      "Boards that want to learn from past strategic decisions",
      "Strategy teams comparing forecasts with results",
      "Organizations answerable for how past decisions were made",
      "Repeated decisions of the same kind, such as successive market entries",
    ],
    draws: ["Expert consensus", "Historical base rates"],
    example:
      "A committee recorded a dozen decisions at high confidence. As outcomes are logged, the comparison shows whether that confidence was earned, or whether the committee tends to overstate it.",
    note: {
      text: "Measuring calibration needs a run of decisions. Phronem plans to recalibrate elements of the framework after approximately 200 logged decision outcomes.",
      href: "/compliance#methodology",
      label: "About the methodology",
    },
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const serviceHref = (s: Pick<Service, "slug">) => `/services/${s.slug}`;

export const serviceGroups: { id: ServiceGroup; title: string; text: string }[] = [
  { id: "access", title: "Expert access", text: "Vetted experts in front of your question: panels, meetings, interviews and testimony." },
  { id: "assurance", title: "Decision assurance", text: "A written record of what a decision rests on, tested, kept current and measured." },
];

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=75`;

/**
 * NEW. Placeholder photos, one per service (Unsplash, free licence), shown as the banner on each
 * service page and on its "More in …" card. Replace with Phronem's own images when available.
 */
export const serviceImages: Record<string, { src: string; alt: string }> = {
  "healthcare-professional-recruitment": { src: unsplash("photo-1580281657527-47f249e8f4df"), alt: "A pharmacist in a white coat reaching for a medicine box on a pharmacy shelf" },
  "decision-confidence-records": { src: unsplash("photo-1554224155-1696413565d3"), alt: "A stack of printed papers seen from above" },
  "expert-judgment-panels": { src: unsplash("photo-1772690445981-78b22eacda4b"), alt: "A panel of speakers seated at a table in front of an audience" },
  "in-person-meetings": { src: unsplash("photo-1515187029135-18ee286d815b"), alt: "People in a meeting room talking around a table" },
  "expert-witness": { src: unsplash("photo-1568092806323-8ec13dfa9b92"), alt: "The interior of a wood-panelled courtroom" },
  "opposing-case-review": { src: unsplash("photo-1586165368502-1bad197a6461"), alt: "A black and a white chess knight facing each other on a board" },
  "assumption-monitoring": { src: unsplash("photo-1551288049-bebda4e38f71"), alt: "Performance graphs on a laptop screen" },
  "outcome-tracking": { src: unsplash("photo-1586448317606-cb1ec00298fc"), alt: "A rising line graph on a dark screen" },
};
