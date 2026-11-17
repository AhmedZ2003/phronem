# Information architecture

Studied on 2026-11-13: IDR (idr.co), Guidepoint, GLG, AlphaSights, Third Bridge, Silverlight Research.
Homepages plus their expert, compliance and services pages.

## What every expert-network site has

| Slot | Seen on | What goes in it |
|---|---|---|
| **Nav** | all six | Services ▾ · Clients ▾ (by client type) · Experts · Compliance (top level or under About) · About · primary CTA (Get started / Request a trial / Request experts) + an expert entry (Apply / Expert login) |
| **Hero** | all | One-line value prop, one primary CTA, often a stats strip |
| **Proof strip** | IDR, Guidepoint, Third Bridge, Silverlight | Network size, countries, clients, years (and logos on IDR) |
| **Services grid** | all | 5 to 6 cards, one line each, "Learn more" to a page per service (calls/interviews, surveys, advisory, in-person meetings, expert witness, reports) |
| **How it works** | IDR, GLG, Silverlight | 3 to 5 steps from brief to engagement |
| **Why us** | IDR, GLG, Guidepoint, AlphaSights | 3 to 4 pillars: quality and vetting, compliance, service, speed |
| **Clients we support** | IDR, GLG, Third Bridge, AlphaSights, Silverlight | Tabs or cards by client type, each with what that client gets |
| **Proof of work** | IDR (case studies), all but Silverlight (testimonials by role) | Case studies, quotes attributed by role |
| **Become an expert** | IDR, GLG, Guidepoint (separate page) | Pay ("set your rate", "paid for your time"), flexibility, you decide per project, steps (Register, Verify, Match, Engage, Get paid), FAQ, apply CTA |
| **Compliance** | all | Vetting and identity checks, MNPI and confidentiality, conflicts, annual training, client controls, employer policies, data protection (GDPR, ICO), codes (ESOMAR, BHBIA, MRS, EphMRA); a full page with For experts / For clients / For employers |
| **Final CTA** | all | GLG routes one form by audience: client, existing client, expert |
| **Footer** | all | Services · Clients · Company/Experts · Policies (privacy, compliance, expert terms) · registration line · affiliations |
| **Pages** | all | `/services/<service>`, `/experts`, `/compliance` |

## Phronem's version

Content rules still apply: no client names, logos, testimonials or metrics; nothing described as held
until it is. So the three proof slots are filled honestly:

| Slot | Competitors | Phronem |
|---|---|---|
| Proof strip | network size, clients, offices | Facts about the method and offer: 8 services, 12 expertise areas, 5 dimensions on every record |
| Logos | client logos | Omitted |
| Testimonials / case studies | client quotes, case studies | Omitted |

### Homepage, top to bottom

1. Hero: wordmark, tagline and an illustrative expert shortlist
2. Method strip (in place of the stats strip)
3. Emblem section (brand moment)
4. Statement (pinned, word tiles)
5. **Services**: two groups, *Expert access* and *Decision assurance*, 8 cards in a slideshow, each to its own page
6. **How an engagement works**: Brief, Source, Vet, Engage, Record
7. **Why Phronem**: three pillars
8. **Clients we support**: boards and strategy teams, investors and deal teams, healthcare research agencies, legal teams (sticky stack)
9. **For experts** band, linking to `/experts`
10. **Compliance** band, linking to `/compliance`
11. Final CTA routed by audience: organizations, research agencies, experts
12. Footer: Services · Clients · Experts · Company

### Pages

- `/services/<slug>`: lede, what's included, how it works, what you receive, typical uses, illustrative example
- `/experts`: pitch, how it works, what we ask of you, who it's for, FAQ, apply
- `/contact`: a form after IDR's (tabs Clients / Experts / Learn more; name, email, phone, enquiry, consent), posting to `/api/contact`
- `/compliance`: overview, for experts, for clients, for employers, data protection, codes and training, what's still in preparation
